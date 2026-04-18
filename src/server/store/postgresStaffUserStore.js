const crypto = require("node:crypto");

class PostgresStaffUserStore {
  constructor(pool) {
    this.pool = pool;
  }

  async initialize() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS staff_users (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await this.pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS staff_users_email_idx
      ON staff_users (email)
    `);
  }

  async create(staffUser) {
    const id = crypto.randomUUID();
    const result = await this.pool.query(
      `
        INSERT INTO staff_users (
          id,
          full_name,
          email,
          role,
          password_hash
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id,
          full_name AS "fullName",
          email,
          role,
          password_hash AS "passwordHash",
          created_at AS "createdAt"
      `,
      [id, staffUser.fullName, staffUser.email, staffUser.role, staffUser.passwordHash]
    );

    return result.rows[0];
  }

  async getByEmail(email) {
    const result = await this.pool.query(
      `
        SELECT
          id,
          full_name AS "fullName",
          email,
          role,
          password_hash AS "passwordHash",
          created_at AS "createdAt"
        FROM staff_users
        WHERE email = $1
      `,
      [email]
    );

    return result.rows[0] || null;
  }

  async getById(id) {
    const result = await this.pool.query(
      `
        SELECT
          id,
          full_name AS "fullName",
          email,
          role,
          password_hash AS "passwordHash",
          created_at AS "createdAt"
        FROM staff_users
        WHERE id = $1
      `,
      [id]
    );

    return result.rows[0] || null;
  }
}

module.exports = { PostgresStaffUserStore };
