const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");

const { createApp } = require("../src/server/app");
const { FileAdmissionStore } = require("../src/server/store/fileAdmissionStore");
const { FileWorkloadStore } = require("../src/server/store/fileWorkloadStore");

const createTestServer = async () => {
  const tempDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "pdcms-api-"));
  const workloadStore = new FileWorkloadStore(path.join(tempDirectory, "workloads.json"));
  const admissionStore = new FileAdmissionStore(path.join(tempDirectory, "admissions.json"));
  await Promise.all([workloadStore.initialize(), admissionStore.initialize()]);

  const app = createApp({
    workloadStore,
    admissionStore,
    storageKind: "file-test"
  });

  const server = app.listen(0);
  await new Promise(resolve => server.once("listening", resolve));

  const port = server.address().port;

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: async () => {
      await new Promise(resolve => server.close(resolve));
      await fs.rm(tempDirectory, { recursive: true, force: true });
    }
  };
};

test("health endpoint exposes service status", async () => {
  const context = await createTestServer();

  try {
    const response = await fetch(`${context.baseUrl}/api/health`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.status, "ok");
    assert.equal(payload.storage, "file-test");
  } finally {
    await context.close();
  }
});

test("workload flow persists checklist items by date", async () => {
  const context = await createTestServer();

  try {
    const createdResponse = await fetch(`${context.baseUrl}/api/workloads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: "2026-04-12",
        text: "Review discharge summary"
      })
    });
    const created = await createdResponse.json();

    assert.equal(createdResponse.status, 201);
    assert.equal(created.done, false);

    const updateResponse = await fetch(`${context.baseUrl}/api/workloads/${created.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: true })
    });
    const updated = await updateResponse.json();

    assert.equal(updateResponse.status, 200);
    assert.equal(updated.done, true);

    const listResponse = await fetch(`${context.baseUrl}/api/workloads?date=2026-04-12`);
    const listed = await listResponse.json();

    assert.equal(listResponse.status, 200);
    assert.equal(listed.items.length, 1);
    assert.equal(listed.items[0].done, true);
  } finally {
    await context.close();
  }
});

test("admission flow saves a record and updates dashboard summary", async () => {
  const context = await createTestServer();

  try {
    const createResponse = await fetch(`${context.baseUrl}/api/admissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Taylor Reed",
        admissionDate: "2026-04-12",
        department: "Cardiology",
        status: "Discharge planned",
        age: 41,
        doctor: "Dr. Karim"
      })
    });
    const admission = await createResponse.json();

    assert.equal(createResponse.status, 201);
    assert.equal(admission.fullName, "Taylor Reed");
    assert.match(admission.patientId, /^PT-/);
    assert.match(admission.admissionId, /^ADM-/);

    const listResponse = await fetch(`${context.baseUrl}/api/admissions?limit=5`);
    const listed = await listResponse.json();

    assert.equal(listResponse.status, 200);
    assert.equal(listed.items.length, 1);
    assert.equal(listed.items[0].doctor, "Dr. Karim");

    const summaryResponse = await fetch(`${context.baseUrl}/api/dashboard/summary`);
    const summary = await summaryResponse.json();

    assert.equal(summaryResponse.status, 200);
    assert.equal(summary.admittedPatients, 1);
    assert.equal(summary.dischargePlanned, 1);
  } finally {
    await context.close();
  }
});

test("admission validation rejects incomplete payloads", async () => {
  const context = await createTestServer();

  try {
    const response = await fetch(`${context.baseUrl}/api/admissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "",
        admissionDate: "2026-04-12"
      })
    });
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.match(payload.error, /Department is required/);
  } finally {
    await context.close();
  }
});

test("cors preflight allows configured frontend origins", async () => {
  const previousOrigins = process.env.CORS_ALLOWED_ORIGINS;
  process.env.CORS_ALLOWED_ORIGINS = "https://frontend.example.com";

  const context = await createTestServer();

  try {
    const response = await fetch(`${context.baseUrl}/api/admissions`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://frontend.example.com",
        "Access-Control-Request-Method": "POST"
      }
    });

    assert.equal(response.status, 204);
    assert.equal(response.headers.get("access-control-allow-origin"), "https://frontend.example.com");
    assert.match(response.headers.get("access-control-allow-methods") || "", /POST/);
  } finally {
    if (previousOrigins === undefined) {
      delete process.env.CORS_ALLOWED_ORIGINS;
    } else {
      process.env.CORS_ALLOWED_ORIGINS = previousOrigins;
    }

    await context.close();
  }
});
