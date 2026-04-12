const express = require("express");
const path = require("node:path");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isValidDate = value => DATE_PATTERN.test(value);

const createApp = ({ workloadStore, storageKind }) => {
  const app = express();
  const rootDirectory = process.cwd();

  app.use(express.json());
  app.use(express.static(rootDirectory));

  app.get("/api/health", (_request, response) => {
    response.json({ status: "ok", storage: storageKind });
  });

  app.get("/api/workloads", async (request, response) => {
    const { date } = request.query;
    if (typeof date !== "string" || !isValidDate(date)) {
      response.status(400).json({ error: "A valid date query is required in YYYY-MM-DD format." });
      return;
    }

    const items = await workloadStore.listByDate(date);
    response.json({ date, items });
  });

  app.post("/api/workloads", async (request, response) => {
    const { date, text } = request.body || {};
    if (typeof date !== "string" || !isValidDate(date)) {
      response.status(400).json({ error: "A valid date is required in YYYY-MM-DD format." });
      return;
    }

    if (typeof text !== "string" || !text.trim()) {
      response.status(400).json({ error: "Task text is required." });
      return;
    }

    const item = await workloadStore.create({ date, text: text.trim() });
    response.status(201).json(item);
  });

  app.patch("/api/workloads/:id", async (request, response) => {
    const { id } = request.params;
    const { done } = request.body || {};

    if (typeof done !== "boolean") {
      response.status(400).json({ error: "A boolean done value is required." });
      return;
    }

    const item = await workloadStore.update({ id, done });
    if (!item) {
      response.status(404).json({ error: "Workload item not found." });
      return;
    }

    response.json(item);
  });

  app.get(/^(?!\/api).*/, (_request, response) => {
    response.sendFile(path.join(rootDirectory, "index.html"));
  });

  app.use((error, _request, response, _next) => {
    console.error(error);
    response.status(500).json({ error: "Internal server error." });
  });

  return app;
};

module.exports = { createApp };
