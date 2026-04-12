const crypto = require("node:crypto");

class PostgresWorkloadStore {
  constructor(pool) {
    this.pool = pool;
  }

  async initialize() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS workload_items (
        id TEXT PRIMARY KEY,
        workload_date DATE NOT NULL,
        text TEXT NOT NULL,
        done BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ
      )
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS workload_items_workload_date_idx
      ON workload_items (workload_date, created_at)
    `);
  }

  async listByDate(date) {
    const result = await this.pool.query(
      `
        SELECT
          id,
          workload_date AS date,
          text,
          done,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        FROM workload_items
        WHERE workload_date = $1
        ORDER BY created_at ASC
      `,
      [date]
    );

    return result.rows;
  }

  async create({ date, text }) {
    const id = crypto.randomUUID();
    const result = await this.pool.query(
      `
        INSERT INTO workload_items (id, workload_date, text, done)
        VALUES ($1, $2, $3, FALSE)
        RETURNING
          id,
          workload_date AS date,
          text,
          done,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [id, date, text]
    );

    return result.rows[0];
  }

  async update({ id, done }) {
    const result = await this.pool.query(
      `
        UPDATE workload_items
        SET done = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          workload_date AS date,
          text,
          done,
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `,
      [id, done]
    );

    return result.rows[0] || null;
  }
}

module.exports = { PostgresWorkloadStore };
