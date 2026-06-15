/**
 * Resets all staff user accounts so the first Head Admin can be created fresh.
 * Run with: node scripts/reset-staff-accounts.js
 */

const fs = require("node:fs/promises");
const path = require("node:path");

const EMPTY_STORE = JSON.stringify({ staffUsers: [] }, null, 2);

const resetFileStore = async () => {
  const filePath = path.resolve(process.cwd(), "data", "staffUsers.json");

  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw);
    const count = parsed.staffUsers?.length ?? 0;

    await fs.writeFile(filePath, EMPTY_STORE);
    console.log(`[file] Cleared ${count} staff account(s) from ${filePath}`);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, EMPTY_STORE);
      console.log(`[file] Created empty store at ${filePath}`);
    } else {
      console.error(`[file] Error: ${error.message}`);
    }
  }
};

const resetPostgresStore = async databaseUrl => {
  const { Pool } = require("pg");
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const result = await pool.query("DELETE FROM staff_users RETURNING id");
    console.log(`[postgres] Deleted ${result.rowCount} staff account(s)`);
  } catch (error) {
    console.error(`[postgres] Error: ${error.message}`);
  } finally {
    await pool.end();
  }
};

const run = async () => {
  console.log("PDCMS — Reset staff accounts\n");

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    console.log("DATABASE_URL is set — resetting PostgreSQL store.");
    await resetPostgresStore(databaseUrl);
  } else {
    console.log("No DATABASE_URL — resetting file store.");
    await resetFileStore();
  }

  console.log("\nDone. Restart the server and create a fresh Head Admin account.");
  console.log('Steps:');
  console.log('  1. npm start (or npm run dev)');
  console.log('  2. Open http://localhost:3000/login');
  console.log('  3. Click "Create account"');
  console.log('  4. Leave "Head Admin email" and "Head Admin password" BLANK');
  console.log('  5. Fill in your name, email, password');
  console.log('  6. Select "Head admin / super admin" as the staff profile');
  console.log('  7. Click "Create account"');
};

run().catch(error => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});
