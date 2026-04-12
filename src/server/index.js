const { createApp } = require("./app");
const { createWorkloadStore } = require("./store/createWorkloadStore");

const start = async () => {
  const { kind, store } = await createWorkloadStore();
  const app = createApp({ workloadStore: store, storageKind: kind });
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
