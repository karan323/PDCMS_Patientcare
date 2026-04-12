const path = require("node:path");
const { Pool } = require("pg");
const { FileWorkloadStore } = require("./fileWorkloadStore");
const { PostgresWorkloadStore } = require("./postgresWorkloadStore");

const createWorkloadStore = async () => {
  if (process.env.DATABASE_URL) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    const store = new PostgresWorkloadStore(pool);
    await store.initialize();

    return { kind: "postgres", store };
  }

  const filePath = path.resolve(process.cwd(), "data", "workloads.json");
  const store = new FileWorkloadStore(filePath);
  await store.initialize();

  return { kind: "file", store };
};

module.exports = { createWorkloadStore };
