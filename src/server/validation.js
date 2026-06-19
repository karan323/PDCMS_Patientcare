const crypto = require("node:crypto");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const ALLOWED_GENDERS = new Set(["Female", "Male", "Other"]);
const ALLOWED_BLOOD_GROUPS = new Set(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
const ALLOWED_STATUSES = new Set(["Stable", "Observation", "Critical", "Isolation", "Discharge planned"]);

const EXTRA_TEXT_FIELDS = [
  "emergencyContactRelationship",
  "healthCardImageReference",
  "languagePreference",
  "portalActivationStatus",
  "caregiverName",
  "caregiverRelationship",
  "caregiverPhone",
  "caregiverConsentTimestamp",
  "assignedNurse",
  "profileAssignedDoctor",
  "admissionHistory",
  "currentRoom",
  "profileConditionSummary",
  "attachedDocumentsCount",
  "portalPublicationStatus",
  "documentReference",
  "activityType",
  "activityPerformedBy",
  "activityStatus",
  "activityPriority",
  "activityCustomTypeGoverned",
  "nursingUpdate",
  "doctorRounds",
  "remarks",
  "provisionalDiagnosis",
  "finalDiagnosis",
  "treatmentPlan",
  "treatmentNotes",
  "diagnosisUpdate",
  "careConditionSummary",
  "clinicalObservations",
  "dietInstructions",
  "precautions",
  "progressNotes",
  "noteVisibility",
  "clinicalSignoffState",
  "doctorSignoffBy",
  "doctorSignoffAt",
  "nurseAcknowledgementBy",
  "nurseAcknowledgementAt",
  "addendumReason",
  "medicineName",
  "genericName",
  "dose",
  "dosageUnit",
  "medicineType",
  "route",
  "formulation",
  "frequency",
  "medicationPurpose",
  "timing",
  "scheduleTimes",
  "schedulePeriod",
  "duration",
  "food",
  "prescribedBy",
  "medStatus",
  "medInstructions",
  "cautionText",
  "allergyWarning",
  "interactionWarning",
  "interactionOverrideReason",
  "medicationChangeReason",
  "medicationAdminStatus",
  "medicationAdminTime",
  "medicationAdministeredBy",
  "medicationExceptionReason",
  "reportName",
  "reportType",
  "reportOrderingClinician",
  "reportStatus",
  "reportReviewedBy",
  "reportReviewedAt",
  "reportReleaseStatus",
  "reportRemarks",
  "reportFileReference",
  "consultRequestedBy",
  "consultantName",
  "consultantSpecialty",
  "consultReason",
  "consultStatus",
  "consultRescheduleReason",
  "consultNotes",
  "availabilityProvider",
  "availabilityLocation",
  "availabilitySlotDuration",
  "availabilityMaxPatients",
  "availabilityBlockedDates",
  "availableSlotOne",
  "availableSlotTwo",
  "availableSlotThree",
  "availableSlotFour",
  "availableSlotFive",
  "appointmentDoctor",
  "appointmentDepartment",
  "slotDuration",
  "visitReason",
  "appointmentStatus",
  "appointmentRescheduleReason",
  "followUpProvider",
  "followUpType",
  "dischargeFinalDiagnosis",
  "hospitalCourse",
  "proceduresPerformed",
  "dischargeSummary",
  "dischargeMedication",
  "homeCare",
  "warningSigns",
  "dischargeBlockers",
  "dischargeSignoffBy",
  "dischargeSignoffAt",
  "reviewInstructions",
  "documentCategory",
  "documentSource",
  "documentOwner",
  "documentUploadReference",
  "documentVisibility",
  "documentCurrentStatus",
  "documentVersionNote",
  "noteAuthor",
  "noteTimestamp",
  "staffNotes",
  "doctorNotes",
  "handoverNotes",
  "reminderOwner",
  "reminderStatus",
  "patientNotificationTrigger",
  "notificationTemplate",
  "whoUpdatedWhat",
  "timestampLogs",
  "editHistoryCount",
  "roleBasedVisibility",
  "approvalFlow",
  "accessReviewNotes",
  "masterDataChangeNotes",
  "policySettingNotes",
  "breakGlassReason",
  "auditExportPurpose",
  "exportApprovedBy",
  "doctorConsultNote",
  "doctorConsultNoteBy",
  "doctorConsultNoteAt",
  "dischargeConfirmedBy",
  "dischargeConfirmedAt"
];

const EXTRA_DATE_FIELDS = [
  ["activityDate", "Activity date"],
  ["startDate", "Medication start date"],
  ["endDate", "Medication end date"],
  ["orderedDate", "Report ordered date"],
  ["scheduledDate", "Report scheduled date"],
  ["resultDate", "Report result date"],
  ["consultDate", "Consult date"],
  ["appointmentDate", "Appointment date"],
  ["nextTestDate", "Next test date"],
  ["followUpReminderDate", "Follow-up reminder date"],
  ["expectedDischarge", "Expected discharge date"],
  ["dischargeDate", "Discharge date"],
  ["followUpDate", "Follow-up date"],
  ["medicationReminderDate", "Medication reminder date"],
  ["doctorReviewReminderDate", "Doctor review reminder date"],
  ["testReminderDate", "Test reminder date"],
  ["documentDate", "Document date"],
  ["reminderDueDate", "Reminder due date"]
];

const EXTRA_TIME_FIELDS = [
  ["activityTime", "Activity time"],
  ["consultTime", "Consult time"],
  ["appointmentTime", "Appointment time"]
];

const EXTRA_BOOLEAN_FIELDS = [
  "dischargeSummaryVisibleToPatient",
  "consultantNoteVisibleToPatient",
  "finalLabReportVisibleToPatient",
  "caregiverAuthorized",
  "vitalsRecorded",
  "mealCompleted",
  "procedureCompleted",
  "mobilityDone",
  "activityExceptionFlag",
  "prnMedication",
  "reportVisibleToPatient",
  "reportAbnormalFlag",
  "notePatientFacing",
  "dischargeChecklistCounselingComplete",
  "dischargeChecklistDocumentsShared",
  "dischargeChecklistRemindersEnabled",
  "dischargeChecklistCaregiverInformed",
  "dischargePackPublished",
  "dischargeConfirmedByDoctor"
];

const REPORT_TEXT_FIELDS = [
  "reportName",
  "reportType",
  "reportOrderingClinician",
  "reportStatus",
  "reportReviewedBy",
  "reportReviewedAt",
  "reportReleaseStatus",
  "reportRemarks",
  "reportFileReference"
];
const REPORT_DATE_FIELDS = [
  ["orderedDate", "Report ordered date"],
  ["scheduledDate", "Report scheduled date"],
  ["resultDate", "Report result date"]
];

const cleanString = value => {
  if (typeof value === "number") {
    return String(value).trim();
  }

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

const optionalString = value => {
  const cleaned = cleanString(value);
  return cleaned || null;
};

const optionalBoolean = value => {
  if (typeof value === "boolean") {
    return value;
  }

  const normalized = cleanString(value).toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }

  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }

  return false;
};

const hasReportContent = report =>
  Boolean(
    cleanString(report?.reportName) ||
      cleanString(report?.reportOrderingClinician) ||
      cleanString(report?.orderedDate) ||
      cleanString(report?.scheduledDate) ||
      cleanString(report?.reportStatus) ||
      cleanString(report?.resultDate) ||
      cleanString(report?.reportReviewedBy) ||
      cleanString(report?.reportReviewedAt) ||
      cleanString(report?.reportReleaseStatus) ||
      cleanString(report?.reportRemarks) ||
      cleanString(report?.reportFileReference) ||
      optionalBoolean(report?.reportVisibleToPatient) ||
      optionalBoolean(report?.reportAbnormalFlag)
  );

const normalizeReportItem = (report, index) => {
  const errors = [];

  if (!report || typeof report !== "object" || Array.isArray(report)) {
    return {
      errors: [`Report ${index + 1} must be an object.`]
    };
  }

  const normalized = {
    ...Object.fromEntries(REPORT_TEXT_FIELDS.map(key => [key, optionalString(report?.[key])])),
    ...Object.fromEntries(REPORT_DATE_FIELDS.map(([key]) => [key, optionalString(report?.[key])])),
    reportVisibleToPatient: optionalBoolean(report?.reportVisibleToPatient),
    reportAbnormalFlag: optionalBoolean(report?.reportAbnormalFlag)
  };

  REPORT_DATE_FIELDS.forEach(([key, label]) => {
    if (normalized[key] && !isValidDate(normalized[key])) {
      errors.push(`${label} for report ${index + 1} must use YYYY-MM-DD format.`);
    }
  });

  return errors.length > 0 ? { errors } : { value: normalized };
};

const normalizeReportsPayload = payload => {
  const sourceReports = Array.isArray(payload?.reports)
    ? payload.reports
    : hasReportContent(payload)
      ? [
          {
            reportName: payload?.reportName,
            reportType: payload?.reportType,
            reportOrderingClinician: payload?.reportOrderingClinician,
            orderedDate: payload?.orderedDate,
            scheduledDate: payload?.scheduledDate,
            reportStatus: payload?.reportStatus,
            resultDate: payload?.resultDate,
            reportReviewedBy: payload?.reportReviewedBy,
            reportReviewedAt: payload?.reportReviewedAt,
            reportReleaseStatus: payload?.reportReleaseStatus,
            reportRemarks: payload?.reportRemarks,
            reportFileReference: payload?.reportFileReference,
            reportVisibleToPatient: payload?.reportVisibleToPatient,
            reportAbnormalFlag: payload?.reportAbnormalFlag
          }
        ]
      : [];

  const errors = [];
  const reports = sourceReports.reduce((items, report, index) => {
    const result = normalizeReportItem(report, index);

    if (result.errors) {
      errors.push(...result.errors);
      return items;
    }

    if (hasReportContent(result.value)) {
      items.push(result.value);
    }

    return items;
  }, []);

  return errors.length > 0 ? { errors } : { value: reports };
};

const buildLegacyReportFields = reports => {
  const latestReport = reports.length > 0 ? reports[reports.length - 1] : null;

  return {
    reportName: latestReport?.reportName || null,
    reportType: latestReport?.reportType || null,
    reportOrderingClinician: latestReport?.reportOrderingClinician || null,
    orderedDate: latestReport?.orderedDate || null,
    scheduledDate: latestReport?.scheduledDate || null,
    reportStatus: latestReport?.reportStatus || null,
    resultDate: latestReport?.resultDate || null,
    reportReviewedBy: latestReport?.reportReviewedBy || null,
    reportReviewedAt: latestReport?.reportReviewedAt || null,
    reportReleaseStatus: latestReport?.reportReleaseStatus || null,
    reportRemarks: latestReport?.reportRemarks || null,
    reportFileReference: latestReport?.reportFileReference || null,
    reportVisibleToPatient: latestReport?.reportVisibleToPatient || false,
    reportAbnormalFlag: latestReport?.reportAbnormalFlag || false
  };
};

const generateCode = prefix => {
  const dayStamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${prefix}-${dayStamp}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;
};

const generatePortalPassword = () => {
  const alphaNumeric = "123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const special = "!@#$%&*?";
  const length = 8 + crypto.randomInt(0, 3);
  const requiredSpecial = special[crypto.randomInt(0, special.length)];
  const characters = Array.from({ length: length - 1 }, () => alphaNumeric[crypto.randomInt(0, alphaNumeric.length)]);
  const insertAt = crypto.randomInt(0, characters.length + 1);

  characters.splice(insertAt, 0, requiredSpecial);
  return characters.join("");
};

const isValidDate = value => DATE_PATTERN.test(value);
const isValidTime = value => TIME_PATTERN.test(value);
const isFutureDate = value => isValidDate(value) && value > new Date().toISOString().slice(0, 10);
const isValidPhone = value => /^[+]?[\d\s().-]{7,20}$/.test(value);
const isAllowedReportFileReference = value => /\.(pdf|png|jpe?g|dcm|dicom)$/i.test(value);

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

const validateAdmissionPayload = (payload, options = {}) => {
  const errors = [];
  const existingIdentifiers = options.existingIdentifiers || null;

  const fullName = cleanString(payload?.fullName);
  const admissionDate = cleanString(payload?.admissionDate);
  const department = cleanString(payload?.department);
  const status = cleanString(payload?.status);
  const ageResult = parseOptionalAge(payload?.age);
  const gender = optionalString(payload?.gender);
  const bloodGroup = optionalString(payload?.bloodGroup);
  const dateOfBirth = optionalString(payload?.dateOfBirth);
  const admissionTime = optionalString(payload?.admissionTime);
  const mobileNumber = optionalString(payload?.mobileNumber);
  const emergencyContact = optionalString(payload?.emergencyContact);
  const room = optionalString(payload?.room);
  const bedNumber = optionalString(payload?.bedNumber);
  const doctor = optionalString(payload?.doctor);
  const caregiverAuthorized = optionalBoolean(payload?.caregiverAuthorized);
  const reportsResult = normalizeReportsPayload(payload);

  if (!fullName) {
    errors.push("Full name is required.");
  }

  if (!admissionDate || !isValidDate(admissionDate)) {
    errors.push("Admission date is required in YYYY-MM-DD format.");
  }

  if (!dateOfBirth) {
    errors.push("Date of birth is required.");
  }

  if (!admissionTime) {
    errors.push("Admission time is required.");
  }

  if (!emergencyContact) {
    errors.push("Emergency contact is required.");
  }

  if (!department) {
    errors.push("Department is required.");
  }

  if (!room) {
    errors.push("Room is required.");
  }

  if (!bedNumber) {
    errors.push("Bed number is required.");
  }

  if (!doctor) {
    errors.push("Admitting doctor is required.");
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

  if (dateOfBirth && isFutureDate(dateOfBirth)) {
    errors.push("Date of birth cannot be in the future.");
  }

  if (mobileNumber && !isValidPhone(mobileNumber)) {
    errors.push("Mobile number format is invalid.");
  }

  if (payload?.caregiverPhone && !isValidPhone(payload.caregiverPhone)) {
    errors.push("Caregiver phone format is invalid.");
  }

  if (admissionTime && !isValidTime(admissionTime)) {
    errors.push("Admission time must use HH:MM format.");
  }

  EXTRA_DATE_FIELDS.forEach(([key, label]) => {
    const value = optionalString(payload?.[key]);
    if (value && !isValidDate(value)) {
      errors.push(`${label} must use YYYY-MM-DD format.`);
    }
  });

  EXTRA_TIME_FIELDS.forEach(([key, label]) => {
    const value = optionalString(payload?.[key]);
    if (value && !isValidTime(value)) {
      errors.push(`${label} must use HH:MM format.`);
    }
  });

  if (reportsResult.errors) {
    errors.push(...reportsResult.errors);
  }

  if (payload?.startDate && payload?.endDate && payload.startDate > payload.endDate) {
    errors.push("Medication end date cannot precede start date.");
  }

  const hasMedicationContent = [
    "medicineName",
    "dose",
    "route",
    "frequency",
    "prescribedBy",
    "timing",
    "scheduleTimes",
    "medicationAdminStatus"
  ].some(key => cleanString(payload?.[key])) || optionalBoolean(payload?.prnMedication);

  if (hasMedicationContent) {
    if (!cleanString(payload?.medicineName)) {
      errors.push("Medicine name is required when saving a medication.");
    }

    if (!cleanString(payload?.dose)) {
      errors.push("Medication dose is required when saving a medication.");
    }

    if (!cleanString(payload?.route)) {
      errors.push("Medication route is required when saving a medication.");
    }

    if (!cleanString(payload?.frequency)) {
      errors.push("Medication frequency is required when saving a medication.");
    }

    if (!cleanString(payload?.prescribedBy)) {
      errors.push("Prescribing doctor is required when saving a medication.");
    }

    if (!cleanString(payload?.timing) && !cleanString(payload?.scheduleTimes) && !optionalBoolean(payload?.prnMedication)) {
      errors.push("At least one medication schedule or PRN rule is required.");
    }
  }

  if (
    ["Skipped", "Refused", "Delayed"].includes(cleanString(payload?.medicationAdminStatus)) &&
    !cleanString(payload?.medicationExceptionReason)
  ) {
    errors.push("Skipped, refused, or delayed medication requires an exception reason.");
  }

  reportsResult.value?.forEach((report, index) => {
    if (report.reportFileReference && !isAllowedReportFileReference(report.reportFileReference)) {
      errors.push(`Report file reference for report ${index + 1} must be PDF, image, DICOM, or DCM.`);
    }

    if (report.reportVisibleToPatient && !report.reportReviewedBy && report.reportReleaseStatus !== "Reviewed for release") {
      errors.push(`Report ${index + 1} requires clinician review before patient visibility.`);
    }
  });

  if (caregiverAuthorized && !cleanString(payload?.caregiverName)) {
    errors.push("Caregiver/family member name is required when caregiver access is authorized.");
  }

  if (optionalBoolean(payload?.dischargePackPublished)) {
    if (!cleanString(payload?.dischargeSignoffBy)) {
      errors.push("Discharge pack publication requires authorized clinician sign-off.");
    }

    if (
      !optionalBoolean(payload?.dischargeChecklistCounselingComplete) ||
      !optionalBoolean(payload?.dischargeChecklistDocumentsShared) ||
      !optionalBoolean(payload?.dischargeChecklistRemindersEnabled) ||
      !optionalBoolean(payload?.dischargeChecklistCaregiverInformed)
    ) {
      errors.push("Discharge pack publication requires all mandatory checklist items.");
    }
  }

  if (errors.length > 0) {
    return { errors };
  }

  const patientId = optionalString(payload?.patientId) || existingIdentifiers?.patientId || generateCode("PT");
  const admissionId = optionalString(payload?.admissionId) || existingIdentifiers?.admissionId || generateCode("ADM");
  const patientPortalUsername = caregiverAuthorized
    ? patientId
    : optionalString(payload?.patientPortalUsername) || existingIdentifiers?.patientPortalUsername || null;
  const patientPortalPassword = caregiverAuthorized
    ? optionalString(payload?.patientPortalPassword) ||
      existingIdentifiers?.patientPortalPassword ||
      generatePortalPassword()
    : optionalString(payload?.patientPortalPassword) || existingIdentifiers?.patientPortalPassword || null;
  const patientPortalCredentialsGeneratedAt = caregiverAuthorized
    ? optionalString(payload?.patientPortalCredentialsGeneratedAt) ||
      existingIdentifiers?.patientPortalCredentialsGeneratedAt ||
      new Date().toISOString()
    : optionalString(payload?.patientPortalCredentialsGeneratedAt) ||
      existingIdentifiers?.patientPortalCredentialsGeneratedAt ||
      null;

  const extraFields = {
    ...Object.fromEntries(EXTRA_TEXT_FIELDS.map(key => [key, optionalString(payload?.[key])])),
    ...Object.fromEntries(EXTRA_DATE_FIELDS.map(([key]) => [key, optionalString(payload?.[key])])),
    ...Object.fromEntries(EXTRA_TIME_FIELDS.map(([key]) => [key, optionalString(payload?.[key])])),
    ...Object.fromEntries(EXTRA_BOOLEAN_FIELDS.map(key => [key, optionalBoolean(payload?.[key])]))
  };

  return {
    value: {
      patientId,
      admissionId,
      fullName,
      age: ageResult.value,
      gender,
      dateOfBirth,
      mobileNumber,
      address: optionalString(payload?.address),
      emergencyContact,
      bloodGroup,
      insuranceProfileType: optionalString(payload?.insuranceProfileType),
      admissionDate,
      admissionTime,
      department,
      ward: optionalString(payload?.ward),
      room,
      bedNumber,
      doctor,
      diagnosis: optionalString(payload?.diagnosis),
      allergies: optionalString(payload?.allergies),
      status,
      ...extraFields,
      caregiverAuthorized,
      patientPortalUsername,
      patientPortalPassword,
      patientPortalCredentialsGeneratedAt,
      ...buildLegacyReportFields(reportsResult.value),
      reports: reportsResult.value,
      sectionVisibility: optionalString(payload?.sectionVisibility),
      auditComment: optionalString(payload?.auditComment),
      changedSectionsSummary: optionalString(payload?.changedSectionsSummary)
    }
  };
};

const normalizeAdmissionSearchFilters = query => {
  const errors = [];
  const normalizedQuery = cleanString(query?.q);
  const broadQuery = normalizedQuery.startsWith("*");
  const filters = {
    query: broadQuery ? cleanString(normalizedQuery.slice(1)) : normalizedQuery,
    queryMode: broadQuery ? "broad" : "default",
    patientId: optionalString(query?.patientId),
    fullName: optionalString(query?.fullName),
    doctor: optionalString(query?.doctor),
    mobileNumber: optionalString(query?.mobileNumber),
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
