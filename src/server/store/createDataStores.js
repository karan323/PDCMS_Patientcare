const path = require("node:path");
const { Pool } = require("pg");
const { FileAdmissionStore } = require("./fileAdmissionStore");
const { FileStaffUserStore } = require("./fileStaffUserStore");
const { FileWorkloadStore } = require("./fileWorkloadStore");
const { PostgresAdmissionStore } = require("./postgresAdmissionStore");
const { PostgresStaffUserStore } = require("./postgresStaffUserStore");
const { PostgresWorkloadStore } = require("./postgresWorkloadStore");

const readSslConfig = () => {
  const sslEnabled = String(process.env.DATABASE_SSL || "").trim().toLowerCase();
  const rejectUnauthorized = String(process.env.DATABASE_SSL_REJECT_UNAUTHORIZED || "")
    .trim()
    .toLowerCase();

  if (sslEnabled === "true") {
    return { rejectUnauthorized: rejectUnauthorized !== "false" };
  }

  if (sslEnabled === "false") {
    return false;
  }

  return process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false;
};

const createDataStores = async () => {
  if (process.env.DATABASE_URL) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: readSslConfig()
    });

    const workloadStore = new PostgresWorkloadStore(pool);
    const admissionStore = new PostgresAdmissionStore(pool);
    const staffUserStore = new PostgresStaffUserStore(pool);
    await Promise.all([workloadStore.initialize(), admissionStore.initialize(), staffUserStore.initialize()]);

    return {
      kind: "postgres",
      workloadStore,
      admissionStore,
      staffUserStore
    };
  }

  const dataDirectory = path.resolve(process.cwd(), "data");
  const workloadStore = new FileWorkloadStore(path.join(dataDirectory, "workloads.json"));
  const admissionStore = new FileAdmissionStore(path.join(dataDirectory, "admissions.json"));
  const staffUserStore = new FileStaffUserStore(path.join(dataDirectory, "staffUsers.json"));
  await Promise.all([workloadStore.initialize(), admissionStore.initialize(), staffUserStore.initialize()]);

  return {
    kind: "file",
    workloadStore,
    admissionStore,
    staffUserStore
  };
};

module.exports = { createDataStores };
