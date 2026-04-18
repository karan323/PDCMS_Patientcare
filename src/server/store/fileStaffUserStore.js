const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

class FileStaffUserStore {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async initialize() {
    const directory = path.dirname(this.filePath);
    await fs.mkdir(directory, { recursive: true });

    try {
      await fs.access(this.filePath);
    } catch {
      await this.#write({ staffUsers: [] });
    }
  }

  async create(staffUser) {
    const data = await this.#read();
    const nextUser = {
      id: crypto.randomUUID(),
      ...staffUser,
      createdAt: new Date().toISOString()
    };

    data.staffUsers.push(nextUser);
    await this.#write(data);
    return nextUser;
  }

  async getByEmail(email) {
    const data = await this.#read();
    return data.staffUsers.find(item => item.email === email) || null;
  }

  async getById(id) {
    const data = await this.#read();
    return data.staffUsers.find(item => item.id === id) || null;
  }

  async #read() {
    const raw = await fs.readFile(this.filePath, "utf8");
    return JSON.parse(raw);
  }

  async #write(data) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }
}

module.exports = { FileStaffUserStore };
