const crypto = require("node:crypto");

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
        status TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
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

  async list({ query = "", limit = null } = {}) {
    const normalizedQuery = String(query || "").trim();
    const parameters = [];
    const conditions = [];

    if (normalizedQuery) {
      parameters.push(`%${normalizedQuery}%`);
      conditions.push(`
        (
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
        )
      `);
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
          status,
          created_at AS "createdAt"
        FROM admissions
        ${conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""}
        ORDER BY created_at DESC
        ${limitClause}
      `,
      parameters
    );

    return result.rows;
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
          status,
          created_at AS "createdAt"
        FROM admissions
        WHERE id = $1
      `,
      [id]
    );

    return result.rows[0] || null;
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
          status
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
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
        admission.status
      ]
    );

    return result.rows[0];
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
