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
        doctor: "Dr. Karim",
        assignedNurse: "Nurse Priya",
        reportVisibleToPatient: true
      })
    });
    const admission = await createResponse.json();

    assert.equal(createResponse.status, 201);
    assert.equal(admission.fullName, "Taylor Reed");
    assert.match(admission.patientId, /^PT-/);
    assert.match(admission.admissionId, /^ADM-/);
    assert.equal(admission.assignedNurse, "Nurse Priya");
    assert.equal(admission.reportVisibleToPatient, true);

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

test("admission flow supports editing an existing record", async () => {
  const context = await createTestServer();

  try {
    const createResponse = await fetch(`${context.baseUrl}/api/admissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: "AB1234",
        admissionId: "ADM4321",
        fullName: "Karan Mistry",
        admissionDate: "2026-04-12",
        department: "Cardiology",
        status: "Observation",
        doctor: "Dr. Raven"
      })
    });
    const created = await createResponse.json();

    assert.equal(createResponse.status, 201);

    const updateResponse = await fetch(`${context.baseUrl}/api/admissions/${created.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: "AB1234",
        admissionId: "ADM4321",
        fullName: "Karan Mistry Updated",
        age: 32,
        gender: "Male",
        dateOfBirth: "1994-02-18",
        mobileNumber: "5550102030",
        address: "45 Updated Street",
        emergencyContact: "Family Contact",
        bloodGroup: "B+",
        insuranceProfileType: "Private insurance",
        admissionDate: "2026-04-15",
        admissionTime: "10:30",
        department: "Neurology",
        ward: "B1",
        room: "204",
        bedNumber: "B-2",
        doctor: "Dr. Nair",
        diagnosis: "Updated diagnosis",
        allergies: "Penicillin",
        status: "Stable",
        assignedNurse: "Nurse Asha",
        activityDate: "2026-04-16",
        consultTime: "14:15",
        reportVisibleToPatient: true,
        notePatientFacing: true,
        approvalFlow: "Head nurse review pending"
      })
    });
    const updated = await updateResponse.json();

    assert.equal(updateResponse.status, 200);
    assert.equal(updated.fullName, "Karan Mistry Updated");
    assert.equal(updated.department, "Neurology");
    assert.equal(updated.doctor, "Dr. Nair");
    assert.equal(updated.admissionDate, "2026-04-15");
    assert.equal(updated.assignedNurse, "Nurse Asha");
    assert.equal(updated.reportVisibleToPatient, true);

    const detailResponse = await fetch(`${context.baseUrl}/api/admissions/${created.id}`);
    const detail = await detailResponse.json();

    assert.equal(detailResponse.status, 200);
    assert.equal(detail.fullName, "Karan Mistry Updated");
    assert.equal(detail.mobileNumber, "5550102030");
    assert.equal(detail.status, "Stable");
    assert.equal(detail.activityDate, "2026-04-16");
    assert.equal(detail.consultTime, "14:15");
    assert.equal(detail.notePatientFacing, true);
    assert.equal(detail.approvalFlow, "Head nurse review pending");
  } finally {
    await context.close();
  }
});

test("admission list supports loading all records and structured server-side filters", async () => {
  const context = await createTestServer();

  try {
    const firstCreateResponse = await fetch(`${context.baseUrl}/api/admissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: "AB1234",
        fullName: "Taylor Reed",
        admissionDate: "2026-04-12",
        department: "Cardiology",
        status: "Stable",
        doctor: "Dr. Karim"
      })
    });

    const secondCreateResponse = await fetch(`${context.baseUrl}/api/admissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId: "CD5678",
        fullName: "Morgan Lee",
        admissionDate: "2026-04-13",
        department: "Neurology",
        status: "Observation",
        doctor: "Dr. Nair"
      })
    });

    assert.equal(firstCreateResponse.status, 201);
    assert.equal(secondCreateResponse.status, 201);

    const allResponse = await fetch(`${context.baseUrl}/api/admissions?all=true`);
    const allPayload = await allResponse.json();

    assert.equal(allResponse.status, 200);
    assert.equal(allPayload.items.length, 2);

    const defaultSearchResponse = await fetch(`${context.baseUrl}/api/admissions?q=morgan`);
    const defaultSearchPayload = await defaultSearchResponse.json();

    assert.equal(defaultSearchResponse.status, 200);
    assert.equal(defaultSearchPayload.items.length, 1);
    assert.equal(defaultSearchPayload.items[0].fullName, "Morgan Lee");

    const patientIdFilterResponse = await fetch(`${context.baseUrl}/api/admissions?patientId=AB1234`);
    const patientIdFilterPayload = await patientIdFilterResponse.json();

    assert.equal(patientIdFilterResponse.status, 200);
    assert.equal(patientIdFilterPayload.items.length, 1);
    assert.equal(patientIdFilterPayload.items[0].fullName, "Taylor Reed");

    const doctorFilterResponse = await fetch(`${context.baseUrl}/api/admissions?doctor=nair`);
    const doctorFilterPayload = await doctorFilterResponse.json();

    assert.equal(doctorFilterResponse.status, 200);
    assert.equal(doctorFilterPayload.items.length, 1);
    assert.equal(doctorFilterPayload.items[0].fullName, "Morgan Lee");

    const singleDateFilterResponse = await fetch(`${context.baseUrl}/api/admissions?entryDate=2026-04-12`);
    const singleDateFilterPayload = await singleDateFilterResponse.json();

    assert.equal(singleDateFilterResponse.status, 200);
    assert.equal(singleDateFilterPayload.items.length, 1);
    assert.equal(singleDateFilterPayload.items[0].fullName, "Taylor Reed");

    const rangeFilterResponse = await fetch(
      `${context.baseUrl}/api/admissions?entryDateFrom=2026-04-12&entryDateTo=2026-04-13`
    );
    const rangeFilterPayload = await rangeFilterResponse.json();

    assert.equal(rangeFilterResponse.status, 200);
    assert.equal(rangeFilterPayload.items.length, 2);

    const unsupportedDefaultSearchResponse = await fetch(`${context.baseUrl}/api/admissions?q=neurology`);
    const unsupportedDefaultSearchPayload = await unsupportedDefaultSearchResponse.json();

    assert.equal(unsupportedDefaultSearchResponse.status, 200);
    assert.equal(unsupportedDefaultSearchPayload.items.length, 0);

    const broadDepartmentSearchResponse = await fetch(`${context.baseUrl}/api/admissions?q=*neurology`);
    const broadDepartmentSearchPayload = await broadDepartmentSearchResponse.json();

    assert.equal(broadDepartmentSearchResponse.status, 200);
    assert.equal(broadDepartmentSearchPayload.items.length, 1);
    assert.equal(broadDepartmentSearchPayload.items[0].fullName, "Morgan Lee");

    const broadDoctorSearchResponse = await fetch(`${context.baseUrl}/api/admissions?q=*karim`);
    const broadDoctorSearchPayload = await broadDoctorSearchResponse.json();

    assert.equal(broadDoctorSearchResponse.status, 200);
    assert.equal(broadDoctorSearchPayload.items.length, 1);
    assert.equal(broadDoctorSearchPayload.items[0].fullName, "Taylor Reed");
  } finally {
    await context.close();
  }
});

test("admission list rejects invalid entry date combinations", async () => {
  const context = await createTestServer();

  try {
    const response = await fetch(`${context.baseUrl}/api/admissions?entryDate=2026-04-12&entryDateTo=2026-04-13`);
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.match(payload.error, /Use either a single entry date or a date range/);
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
