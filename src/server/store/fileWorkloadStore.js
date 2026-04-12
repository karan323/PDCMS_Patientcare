const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

class FileWorkloadStore {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async initialize() {
    const directory = path.dirname(this.filePath);
    await fs.mkdir(directory, { recursive: true });

    try {
      await fs.access(this.filePath);
    } catch {
      await this.#write({ workloads: {} });
    }
  }

  async listByDate(date) {
    const data = await this.#read();
    return data.workloads[date] || [];
  }

  async create({ date, text }) {
    const data = await this.#read();
    const nextItem = {
      id: crypto.randomUUID(),
      date,
      text,
      done: false,
      createdAt: new Date().toISOString()
    };

    data.workloads[date] = data.workloads[date] || [];
    data.workloads[date].push(nextItem);

    await this.#write(data);
    return nextItem;
  }

  async update({ id, done }) {
    const data = await this.#read();

    for (const items of Object.values(data.workloads)) {
      const target = items.find(item => item.id === id);
      if (!target) {
        continue;
      }

      target.done = done;
      target.updatedAt = new Date().toISOString();
      await this.#write(data);
      return target;
    }

    return null;
  }

  async #read() {
    const raw = await fs.readFile(this.filePath, "utf8");
    return JSON.parse(raw);
  }

  async #write(data) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }
}

module.exports = { FileWorkloadStore };
