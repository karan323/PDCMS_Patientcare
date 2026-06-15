const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const isFilled = value => String(value ?? "").trim().length > 0;
const isPendingReport = report => report && !["Available", "Reviewed"].includes(String(report.reportStatus || ""));
const isTodayOrFuture = value => {
  const normalized = String(value || "").slice(0, 10);
  return normalized && normalized >= new Date().toISOString().slice(0, 10);
};

const buildSummary = admissions => {
  const pendingReports = admissions.reduce(
    (count, item) => count + (Array.isArray(item.reports) ? item.reports.filter(isPendingReport).length : isPendingReport(item) ? 1 : 0),
    0
  );
  const abnormalReports = admissions.reduce(
    (count, item) =>
      count +
      (Array.isArray(item.reports)
        ? item.reports.filter(report => report.reportAbnormalFlag || report.reportStatus === "Abnormal / urgent").length
        : item.reportAbnormalFlag || item.reportStatus === "Abnormal / urgent"
          ? 1
          : 0),
    0
  );
  const dueMedicationTasks = admissions.filter(item => item.medicineName && item.medStatus !== "Stopped").length;
  const upcomingConsults = admissions.filter(item => isTodayOrFuture(item.consultDate)).length;
  const dailyNoteUpdatesNeeded = admissions.filter(item => !isFilled(item.activityDate) || !isFilled(item.progressNotes)).length;
  const vitalsMonitoringDue = admissions.filter(item => !item.vitalsRecorded).length;
  const priorityPatients = admissions.filter(
    item =>
      item.status === "Critical" ||
      item.status === "Isolation" ||
      item.activityExceptionFlag ||
      item.reportAbnormalFlag ||
      (Array.isArray(item.reports) && item.reports.some(report => report.reportAbnormalFlag))
  ).length;
  const dischargeFollowUps = admissions.filter(
    item => item.status === "Discharge planned" || isFilled(item.followUpDate) || isFilled(item.followUpReminderDate)
  ).length;
  const dischargeBlockers = admissions.filter(item => isFilled(item.dischargeBlockers)).length;
  const portalSetupPending = admissions.filter(item => item.caregiverAuthorized && !isFilled(item.patientPortalPassword)).length;
  const unresolvedAlerts =
    pendingReports +
    abnormalReports +
    dueMedicationTasks +
    upcomingConsults +
    dailyNoteUpdatesNeeded +
    vitalsMonitoringDue +
    priorityPatients +
    dischargeBlockers;

  const alerts = [
    abnormalReports > 0 && { severity: "critical", message: `${abnormalReports} abnormal or urgent report item(s) need review.` },
    dueMedicationTasks > 0 && { severity: "due", message: `${dueMedicationTasks} active medication workflow(s) need MAR review.` },
    dailyNoteUpdatesNeeded > 0 && { severity: "due", message: `${dailyNoteUpdatesNeeded} patient record(s) need daily activity or progress notes.` },
    dischargeBlockers > 0 && { severity: "critical", message: `${dischargeBlockers} discharge record(s) have unresolved blockers.` },
    portalSetupPending > 0 && { severity: "info", message: `${portalSetupPending} caregiver portal setup(s) need credential review.` }
  ].filter(Boolean);

  return {
    admittedPatients: admissions.length,
    dischargePlanned: admissions.filter(item => item.status === "Discharge planned").length,
    pendingReports,
    abnormalReports,
    dueMedicationTasks,
    upcomingConsults,
    dailyNoteUpdatesNeeded,
    vitalsMonitoringDue,
    priorityPatients,
    dischargeFollowUps,
    dischargeBlockers,
    portalSetupPending,
    unresolvedAlerts,
    alerts
  };
};

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
    mobileNumber = null,
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
      mobileNumber: String(mobileNumber || "").trim().toLowerCase(),
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

  async appendAuditEvent({ id, event }) {
    const data = await this.#read();
    const index = data.admissions.findIndex(item => item.id === id);

    if (index === -1) {
      return null;
    }

    const existingItem = data.admissions[index];
    const nextItem = {
      ...existingItem,
      auditEvents: [...(existingItem.auditEvents || []), event]
    };

    data.admissions[index] = nextItem;
    await this.#write(data);
    return nextItem;
  }

  async getSummary() {
    const data = await this.#read();
    return buildSummary(data.admissions);
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
          : [patientId, admissionId, fullName].some(value => value.includes(filters.query))
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

    if (filters.mobileNumber && !mobileNumber.includes(filters.mobileNumber)) {
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
