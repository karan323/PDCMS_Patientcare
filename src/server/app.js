const express = require("express");
const path = require("node:path");
const {
  buildSessionUser,
  createAuthToken,
  createPasswordHash,
  readBearerToken,
  validateStaffLoginPayload,
  validateStaffRegistrationPayload,
  verifyAuthToken,
  verifyPasswordHash
} = require("./auth");
const { isValidDate, normalizeAdmissionSearchFilters, validateAdmissionPayload } = require("./validation");

const parseLimit = value => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 10;
  }

  return Math.min(parsed, 50);
};

const isTruthy = value => {
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

const createApp = ({ workloadStore, admissionStore, staffUserStore, storageKind }) => {
  const app = express();
  const rootDirectory = process.cwd();
  const sourceDirectory = path.join(rootDirectory, "src");
  const sendHtmlPage = fileName => (_request, response) => {
    response.sendFile(path.join(rootDirectory, fileName));
  };
  const allowedOrigins = String(process.env.CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

  app.use(express.json({ limit: "250kb" }));
  app.use("/src", express.static(sourceDirectory));
  app.use((request, response, next) => {
    const origin = request.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      response.setHeader("Access-Control-Allow-Origin", origin);
      response.setHeader("Vary", "Origin");
      response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
      response.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }

    if (request.method === "OPTIONS") {
      response.sendStatus(origin && allowedOrigins.includes(origin) ? 204 : 403);
      return;
    }

    next();
  });

  const requireStaffSession = async (request, response, next) => {
    const token = readBearerToken(request);
    const payload = verifyAuthToken(token);

    if (!payload) {
      response.status(401).json({ error: "Staff login is required." });
      return;
    }

    const staffUser = await staffUserStore.getById(payload.sub);
    if (!staffUser) {
      response.status(401).json({ error: "Staff session is no longer valid." });
      return;
    }

    request.staffSession = {
      token,
      user: buildSessionUser(staffUser)
    };
    next();
  };

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok", storage: storageKind });
  });

  app.post("/api/auth/register", async (request, response) => {
    const result = validateStaffRegistrationPayload(request.body || {});
    if (result.errors) {
      response.status(400).json({ error: result.errors.join(" ") });
      return;
    }

    const existingStaffUser = await staffUserStore.getByEmail(result.value.email);
    if (existingStaffUser) {
      response.status(409).json({ error: "An account already exists for that email." });
      return;
    }

    const staffUser = await staffUserStore.create({
      fullName: result.value.fullName,
      email: result.value.email,
      role: result.value.role,
      passwordHash: createPasswordHash(result.value.password)
    });

    const user = buildSessionUser(staffUser);
    response.status(201).json({
      token: createAuthToken(user),
      user
    });
  });

  app.post("/api/auth/login", async (request, response) => {
    const result = validateStaffLoginPayload(request.body || {});
    if (result.errors) {
      response.status(400).json({ error: result.errors.join(" ") });
      return;
    }

    const staffUser = await staffUserStore.getByEmail(result.value.email);
    if (!staffUser || !verifyPasswordHash(result.value.password, staffUser.passwordHash)) {
      response.status(401).json({ error: "Email or password is incorrect." });
      return;
    }

    if (staffUser.role !== result.value.role) {
      response.status(403).json({ error: "Select the staff profile used for this account." });
      return;
    }

    const user = buildSessionUser(staffUser);
    response.json({
      token: createAuthToken(user),
      user
    });
  });

  app.get("/api/auth/session", requireStaffSession, async (request, response) => {
    response.json({
      user: request.staffSession.user
    });
  });

  app.post("/api/auth/logout", (_request, response) => {
    response.json({ ok: true });
  });

  app.get("/api/dashboard/summary", requireStaffSession, async (_request, response) => {
    const summary = await admissionStore.getSummary();
    response.json(summary);
  });

  app.get("/api/workloads", requireStaffSession, async (request, response) => {
    const { date } = request.query;
    if (typeof date !== "string" || !isValidDate(date)) {
      response.status(400).json({ error: "A valid date query is required in YYYY-MM-DD format." });
      return;
    }

    const items = await workloadStore.listByDate(date);
    response.json({ date, items });
  });

  app.post("/api/workloads", requireStaffSession, async (request, response) => {
    const { date, text } = request.body || {};
    if (typeof date !== "string" || !isValidDate(date)) {
      response.status(400).json({ error: "A valid date is required in YYYY-MM-DD format." });
      return;
    }

    if (typeof text !== "string" || !text.trim()) {
      response.status(400).json({ error: "Task text is required." });
      return;
    }

    const item = await workloadStore.create({ date, text: text.trim() });
    response.status(201).json(item);
  });

  app.patch("/api/workloads/:id", requireStaffSession, async (request, response) => {
    const { id } = request.params;
    const { done } = request.body || {};

    if (typeof done !== "boolean") {
      response.status(400).json({ error: "A boolean done value is required." });
      return;
    }

    const item = await workloadStore.update({ id, done });
    if (!item) {
      response.status(404).json({ error: "Workload item not found." });
      return;
    }

    response.json(item);
  });

  app.get("/api/admissions", requireStaffSession, async (request, response) => {
    const result = normalizeAdmissionSearchFilters(request.query);
    if (result.errors) {
      response.status(400).json({ error: result.errors.join(" ") });
      return;
    }

    const filters = result.value;
    const shouldLoadAll = isTruthy(request.query.all);
    const hasSearchCriteria = Object.values(filters).some(Boolean);
    const items = await admissionStore.list({
      ...filters,
      limit: shouldLoadAll || hasSearchCriteria ? null : parseLimit(request.query.limit)
    });

    response.json({ items });
  });

  app.get("/api/admissions/:id", requireStaffSession, async (request, response) => {
    const item = await admissionStore.getById(request.params.id);
    if (!item) {
      response.status(404).json({ error: "Admission not found." });
      return;
    }

    response.json(item);
  });

  app.post("/api/admissions", requireStaffSession, async (request, response) => {
    const result = validateAdmissionPayload(request.body || {});
    if (result.errors) {
      response.status(400).json({ error: result.errors.join(" ") });
      return;
    }

    const item = await admissionStore.create(result.value);
    response.status(201).json(item);
  });

  app.patch("/api/admissions/:id", requireStaffSession, async (request, response) => {
    const existingItem = await admissionStore.getById(request.params.id);
    if (!existingItem) {
      response.status(404).json({ error: "Admission not found." });
      return;
    }

    const result = validateAdmissionPayload(request.body || {}, {
      existingIdentifiers: {
        patientId: existingItem.patientId,
        admissionId: existingItem.admissionId
      }
    });
    if (result.errors) {
      response.status(400).json({ error: result.errors.join(" ") });
      return;
    }

    const item = await admissionStore.update({
      id: request.params.id,
      admission: result.value
    });

    response.json(item);
  });

  app.get(["/login", "/login.html", "/create-account", "/create-account.html"], sendHtmlPage("login.html"));
  app.get("/", sendHtmlPage("index.html"));
  app.get(["/patients", "/patients.html"], sendHtmlPage("patients.html"));
  app.get(/^(?!\/api|\/src).*/, sendHtmlPage("index.html"));

  app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({ error: "Internal server error." });
  });

  return app;
};

module.exports = { createApp };
