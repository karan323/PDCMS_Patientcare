const express = require("express");
const path = require("node:path");
const {
  buildSessionUser,
  createAuthToken,
  createPasswordHash,
  isHeadAdminRole,
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

const normalizeComparable = value => String(value ?? "").trim().toLowerCase();
const isFilled = value => String(value ?? "").trim().length > 0;

const HISTORY_FIELDS = [
  "diagnosis",
  "provisionalDiagnosis",
  "finalDiagnosis",
  "treatmentPlan",
  "treatmentNotes",
  "diagnosisUpdate",
  "careConditionSummary",
  "clinicalObservations",
  "dietInstructions",
  "precautions",
  "progressNotes",
  "remarks",
  "nursingUpdate",
  "doctorRounds",
  "staffNotes",
  "doctorNotes",
  "handoverNotes",
  "dischargeSummary",
  "dischargeMedication",
  "reviewInstructions"
];

const createAuditEvent = (request, eventType, details = {}) => ({
  eventType,
  timestamp: new Date().toISOString(),
  userId: request.staffSession?.user?.id || null,
  userName: request.staffSession?.user?.fullName || null,
  userRole: request.staffSession?.user?.role || null,
  ...details
});

const buildFieldHistory = ({ existingItem, nextItem, request }) =>
  HISTORY_FIELDS.reduce((events, field) => {
    const previousValue = existingItem?.[field] ?? null;
    const nextValue = nextItem?.[field] ?? null;

    if (String(previousValue ?? "") === String(nextValue ?? "")) {
      return events;
    }

    if (!isFilled(previousValue) && !isFilled(nextValue)) {
      return events;
    }

    events.push({
      eventType: "field_change",
      field,
      previousValue,
      nextValue,
      timestamp: new Date().toISOString(),
      userId: request.staffSession?.user?.id || null,
      userName: request.staffSession?.user?.fullName || null,
      userRole: request.staffSession?.user?.role || null
    });

    return events;
  }, []);

const buildAdmissionConflictError = ({ admissions, admission, excludeId = null }) => {
  const patientId = normalizeComparable(admission.patientId);
  const admissionId = normalizeComparable(admission.admissionId);
  const mobileNumber = normalizeComparable(admission.mobileNumber);
  const dateOfBirth = normalizeComparable(admission.dateOfBirth);
  const fullName = normalizeComparable(admission.fullName);
  const ward = normalizeComparable(admission.ward);
  const room = normalizeComparable(admission.room);
  const bedNumber = normalizeComparable(admission.bedNumber);
  const appointmentDoctor = normalizeComparable(admission.appointmentDoctor);
  const appointmentDate = normalizeComparable(admission.appointmentDate);
  const appointmentTime = normalizeComparable(admission.appointmentTime);

  for (const item of admissions) {
    if (excludeId && item.id === excludeId) {
      continue;
    }

    if (patientId && normalizeComparable(item.patientId) === patientId) {
      return "A patient record already exists with this patient ID.";
    }

    if (admissionId && normalizeComparable(item.admissionId) === admissionId) {
      return "An admission record already exists with this admission ID.";
    }

    if (
      fullName &&
      mobileNumber &&
      dateOfBirth &&
      normalizeComparable(item.fullName) === fullName &&
      normalizeComparable(item.mobileNumber) === mobileNumber &&
      normalizeComparable(item.dateOfBirth) === dateOfBirth
    ) {
      return "Possible duplicate patient found using name, phone, and date of birth.";
    }

    if (
      room &&
      bedNumber &&
      normalizeComparable(item.room) === room &&
      normalizeComparable(item.bedNumber) === bedNumber &&
      (!ward || normalizeComparable(item.ward) === ward) &&
      item.status !== "Discharge planned"
    ) {
      return "Room and bed are already assigned to another active inpatient record.";
    }

    if (
      appointmentDoctor &&
      appointmentDate &&
      appointmentTime &&
      normalizeComparable(item.appointmentDoctor) === appointmentDoctor &&
      normalizeComparable(item.appointmentDate) === appointmentDate &&
      normalizeComparable(item.appointmentTime) === appointmentTime
    ) {
      return "A follow-up appointment already exists for this provider at the selected date and time.";
    }
  }

  return null;
};

const createApp = ({ workloadStore, admissionStore, staffUserStore, storageKind }) => {
  const app = express();
  const rootDirectory = process.cwd();
  const sourceDirectory = path.join(rootDirectory, "src");
  const loginAttempts = new Map();
  const lockoutAttemptLimit = Number.parseInt(process.env.AUTH_LOCKOUT_ATTEMPTS || "5", 10);
  const lockoutMs = Number.parseInt(process.env.AUTH_LOCKOUT_MINUTES || "15", 10) * 60 * 1000;
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

  const getOptionalSessionUser = async request => {
    const token = readBearerToken(request);
    const payload = verifyAuthToken(token);

    if (!payload) {
      return null;
    }

    const staffUser = await staffUserStore.getById(payload.sub);
    return staffUser ? buildSessionUser(staffUser) : null;
  };

  const canCreateStaffAccount = async (request, registration) => {
    const staffCount = typeof staffUserStore.count === "function" ? await staffUserStore.count() : 0;

    if (staffCount === 0) {
      return isHeadAdminRole(registration.role)
        ? { allowed: true }
        : { allowed: false, error: "Create a Head Admin account before adding other staff profiles." };
    }

    const sessionUser = await getOptionalSessionUser(request);
    if (sessionUser && isHeadAdminRole(sessionUser.role)) {
      return { allowed: true };
    }

    if (!registration.adminEmail || !registration.adminPassword) {
      return { allowed: false, error: "Head Admin email and password are required to create staff accounts." };
    }

    const adminUser = await staffUserStore.getByEmail(registration.adminEmail);
    if (
      !adminUser ||
      !isHeadAdminRole(adminUser.role) ||
      !verifyPasswordHash(registration.adminPassword, adminUser.passwordHash)
    ) {
      return { allowed: false, error: "Head Admin authorization failed." };
    }

    return { allowed: true };
  };

  const readLockout = email => {
    const entry = loginAttempts.get(email);
    if (!entry?.lockedUntil) {
      return null;
    }

    if (entry.lockedUntil <= Date.now()) {
      loginAttempts.delete(email);
      return null;
    }

    return entry;
  };

  const recordFailedLogin = email => {
    const entry = loginAttempts.get(email) || { count: 0, lockedUntil: null };
    const nextCount = entry.count + 1;

    loginAttempts.set(email, {
      count: nextCount,
      lockedUntil: nextCount >= lockoutAttemptLimit ? Date.now() + lockoutMs : null
    });
  };

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok", storage: storageKind });
  });

  app.post("/api/admin/reset-staff", async (request, response) => {
    const resetToken = process.env.ADMIN_RESET_TOKEN;
    if (!resetToken || request.body?.token !== resetToken) {
      response.status(403).json({ error: "Forbidden." });
      return;
    }
    await staffUserStore.deleteAll();
    response.json({ ok: true, message: "All staff accounts cleared." });
  });

  app.post("/api/auth/register", async (request, response) => {
    const result = validateStaffRegistrationPayload(request.body || {});
    if (result.errors) {
      response.status(400).json({ error: result.errors.join(" ") });
      return;
    }

    const authorization = await canCreateStaffAccount(request, result.value);
    if (!authorization.allowed) {
      response.status(403).json({ error: authorization.error });
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

    const lockout = readLockout(result.value.email);
    if (lockout) {
      response.status(423).json({ error: "Account is temporarily locked after repeated failed login attempts." });
      return;
    }

    const staffUser = await staffUserStore.getByEmail(result.value.email);
    if (!staffUser || !verifyPasswordHash(result.value.password, staffUser.passwordHash)) {
      recordFailedLogin(result.value.email);
      response.status(401).json({ error: "Email or password is incorrect." });
      return;
    }

    if (staffUser.role !== result.value.role) {
      recordFailedLogin(result.value.email);
      response.status(403).json({ error: "Select the staff profile used for this account." });
      return;
    }

    loginAttempts.delete(result.value.email);
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
    let item = await admissionStore.getById(request.params.id);
    if (!item) {
      response.status(404).json({ error: "Admission not found." });
      return;
    }

    if (typeof admissionStore.appendAuditEvent === "function") {
      item =
        (await admissionStore.appendAuditEvent({
          id: request.params.id,
          event: createAuditEvent(request, "access", { objectType: "admission" })
        })) || item;
    }

    response.json(item);
  });

  app.post("/api/admissions", requireStaffSession, async (request, response) => {
    const result = validateAdmissionPayload(request.body || {});
    if (result.errors) {
      response.status(400).json({ error: result.errors.join(" ") });
      return;
    }

    const conflictError = buildAdmissionConflictError({
      admissions: await admissionStore.list({ limit: null }),
      admission: result.value
    });
    if (conflictError) {
      response.status(409).json({ error: conflictError });
      return;
    }

    const item = await admissionStore.create({
      ...result.value,
      auditEvents: [
        createAuditEvent(request, "create", {
          objectType: "admission",
          patientId: result.value.patientId,
          admissionId: result.value.admissionId
        })
      ],
      fieldHistory: buildFieldHistory({ existingItem: {}, nextItem: result.value, request })
    });
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
        admissionId: existingItem.admissionId,
        patientPortalUsername: existingItem.patientPortalUsername,
        patientPortalPassword: existingItem.patientPortalPassword,
        patientPortalCredentialsGeneratedAt: existingItem.patientPortalCredentialsGeneratedAt
      }
    });
    if (result.errors) {
      response.status(400).json({ error: result.errors.join(" ") });
      return;
    }

    const conflictError = buildAdmissionConflictError({
      admissions: await admissionStore.list({ limit: null }),
      admission: result.value,
      excludeId: request.params.id
    });
    if (conflictError) {
      response.status(409).json({ error: conflictError });
      return;
    }

    const fieldHistory = buildFieldHistory({ existingItem, nextItem: result.value, request });
    const item = await admissionStore.update({
      id: request.params.id,
      admission: {
        ...result.value,
        auditEvents: [
          ...(existingItem.auditEvents || []),
          createAuditEvent(request, "edit", {
            objectType: "admission",
            patientId: result.value.patientId,
            admissionId: result.value.admissionId,
            changedFields: fieldHistory.map(event => event.field)
          })
        ],
        fieldHistory: [...(existingItem.fieldHistory || []), ...fieldHistory]
      }
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
