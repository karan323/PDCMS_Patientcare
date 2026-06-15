const crypto = require("node:crypto");

const isFilled = value => String(value ?? "").trim().length > 0;
const isPendingReport = report => report && !["Available", "Reviewed"].includes(String(report.reportStatus || ""));
const isTodayOrFuture = value => {
  const normalized = String(value || "").slice(0, 10);
  return normalized && normalized >= new Date().toISOString().slice(0, 10);
};

const buildSummary = admissions => {
  const pendingReports = admissions.reduce(
    (count, item) => count + (Array.isArray(item.reports) ? item.reports.filter(isPendingReport).length : isPendingReport(item) ? 1 : 0),
    0
  );
  const abnormalReports = admissions.reduce(
    (count, item) =>
      count +
      (Array.isArray(item.reports)
        ? item.reports.filter(report => report.reportAbnormalFlag || report.reportStatus === "Abnormal / urgent").length
        : item.reportAbnormalFlag || item.reportStatus === "Abnormal / urgent"
          ? 1
          : 0),
    0
  );
  const dueMedicationTasks = admissions.filter(item => item.medicineName && item.medStatus !== "Stopped").length;
  const upcomingConsults = admissions.filter(item => isTodayOrFuture(item.consultDate)).length;
  const dailyNoteUpdatesNeeded = admissions.filter(item => !isFilled(item.activityDate) || !isFilled(item.progressNotes)).length;
  const vitalsMonitoringDue = admissions.filter(item => !item.vitalsRecorded).length;
  const priorityPatients = admissions.filter(
    item =>
      item.status === "Critical" ||
      item.status === "Isolation" ||
      item.activityExceptionFlag ||
      item.reportAbnormalFlag ||
      (Array.isArray(item.reports) && item.reports.some(report => report.reportAbnormalFlag))
  ).length;
  const dischargeFollowUps = admissions.filter(
    item => item.status === "Discharge planned" || isFilled(item.followUpDate) || isFilled(item.followUpReminderDate)
  ).length;
  const dischargeBlockers = admissions.filter(item => isFilled(item.dischargeBlockers)).length;
  const portalSetupPending = admissions.filter(item => item.caregiverAuthorized && !isFilled(item.patientPortalPassword)).length;
  const unresolvedAlerts =
    pendingReports +
    abnormalReports +
    dueMedicationTasks +
    upcomingConsults +
    dailyNoteUpdatesNeeded +
    vitalsMonitoringDue +
    priorityPatients +
    dischargeBlockers;
  const alerts = [
    abnormalReports > 0 && { severity: "critical", message: `${abnormalReports} abnormal or urgent report item(s) need review.` },
    dueMedicationTasks > 0 && { severity: "due", message: `${dueMedicationTasks} active medication workflow(s) need MAR review.` },
    dailyNoteUpdatesNeeded > 0 && { severity: "due", message: `${dailyNoteUpdatesNeeded} patient record(s) need daily activity or progress notes.` },
    dischargeBlockers > 0 && { severity: "critical", message: `${dischargeBlockers} discharge record(s) have unresolved blockers.` },
    portalSetupPending > 0 && { severity: "info", message: `${portalSetupPending} caregiver portal setup(s) need credential review.` }
  ].filter(Boolean);

  return {
    admittedPatients: admissions.length,
    dischargePlanned: admissions.filter(item => item.status === "Discharge planned").length,
    pendingReports,
    abnormalReports,
    dueMedicationTasks,
    upcomingConsults,
    dailyNoteUpdatesNeeded,
    vitalsMonitoringDue,
    priorityPatients,
    dischargeFollowUps,
    dischargeBlockers,
    portalSetupPending,
    unresolvedAlerts,
    alerts
  };
};

const CORE_FIELDS = new Set([
  "patientId",
  "admissionId",
  "fullName",
  "age",
  "gender",
  "dateOfBirth",
  "mobileNumber",
  "address",
  "emergencyContact",
  "bloodGroup",
  "insuranceProfileType",
  "admissionDate",
  "admissionTime",
  "department",
  "ward",
  "room",
  "bedNumber",
  "doctor",
  "diagnosis",
  "allergies",
  "status"
]);

const buildExtraData = admission =>
  Object.fromEntries(Object.entries(admission).filter(([key]) => !CORE_FIELDS.has(key)));

const flattenAdmissionRow = row => {
  const extraData =
    row.extraData && typeof row.extraData === "object" && !Array.isArray(row.extraData) ? row.extraData : {};

  return {
    ...row,
    ...extraData,
    extraData: undefined
  };
};

class PostgresAdmissionStore {
  constructor(pool) {
    this.pool = pool;
  }

  async initialize() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS admissions (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        admission_id TEXT NOT NULL,
        full_name TEXT NOT NULL,
        age INTEGER,
        gender TEXT,
        date_of_birth DATE,
        mobile_number TEXT,
        address TEXT,
        emergency_contact TEXT,
        blood_group TEXT,
        insurance_profile_type TEXT,
        admission_date DATE NOT NULL,
        admission_time TEXT,
        department TEXT NOT NULL,
        ward TEXT,
        room TEXT,
        bed_number TEXT,
        doctor TEXT,
        diagnosis TEXT,
        allergies TEXT,
        extra_data JSONB NOT NULL DEFAULT '{}'::jsonb,
        status TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await this.pool.query(`
      ALTER TABLE admissions
      ADD COLUMN IF NOT EXISTS extra_data JSONB NOT NULL DEFAULT '{}'::jsonb
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS admissions_created_at_idx
      ON admissions (created_at DESC)
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS admissions_status_idx
      ON admissions (status)
    `);
  }

  async listRecent(limit = 10) {
    return this.list({ limit });
  }

  async list({
    query = "",
    queryMode = "default",
    patientId = null,
    fullName = null,
    doctor = null,
    mobileNumber = null,
    entryDate = null,
    entryDateFrom = null,
    entryDateTo = null,
    limit = null
  } = {}) {
    const normalizedQuery = String(query || "").trim();
    const normalizedQueryMode = queryMode === "broad" ? "broad" : "default";
    const normalizedPatientId = String(patientId || "").trim();
    const normalizedFullName = String(fullName || "").trim();
    const normalizedDoctor = String(doctor || "").trim();
    const normalizedMobile = String(mobileNumber || "").trim();
    const normalizedEntryDate = String(entryDate || "").trim();
    const normalizedEntryDateFrom = String(entryDateFrom || "").trim();
    const normalizedEntryDateTo = String(entryDateTo || "").trim();
    const parameters = [];
    const conditions = [];

    if (normalizedQuery) {
      parameters.push(`%${normalizedQuery}%`);
      conditions.push(`
        (
          ${
            normalizedQueryMode === "broad"
              ? `
          patient_id ILIKE $${parameters.length}
          OR admission_id ILIKE $${parameters.length}
          OR full_name ILIKE $${parameters.length}
          OR COALESCE(mobile_number, '') ILIKE $${parameters.length}
          OR department ILIKE $${parameters.length}
          OR COALESCE(doctor, '') ILIKE $${parameters.length}
          OR status ILIKE $${parameters.length}
          OR COALESCE(ward, '') ILIKE $${parameters.length}
          OR COALESCE(room, '') ILIKE $${parameters.length}
          OR COALESCE(bed_number, '') ILIKE $${parameters.length}
          OR COALESCE(diagnosis, '') ILIKE $${parameters.length}
          OR COALESCE(allergies, '') ILIKE $${parameters.length}
          OR COALESCE(address, '') ILIKE $${parameters.length}
          OR COALESCE(emergency_contact, '') ILIKE $${parameters.length}
          OR COALESCE(insurance_profile_type, '') ILIKE $${parameters.length}
          OR COALESCE(blood_group, '') ILIKE $${parameters.length}
          OR CAST(admission_date AS TEXT) ILIKE $${parameters.length}
                `
              : `
          patient_id ILIKE $${parameters.length}
          OR admission_id ILIKE $${parameters.length}
          OR full_name ILIKE $${parameters.length}
                `
          }
        )
      `);
    }

    if (normalizedPatientId) {
      parameters.push(`%${normalizedPatientId}%`);
      conditions.push(`patient_id ILIKE $${parameters.length}`);
    }

    if (normalizedFullName) {
      parameters.push(`%${normalizedFullName}%`);
      conditions.push(`full_name ILIKE $${parameters.length}`);
    }

    if (normalizedDoctor) {
      parameters.push(`%${normalizedDoctor}%`);
      conditions.push(`COALESCE(doctor, '') ILIKE $${parameters.length}`);
    }

    if (normalizedMobile) {
      parameters.push(`%${normalizedMobile}%`);
      conditions.push(`COALESCE(mobile_number, '') ILIKE $${parameters.length}`);
    }

    if (normalizedEntryDate) {
      parameters.push(normalizedEntryDate);
      conditions.push(`admission_date = $${parameters.length}::date`);
    }

    if (normalizedEntryDateFrom && normalizedEntryDateTo) {
      parameters.push(normalizedEntryDateFrom);
      const fromIndex = parameters.length;
      parameters.push(normalizedEntryDateTo);
      const toIndex = parameters.length;
      conditions.push(`admission_date BETWEEN $${fromIndex}::date AND $${toIndex}::date`);
    }

    let limitClause = "";
    if (Number.isInteger(limit) && limit > 0) {
      parameters.push(limit);
      limitClause = `LIMIT $${parameters.length}`;
    }

    const result = await this.pool.query(
      `
        SELECT
          id,
          patient_id AS "patientId",
          admission_id AS "admissionId",
          full_name AS "fullName",
          age,
          gender,
          date_of_birth AS "dateOfBirth",
          mobile_number AS "mobileNumber",
          address,
          emergency_contact AS "emergencyContact",
          blood_group AS "bloodGroup",
          insurance_profile_type AS "insuranceProfileType",
          admission_date AS "admissionDate",
          admission_time AS "admissionTime",
          department,
          ward,
          room,
          bed_number AS "bedNumber",
          doctor,
          diagnosis,
          allergies,
          extra_data AS "extraData",
          status,
          created_at AS "createdAt"
        FROM admissions
        ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
        ORDER BY created_at DESC
        ${limitClause}
      `,
      parameters
    );

    return result.rows.map(flattenAdmissionRow);
  }

  async getById(id) {
    const result = await this.pool.query(
      `
        SELECT
          id,
          patient_id AS "patientId",
          admission_id AS "admissionId",
          full_name AS "fullName",
          age,
          gender,
          date_of_birth AS "dateOfBirth",
          mobile_number AS "mobileNumber",
          address,
          emergency_contact AS "emergencyContact",
          blood_group AS "bloodGroup",
          insurance_profile_type AS "insuranceProfileType",
          admission_date AS "admissionDate",
          admission_time AS "admissionTime",
          department,
          ward,
          room,
          bed_number AS "bedNumber",
          doctor,
          diagnosis,
          allergies,
          extra_data AS "extraData",
          status,
          created_at AS "createdAt"
        FROM admissions
        WHERE id = $1
      `,
      [id]
    );

    return result.rows[0] ? flattenAdmissionRow(result.rows[0]) : null;
  }

  async create(admission) {
    const id = crypto.randomUUID();
    const result = await this.pool.query(
      `
        INSERT INTO admissions (
          id,
          patient_id,
          admission_id,
          full_name,
          age,
          gender,
          date_of_birth,
          mobile_number,
          address,
          emergency_contact,
          blood_group,
          insurance_profile_type,
          admission_date,
          admission_time,
          department,
          ward,
          room,
          bed_number,
          doctor,
          diagnosis,
          allergies,
          extra_data,
          status
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22::jsonb, $23
        )
        RETURNING
          id,
          patient_id AS "patientId",
          admission_id AS "admissionId",
          full_name AS "fullName",
          age,
          gender,
          date_of_birth AS "dateOfBirth",
          mobile_number AS "mobileNumber",
          address,
          emergency_contact AS "emergencyContact",
          blood_group AS "bloodGroup",
          insurance_profile_type AS "insuranceProfileType",
          admission_date AS "admissionDate",
          admission_time AS "admissionTime",
          department,
          ward,
          room,
          bed_number AS "bedNumber",
          doctor,
          diagnosis,
          allergies,
          extra_data AS "extraData",
          status,
          created_at AS "createdAt"
      `,
      [
        id,
        admission.patientId,
        admission.admissionId,
        admission.fullName,
        admission.age,
        admission.gender,
        admission.dateOfBirth,
        admission.mobileNumber,
        admission.address,
        admission.emergencyContact,
        admission.bloodGroup,
        admission.insuranceProfileType,
        admission.admissionDate,
        admission.admissionTime,
        admission.department,
        admission.ward,
        admission.room,
        admission.bedNumber,
        admission.doctor,
        admission.diagnosis,
        admission.allergies,
        JSON.stringify(buildExtraData(admission)),
        admission.status
      ]
    );

    return flattenAdmissionRow(result.rows[0]);
  }

  async update({ id, admission }) {
    const result = await this.pool.query(
      `
        UPDATE admissions
        SET
          patient_id = $2,
          admission_id = $3,
          full_name = $4,
          age = $5,
          gender = $6,
          date_of_birth = $7,
          mobile_number = $8,
          address = $9,
          emergency_contact = $10,
          blood_group = $11,
          insurance_profile_type = $12,
          admission_date = $13,
          admission_time = $14,
          department = $15,
          ward = $16,
          room = $17,
          bed_number = $18,
          doctor = $19,
          diagnosis = $20,
          allergies = $21,
          extra_data = $22::jsonb,
          status = $23
        WHERE id = $1
        RETURNING
          id,
          patient_id AS "patientId",
          admission_id AS "admissionId",
          full_name AS "fullName",
          age,
          gender,
          date_of_birth AS "dateOfBirth",
          mobile_number AS "mobileNumber",
          address,
          emergency_contact AS "emergencyContact",
          blood_group AS "bloodGroup",
          insurance_profile_type AS "insuranceProfileType",
          admission_date AS "admissionDate",
          admission_time AS "admissionTime",
          department,
          ward,
          room,
          bed_number AS "bedNumber",
          doctor,
          diagnosis,
          allergies,
          extra_data AS "extraData",
          status,
          created_at AS "createdAt"
      `,
      [
        id,
        admission.patientId,
        admission.admissionId,
        admission.fullName,
        admission.age,
        admission.gender,
        admission.dateOfBirth,
        admission.mobileNumber,
        admission.address,
        admission.emergencyContact,
        admission.bloodGroup,
        admission.insuranceProfileType,
        admission.admissionDate,
        admission.admissionTime,
        admission.department,
        admission.ward,
        admission.room,
        admission.bedNumber,
        admission.doctor,
        admission.diagnosis,
        admission.allergies,
        JSON.stringify(buildExtraData(admission)),
        admission.status
      ]
    );

    return result.rows[0] ? flattenAdmissionRow(result.rows[0]) : null;
  }

  async getSummary() {
    return buildSummary(await this.list({ limit: null }));
  }

  async appendAuditEvent({ id, event }) {
    const existingItem = await this.getById(id);
    if (!existingItem) {
      return null;
    }

    return this.update({
      id,
      admission: {
        ...existingItem,
        auditEvents: [...(existingItem.auditEvents || []), event]
      }
    });
  }
}

module.exports = { PostgresAdmissionStore };
