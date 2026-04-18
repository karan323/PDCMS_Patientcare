const crypto = require("node:crypto");

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
    const result = await this.pool.query(`
      SELECT
        COUNT(*)::int AS "admittedPatients",
        COUNT(*) FILTER (WHERE status = 'Discharge planned')::int AS "dischargePlanned"
      FROM admissions
    `);

    return result.rows[0];
  }
}

module.exports = { PostgresAdmissionStore };
