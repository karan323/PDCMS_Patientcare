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

  async list({
    query = "",
    queryMode = "default",
    patientId = null,
    fullName = null,
    doctor = null,
    entryDate = null,
    entryDateFrom = null,
    entryDateTo = null,
    limit = null
  } = {}) {
    const data = await this.#read();
    const filters = {
      query: String(query || "").trim().toLowerCase(),
      queryMode: queryMode === "broad" ? "broad" : "default",
      patientId: String(patientId || "").trim().toLowerCase(),
      fullName: String(fullName || "").trim().toLowerCase(),
      doctor: String(doctor || "").trim().toLowerCase(),
      entryDate: String(entryDate || "").trim(),
      entryDateFrom: String(entryDateFrom || "").trim(),
      entryDateTo: String(entryDateTo || "").trim()
    };
    const items = [...data.admissions]
      .filter(item => this.#matchesFilters(item, filters))
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

  async update({ id, admission }) {
    const data = await this.#read();
    const index = data.admissions.findIndex(item => item.id === id);

    if (index === -1) {
      return null;
    }

    const existingItem = data.admissions[index];
    const nextItem = {
      ...existingItem,
      ...admission,
      id: existingItem.id,
      createdAt: existingItem.createdAt
    };

    data.admissions[index] = nextItem;
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

  #matchesFilters(item, filters) {
    const patientId = String(item.patientId || "").toLowerCase();
    const admissionId = String(item.admissionId || "").toLowerCase();
    const fullName = String(item.fullName || "").toLowerCase();
    const mobileNumber = String(item.mobileNumber || "").toLowerCase();
    const department = String(item.department || "").toLowerCase();
    const doctor = String(item.doctor || "").toLowerCase();
    const status = String(item.status || "").toLowerCase();
    const ward = String(item.ward || "").toLowerCase();
    const room = String(item.room || "").toLowerCase();
    const bedNumber = String(item.bedNumber || "").toLowerCase();
    const diagnosis = String(item.diagnosis || "").toLowerCase();
    const allergies = String(item.allergies || "").toLowerCase();
    const address = String(item.address || "").toLowerCase();
    const emergencyContact = String(item.emergencyContact || "").toLowerCase();
    const insuranceProfileType = String(item.insuranceProfileType || "").toLowerCase();
    const bloodGroup = String(item.bloodGroup || "").toLowerCase();
    const admissionDate = String(item.admissionDate || "").trim();
    const broadSearchValues = [
      patientId,
      admissionId,
      fullName,
      mobileNumber,
      department,
      doctor,
      status,
      ward,
      room,
      bedNumber,
      diagnosis,
      allergies,
      address,
      emergencyContact,
      insuranceProfileType,
      bloodGroup,
      admissionDate
    ];

    if (
      filters.query &&
      !(
        filters.queryMode === "broad"
          ? broadSearchValues.some(value => value.includes(filters.query))
          : [patientId, fullName].some(value => value.includes(filters.query))
      )
    ) {
      return false;
    }

    if (filters.patientId && !patientId.includes(filters.patientId)) {
      return false;
    }

    if (filters.fullName && !fullName.includes(filters.fullName)) {
      return false;
    }

    if (filters.doctor && !doctor.includes(filters.doctor)) {
      return false;
    }

    if (filters.entryDate && admissionDate !== filters.entryDate) {
      return false;
    }

    if (filters.entryDateFrom && filters.entryDateTo) {
      if (admissionDate < filters.entryDateFrom || admissionDate > filters.entryDateTo) {
        return false;
      }
    }

    return true;
  }

  async #write(data) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }
}

module.exports = { FileAdmissionStore };
