const fs = require("node:fs/promises");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const outputDirectory = path.join(projectRoot, "dist");

const writeRuntimeConfig = async () => {
  const runtimeConfigPath = path.join(outputDirectory, "src", "scripts", "product", "runtime-config.js");
  const apiBaseUrl = String(process.env.PDCMS_API_BASE_URL || "").trim();
  const fileContents = `window.PDCMS_RUNTIME_CONFIG = ${JSON.stringify({ apiBaseUrl }, null, 2)};\n`;

  await fs.mkdir(path.dirname(runtimeConfigPath), { recursive: true });
  await fs.writeFile(runtimeConfigPath, fileContents, "utf8");
};

const build = async () => {
  await fs.rm(outputDirectory, { recursive: true, force: true });
  await fs.mkdir(outputDirectory, { recursive: true });
  await fs.copyFile(path.join(projectRoot, "index.html"), path.join(outputDirectory, "index.html"));
  await fs.cp(path.join(projectRoot, "src"), path.join(outputDirectory, "src"), { recursive: true });
  await writeRuntimeConfig();
};

build().catch(error => {
  console.error("Failed to build frontend");
  console.error(error);
  process.exit(1);
});
