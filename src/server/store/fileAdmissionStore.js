const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

class FileAdmissionStore {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async initialize() {
    const directory = path.dirname(this.filePath);
    await fs.mkdir(directory, { recursive: true });

    try {
      await fs.access(this.filePath);
    } catch {
      await this.#write({ admissions: [] });
    }
  }

  async listRecent(limit = 10) {
    return this.list({ limit });
  }

  async list({ query = "", limit = null } = {}) {
    const data = await this.#read();
    const normalizedQuery = String(query || "").trim().toLowerCase();
    const items = [...data.admissions]
      .filter(item => this.#matchesQuery(item, normalizedQuery))
      .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

    if (Number.isInteger(limit) && limit > 0) {
      return items.slice(0, limit);
    }

    return items;
  }

  async getById(id) {
    const data = await this.#read();
    return data.admissions.find(item => item.id === id) || null;
  }

  async create(admission) {
    const data = await this.#read();
    const nextItem = {
      id: crypto.randomUUID(),
      ...admission,
      createdAt: new Date().toISOString()
    };

    data.admissions.push(nextItem);
    await this.#write(data);

    return nextItem;
  }

  async getSummary() {
    const data = await this.#read();

    return {
      admittedPatients: data.admissions.length,
      dischargePlanned: data.admissions.filter(item => item.status === "Discharge planned").length
    };
  }

  async #read() {
    const raw = await fs.readFile(this.filePath, "utf8");
    return JSON.parse(raw);
  }

  #matchesQuery(item, query) {
    if (!query) {
      return true;
    }

    const searchableValues = [
      item.patientId,
      item.admissionId,
      item.fullName,
      item.mobileNumber,
      item.department,
      item.doctor,
      item.status,
      item.ward,
      item.room,
      item.bedNumber,
      item.diagnosis
    ];

    return searchableValues.some(value => String(value || "").toLowerCase().includes(query));
  }

  async #write(data) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }
}

module.exports = { FileAdmissionStore };
