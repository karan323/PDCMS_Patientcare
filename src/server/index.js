const { createApp } = require("./app");
const { createDataStores } = require("./store/createDataStores");

const start = async () => {
  const { kind, workloadStore, admissionStore } = await createDataStores();
  const app = createApp({ workloadStore, admissionStore, storageKind: kind });
  const port = Number(process.env.PORT || 3000);

  app.listen(port, () => {
    console.log(`PDCMS server running on http://localhost:${port} using ${kind} storage`);
  });
};

start().catch(error => {
  console.error("Failed to start PDCMS server");
  console.error(error);
  process.exit(1);
});
