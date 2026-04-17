const crypto = require("node:crypto");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const ALLOWED_GENDERS = new Set(["Female", "Male", "Other"]);
const ALLOWED_BLOOD_GROUPS = new Set(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
const ALLOWED_STATUSES = new Set(["Stable", "Observation", "Critical", "Discharge planned"]);

const cleanString = value => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const optionalString = value => {
  const cleaned = cleanString(value);
  return cleaned || null;
};

const generateCode = prefix => {
  const dayStamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${prefix}-${dayStamp}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
};

const isValidDate = value => DATE_PATTERN.test(value);
const isValidTime = value => TIME_PATTERN.test(value);

const parseOptionalAge = value => {
  const cleaned = cleanString(value);
  if (!cleaned) {
    return { value: null };
  }

  const parsed = Number.parseInt(cleaned, 10);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 130) {
    return { error: "Age must be a whole number between 0 and 130." };
  }

  return { value: parsed };
};

const validateAdmissionPayload = payload => {
  const errors = [];

  const fullName = cleanString(payload?.fullName);
  const admissionDate = cleanString(payload?.admissionDate);
  const department = cleanString(payload?.department);
  const status = cleanString(payload?.status);
  const ageResult = parseOptionalAge(payload?.age);
  const gender = optionalString(payload?.gender);
  const bloodGroup = optionalString(payload?.bloodGroup);
  const dateOfBirth = optionalString(payload?.dateOfBirth);
  const admissionTime = optionalString(payload?.admissionTime);

  if (!fullName) {
    errors.push("Full name is required.");
  }

  if (!admissionDate || !isValidDate(admissionDate)) {
    errors.push("Admission date is required in YYYY-MM-DD format.");
  }

  if (!department) {
    errors.push("Department is required.");
  }

  if (!status || !ALLOWED_STATUSES.has(status)) {
    errors.push("Patient status is required.");
  }

  if (ageResult.error) {
    errors.push(ageResult.error);
  }

  if (gender && !ALLOWED_GENDERS.has(gender)) {
    errors.push("Gender must be Female, Male, or Other.");
  }

  if (bloodGroup && !ALLOWED_BLOOD_GROUPS.has(bloodGroup)) {
    errors.push("Blood group is invalid.");
  }

  if (dateOfBirth && !isValidDate(dateOfBirth)) {
    errors.push("Date of birth must use YYYY-MM-DD format.");
  }

  if (admissionTime && !isValidTime(admissionTime)) {
    errors.push("Admission time must use HH:MM format.");
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    value: {
      patientId: optionalString(payload?.patientId) || generateCode("PT"),
      admissionId: optionalString(payload?.admissionId) || generateCode("ADM"),
      fullName,
      age: ageResult.value,
      gender,
      dateOfBirth,
      mobileNumber: optionalString(payload?.mobileNumber),
      address: optionalString(payload?.address),
      emergencyContact: optionalString(payload?.emergencyContact),
      bloodGroup,
      insuranceProfileType: optionalString(payload?.insuranceProfileType),
      admissionDate,
      admissionTime,
      department,
      ward: optionalString(payload?.ward),
      room: optionalString(payload?.room),
      bedNumber: optionalString(payload?.bedNumber),
      doctor: optionalString(payload?.doctor),
      diagnosis: optionalString(payload?.diagnosis),
      allergies: optionalString(payload?.allergies),
      status
    }
  };
};

const normalizeAdmissionSearchFilters = query => {
  const errors = [];
  const filters = {
    query: cleanString(query?.q),
    patientId: optionalString(query?.patientId),
    fullName: optionalString(query?.fullName),
    doctor: optionalString(query?.doctor),
    entryDate: optionalString(query?.entryDate),
    entryDateFrom: optionalString(query?.entryDateFrom),
    entryDateTo: optionalString(query?.entryDateTo)
  };

  if (filters.entryDate && !isValidDate(filters.entryDate)) {
    errors.push("Entry date must use YYYY-MM-DD format.");
  }

  if (filters.entryDateFrom && !isValidDate(filters.entryDateFrom)) {
    errors.push("Entry date start must use YYYY-MM-DD format.");
  }

  if (filters.entryDateTo && !isValidDate(filters.entryDateTo)) {
    errors.push("Entry date end must use YYYY-MM-DD format.");
  }

  if (filters.entryDate && (filters.entryDateFrom || filters.entryDateTo)) {
    errors.push("Use either a single entry date or a date range.");
  }

  if ((filters.entryDateFrom || filters.entryDateTo) && !(filters.entryDateFrom && filters.entryDateTo)) {
    errors.push("Both entry date range values are required.");
  }

  if (filters.entryDateFrom && filters.entryDateTo && filters.entryDateFrom > filters.entryDateTo) {
    errors.push("Entry date range start must be on or before the end date.");
  }

  if (errors.length > 0) {
    return { errors };
  }

  return { value: filters };
};

module.exports = {
  isValidDate,
  normalizeAdmissionSearchFilters,
  validateAdmissionPayload
};
