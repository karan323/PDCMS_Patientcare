window.PDCMS = window.PDCMS || {};

const FIELD_CONFIGS = [
  { key: "patientId", id: "patient-id" },
  { key: "admissionId", id: "admission-id" },
  { key: "fullName", id: "patient-name" },
  { key: "age", id: "age" },
  { key: "gender", id: "gender" },
  { key: "dateOfBirth", id: "dob" },
  { key: "mobileNumber", id: "mobile" },
  { key: "address", id: "address" },
  { key: "emergencyContact", id: "emergency-contact" },
  { key: "emergencyContactRelationship", id: "emergency-contact-relationship" },
  { key: "bloodGroup", id: "blood-group" },
  { key: "insuranceProfileType", id: "insurance" },
  { key: "healthCardImageReference", id: "health-card-image-reference" },
  { key: "languagePreference", id: "language-preference" },
  { key: "admissionDate", id: "admission-date" },
  { key: "admissionTime", id: "admission-time" },
  { key: "department", id: "department" },
  { key: "ward", id: "ward" },
  { key: "room", id: "room" },
  { key: "bedNumber", id: "bed-number" },
  { key: "doctor", id: "doctor" },
  { key: "diagnosis", id: "diagnosis" },
  { key: "allergies", id: "allergies" },
  { key: "status", id: "status" },
  { key: "portalActivationStatus", id: "portal-activation-status" },
  { key: "caregiverName", id: "caregiver-name" },
  { key: "caregiverRelationship", id: "caregiver-relationship" },
  { key: "caregiverPhone", id: "caregiver-phone" },
  { key: "caregiverConsentTimestamp", id: "caregiver-consent-timestamp" },
  { key: "caregiverAuthorized", id: "caregiver-authorized", type: "checkbox" },
  { key: "patientPortalUsername", id: "patient-portal-username" },
  { key: "patientPortalPassword", id: "patient-portal-password" },
  { key: "patientPortalCredentialsGeneratedAt", id: "patient-portal-credentials-generated-at" },
  { key: "assignedNurse", id: "assigned-nurse" },
  { key: "profileAssignedDoctor", id: "profile-assigned-doctor" },
  { key: "admissionHistory", id: "admission-history" },
  { key: "currentRoom", id: "current-room" },
  { key: "profileConditionSummary", id: "profile-condition-summary" },
  { key: "attachedDocumentsCount", id: "attached-documents-count" },
  { key: "portalPublicationStatus", id: "portal-publication-status" },
  { key: "documentReference", id: "document-reference" },
  { key: "dischargeSummaryVisibleToPatient", id: "discharge-summary-visible-to-patient", type: "checkbox" },
  { key: "consultantNoteVisibleToPatient", id: "consultant-note-visible-to-patient", type: "checkbox" },
  { key: "finalLabReportVisibleToPatient", id: "final-lab-report-visible-to-patient", type: "checkbox" },
  { key: "activityDate", id: "activity-date" },
  { key: "activityTime", id: "activity-time" },
  { key: "activityType", id: "activity-type" },
  { key: "activityPerformedBy", id: "activity-performed-by" },
  { key: "activityStatus", id: "activity-status" },
  { key: "activityPriority", id: "activity-priority" },
  { key: "activityCustomTypeGoverned", id: "activity-custom-type-governed" },
  { key: "nursingUpdate", id: "nursing-update" },
  { key: "doctorRounds", id: "doctor-rounds" },
  { key: "vitalsRecorded", id: "vitals-recorded", type: "checkbox" },
  { key: "mealCompleted", id: "meal-completed", type: "checkbox" },
  { key: "procedureCompleted", id: "procedure-completed", type: "checkbox" },
  { key: "mobilityDone", id: "mobility-done", type: "checkbox" },
  { key: "activityExceptionFlag", id: "activity-exception-flag", type: "checkbox" },
  { key: "remarks", id: "remarks" },
  { key: "provisionalDiagnosis", id: "provisional-diagnosis" },
  { key: "finalDiagnosis", id: "final-diagnosis" },
  { key: "treatmentPlan", id: "treatment-plan" },
  { key: "treatmentNotes", id: "treatment-notes" },
  { key: "diagnosisUpdate", id: "diagnosis-update" },
  { key: "careConditionSummary", id: "condition-summary" },
  { key: "clinicalObservations", id: "clinical-observations" },
  { key: "dietInstructions", id: "diet-instructions" },
  { key: "precautions", id: "precautions" },
  { key: "progressNotes", id: "progress-notes" },
  { key: "noteVisibility", id: "note-visibility" },
  { key: "clinicalSignoffState", id: "clinical-signoff-state" },
  { key: "doctorSignoffBy", id: "doctor-signoff-by" },
  { key: "doctorSignoffAt", id: "doctor-signoff-at" },
  { key: "nurseAcknowledgementBy", id: "nurse-acknowledgement-by" },
  { key: "nurseAcknowledgementAt", id: "nurse-acknowledgement-at" },
  { key: "addendumReason", id: "addendum-reason" },
  { key: "medicineName", id: "medicine-name" },
  { key: "genericName", id: "generic-name" },
  { key: "dose", id: "dose" },
  { key: "dosageUnit", id: "dosage-unit" },
  { key: "medicineType", id: "medicine-type" },
  { key: "route", id: "route" },
  { key: "formulation", id: "formulation" },
  { key: "frequency", id: "frequency" },
  { key: "medicationPurpose", id: "medication-purpose" },
  { key: "timing", id: "timing" },
  { key: "scheduleTimes", id: "schedule-times" },
  { key: "schedulePeriod", id: "schedule-period" },
  { key: "prnMedication", id: "prn-medication", type: "checkbox" },
  { key: "duration", id: "duration" },
  { key: "food", id: "food" },
  { key: "startDate", id: "start-date" },
  { key: "endDate", id: "end-date" },
  { key: "prescribedBy", id: "prescribed-by" },
  { key: "medStatus", id: "med-status" },
  { key: "medInstructions", id: "med-instructions" },
  { key: "cautionText", id: "caution-text" },
  { key: "allergyWarning", id: "allergy-warning" },
  { key: "interactionWarning", id: "interaction-warning" },
  { key: "interactionOverrideReason", id: "interaction-override-reason" },
  { key: "medicationChangeReason", id: "medication-change-reason" },
  { key: "medicationAdminStatus", id: "medication-admin-status" },
  { key: "medicationAdminTime", id: "medication-admin-time" },
  { key: "medicationAdministeredBy", id: "medication-administered-by" },
  { key: "medicationExceptionReason", id: "medication-exception-reason" },
  { key: "reportName", id: "report-name" },
  { key: "reportType", id: "report-type" },
  { key: "reportOrderingClinician", id: "report-ordering-clinician" },
  { key: "orderedDate", id: "ordered-date" },
  { key: "scheduledDate", id: "scheduled-date" },
  { key: "reportStatus", id: "report-status" },
  { key: "resultDate", id: "result-date" },
  { key: "reportReviewedBy", id: "report-reviewed-by" },
  { key: "reportReviewedAt", id: "report-reviewed-at" },
  { key: "reportReleaseStatus", id: "report-release-status" },
  { key: "reportRemarks", id: "report-remarks" },
  { key: "reportFileReference", id: "report-file-reference" },
  { key: "reportVisibleToPatient", id: "report-visible-to-patient", type: "checkbox" },
  { key: "reportAbnormalFlag", id: "report-abnormal-flag", type: "checkbox" },
  { key: "consultRequestedBy", id: "consult-requested-by" },
  { key: "consultantName", id: "consultant-name" },
  { key: "consultantSpecialty", id: "consultant-specialty" },
  { key: "consultReason", id: "consult-reason" },
  { key: "consultDate", id: "consult-date" },
  { key: "consultTime", id: "consult-time" },
  { key: "consultStatus", id: "consult-status" },
  { key: "consultRescheduleReason", id: "consult-reschedule-reason" },
  { key: "consultNotes", id: "consult-notes" },
  { key: "availabilityProvider", id: "availability-provider" },
  { key: "availabilityLocation", id: "availability-location" },
  { key: "availabilitySlotDuration", id: "availability-slot-duration" },
  { key: "availabilityMaxPatients", id: "availability-max-patients" },
  { key: "availabilityBlockedDates", id: "availability-blocked-dates" },
  { key: "availableSlotOne", id: "available-slot-one" },
  { key: "availableSlotTwo", id: "available-slot-two" },
  { key: "availableSlotThree", id: "available-slot-three" },
  { key: "availableSlotFour", id: "available-slot-four" },
  { key: "availableSlotFive", id: "available-slot-five" },
  { key: "appointmentDoctor", id: "appointment-doctor" },
  { key: "appointmentDepartment", id: "appointment-department" },
  { key: "appointmentDate", id: "appointment-date" },
  { key: "appointmentTime", id: "appointment-time" },
  { key: "slotDuration", id: "slot-duration" },
  { key: "visitReason", id: "visit-reason" },
  { key: "appointmentStatus", id: "appointment-status" },
  { key: "appointmentRescheduleReason", id: "appointment-reschedule-reason" },
  { key: "followUpProvider", id: "follow-up-provider" },
  { key: "followUpType", id: "follow-up-type" },
  { key: "nextTestDate", id: "next-test-date" },
  { key: "followUpReminderDate", id: "follow-up-reminder-date" },
  { key: "expectedDischarge", id: "expected-discharge" },
  { key: "dischargeDate", id: "discharge-date" },
  { key: "dischargeFinalDiagnosis", id: "discharge-final-diagnosis" },
  { key: "hospitalCourse", id: "hospital-course" },
  { key: "proceduresPerformed", id: "procedures-performed" },
  { key: "dischargeSummary", id: "discharge-summary" },
  { key: "dischargeMedication", id: "discharge-medication" },
  { key: "homeCare", id: "home-care" },
  { key: "warningSigns", id: "warning-signs" },
  { key: "dischargeBlockers", id: "discharge-blockers" },
  { key: "dischargeSignoffBy", id: "discharge-signoff-by" },
  { key: "dischargeSignoffAt", id: "discharge-signoff-at" },
  { key: "followUpDate", id: "follow-up-date" },
  { key: "reviewInstructions", id: "review-instructions" },
  { key: "medicationReminderDate", id: "medication-reminder-date" },
  { key: "doctorReviewReminderDate", id: "doctor-review-reminder-date" },
  { key: "testReminderDate", id: "test-reminder-date" },
  { key: "dischargeChecklistCounselingComplete", id: "discharge-checklist-counseling-complete", type: "checkbox" },
  { key: "dischargeChecklistDocumentsShared", id: "discharge-checklist-documents-shared", type: "checkbox" },
  { key: "dischargeChecklistRemindersEnabled", id: "discharge-checklist-reminders-enabled", type: "checkbox" },
  { key: "dischargeChecklistCaregiverInformed", id: "discharge-checklist-caregiver-informed", type: "checkbox" },
  { key: "dischargePackPublished", id: "discharge-pack-published", type: "checkbox" },
  { key: "documentCategory", id: "document-category" },
  { key: "documentDate", id: "document-date" },
  { key: "documentSource", id: "document-source" },
  { key: "documentOwner", id: "document-owner" },
  { key: "documentUploadReference", id: "document-upload-reference" },
  { key: "documentVisibility", id: "document-visibility" },
  { key: "documentCurrentStatus", id: "document-current-status" },
  { key: "documentVersionNote", id: "document-version-note" },
  { key: "noteAuthor", id: "note-author" },
  { key: "noteTimestamp", id: "note-timestamp" },
  { key: "staffNotes", id: "staff-notes" },
  { key: "doctorNotes", id: "doctor-notes" },
  { key: "handoverNotes", id: "handover-notes" },
  { key: "notePatientFacing", id: "note-patient-facing", type: "checkbox" },
  { key: "reminderOwner", id: "reminder-owner" },
  { key: "reminderDueDate", id: "reminder-due-date" },
  { key: "reminderStatus", id: "reminder-status" },
  { key: "patientNotificationTrigger", id: "patient-notification-trigger" },
  { key: "notificationTemplate", id: "notification-template" },
  { key: "whoUpdatedWhat", id: "who-updated-what" },
  { key: "timestampLogs", id: "timestamp-logs" },
  { key: "editHistoryCount", id: "edit-history-count" },
  { key: "roleBasedVisibility", id: "role-based-visibility" },
  { key: "approvalFlow", id: "approval-flow" },
  { key: "accessReviewNotes", id: "access-review-notes" },
  { key: "masterDataChangeNotes", id: "master-data-change-notes" },
  { key: "policySettingNotes", id: "policy-setting-notes" },
  { key: "breakGlassReason", id: "break-glass-reason" },
  { key: "auditExportPurpose", id: "audit-export-purpose" },
  { key: "exportApprovedBy", id: "export-approved-by" },
  { key: "doctorConsultNote", id: "doctor-consult-note" },
  { key: "doctorConsultNoteBy", id: "doctor-consult-note-by" },
  { key: "doctorConsultNoteAt", id: "doctor-consult-note-at" },
  { key: "dischargeConfirmedByDoctor", id: "discharge-confirmed-by-doctor", type: "checkbox" },
  { key: "dischargeConfirmedBy", id: "discharge-confirmed-by" },
  { key: "dischargeConfirmedAt", id: "discharge-confirmed-at" }
];

const CREATE_COPY = {
  label: "Module 02",
  title: "Patient registration and admission entry",
  intro:
    "All core identity, admission, doctor assignment, emergency, and clinical entry points are grouped here so the patient record starts complete.",
  submit: "Save admission",
  footer: "Save admission"
};

const getEditCopy = fullName => ({
  label: "Edit admission",
  title: fullName ? `Edit ${fullName}` : "Edit patient record",
  intro:
    "Use the sidebar to move through admission, profile, activity, care, medication, reports, consultant visits, slots, discharge, notes, and audit before saving the changes.",
  submit: "Save changes",
  footer: "Save changes"
});

const REPORT_TAB_CONTENT = {
  "Radiology reports": {
    title: "Radiology reports",
    copy: "Capture imaging report orders, scheduling, result readiness, attached files, and patient-side visibility."
  },
  "Pathology reports": {
    title: "Pathology reports",
    copy: "Track pathology specimen workflows, schedule milestones, completed findings, and release visibility."
  },
  Cardiology: {
    title: "Cardiology",
    copy: "Manage cardiology diagnostics, scheduling windows, finalized results, and whether the patient can view them."
  },
  "Clinical reports (Biopsy, microbiology, genetic)": {
    title: "Clinical reports (Biopsy, microbiology, genetic)",
    copy: "Organize biopsy, microbiology, and genetic reports with one structured workflow for dates, files, remarks, and visibility."
  },
  "Surgical reports": {
    title: "Surgical reports",
    copy: "Record surgery-related reports, timing checkpoints, uploaded documents, and patient-side publication status."
  }
};

const REPORT_ENTRY_FIELDS = [
  "reportName",
  "reportType",
  "reportOrderingClinician",
  "orderedDate",
  "scheduledDate",
  "reportStatus",
  "resultDate",
  "reportReviewedBy",
  "reportReviewedAt",
  "reportReleaseStatus",
  "reportRemarks",
  "reportFileReference",
  "reportVisibleToPatient",
  "reportAbnormalFlag"
];

const createEmptyReportEntry = reportType => ({
  reportName: "",
  reportType,
  reportOrderingClinician: "",
  orderedDate: "",
  scheduledDate: "",
  reportStatus: "",
  resultDate: "",
  reportReviewedBy: "",
  reportReviewedAt: "",
  reportReleaseStatus: "",
  reportRemarks: "",
  reportFileReference: "",
  reportVisibleToPatient: false,
  reportAbnormalFlag: false
});

const normalizeReportEntry = (report, fallbackType) => ({
  reportName: String(report?.reportName || "").trim(),
  reportType: REPORT_TAB_CONTENT[String(report?.reportType || "").trim()]
    ? String(report.reportType).trim()
    : fallbackType,
  reportOrderingClinician: String(report?.reportOrderingClinician || "").trim(),
  orderedDate: normalizeDateInputValue(report?.orderedDate),
  scheduledDate: normalizeDateInputValue(report?.scheduledDate),
  reportStatus: String(report?.reportStatus || "").trim(),
  resultDate: normalizeDateInputValue(report?.resultDate),
  reportReviewedBy: String(report?.reportReviewedBy || "").trim(),
  reportReviewedAt: String(report?.reportReviewedAt || "").trim(),
  reportReleaseStatus: String(report?.reportReleaseStatus || "").trim(),
  reportRemarks: String(report?.reportRemarks || "").trim(),
  reportFileReference: String(report?.reportFileReference || "").trim(),
  reportVisibleToPatient: Boolean(report?.reportVisibleToPatient),
  reportAbnormalFlag: Boolean(report?.reportAbnormalFlag)
});

const hasReportEntryContent = report =>
  Boolean(
    String(report?.reportName || "").trim() ||
      String(report?.orderedDate || "").trim() ||
      String(report?.scheduledDate || "").trim() ||
      String(report?.reportStatus || "").trim() ||
      String(report?.resultDate || "").trim() ||
      String(report?.reportReviewedBy || "").trim() ||
      String(report?.reportReviewedAt || "").trim() ||
      String(report?.reportReleaseStatus || "").trim() ||
      String(report?.reportRemarks || "").trim() ||
      String(report?.reportFileReference || "").trim() ||
      Boolean(report?.reportVisibleToPatient) ||
      Boolean(report?.reportAbnormalFlag)
  );

const areReportEntriesEqual = (left, right) =>
  REPORT_ENTRY_FIELDS.every(field => left?.[field] === right?.[field]);

const normalizeReportEntriesFromRecord = (record, fallbackType) => {
  if (Array.isArray(record?.reports)) {
    return record.reports
      .map(report => normalizeReportEntry(report, fallbackType))
      .filter(hasReportEntryContent);
  }

  const legacyReport = normalizeReportEntry(record, fallbackType);
  return hasReportEntryContent(legacyReport) ? [legacyReport] : [];
};

const buildLegacyReportFields = reports => {
  const latestReport = reports.length > 0 ? reports[reports.length - 1] : null;

  if (!latestReport) {
    return {
      reportName: null,
      reportType: null,
      reportOrderingClinician: null,
      orderedDate: null,
      scheduledDate: null,
      reportStatus: null,
      resultDate: null,
      reportReviewedBy: null,
      reportReviewedAt: null,
      reportReleaseStatus: null,
      reportRemarks: null,
      reportFileReference: null,
      reportVisibleToPatient: false,
      reportAbnormalFlag: false
    };
  }

  return {
    reportName: latestReport.reportName || null,
    reportType: latestReport.reportType || null,
    reportOrderingClinician: latestReport.reportOrderingClinician || null,
    orderedDate: latestReport.orderedDate || null,
    scheduledDate: latestReport.scheduledDate || null,
    reportStatus: latestReport.reportStatus || null,
    resultDate: latestReport.resultDate || null,
    reportReviewedBy: latestReport.reportReviewedBy || null,
    reportReviewedAt: latestReport.reportReviewedAt || null,
    reportReleaseStatus: latestReport.reportReleaseStatus || null,
    reportRemarks: latestReport.reportRemarks || null,
    reportFileReference: latestReport.reportFileReference || null,
    reportVisibleToPatient: Boolean(latestReport.reportVisibleToPatient),
    reportAbnormalFlag: Boolean(latestReport.reportAbnormalFlag)
  };
};

const normalizeDateInputValue = value => {
  if (!value) {
    return "";
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const normalized = String(value).trim();
  const isoDateMatch = normalized.match(/^(\d{4}-\d{2}-\d{2})/);
  return isoDateMatch ? isoDateMatch[1] : normalized;
};

const normalizeTimeInputValue = value => {
  if (!value) {
    return "";
  }

  const normalized = String(value).trim();
  const timeMatch = normalized.match(/^(\d{2}:\d{2})/);
  return timeMatch ? timeMatch[1] : normalized;
};

const initializeReportWorkspace = ({ reportFields }) => {
  const reportTypeField = reportFields.reportType;
  const reportFileField = reportFields.reportFileReference;
  const tabs = [...document.querySelectorAll("[data-report-tab]")];
  const panelTitle = document.querySelector("[data-report-panel-title]");
  const panelCopy = document.querySelector("[data-report-panel-copy]");
  const fileInput = document.getElementById("report-file-upload");
  const fileFeedback = document.querySelector("[data-report-file-feedback]");
  const addButton = document.querySelector("[data-report-add]");
  const listStatus = document.querySelector("[data-report-list-status]");
  const listTitle = document.querySelector("[data-report-list-title]");
  const listCopy = document.querySelector("[data-report-list-copy]");
  const entryList = document.querySelector("[data-report-entry-list]");
  const emptyState = document.querySelector("[data-report-entry-empty]");

  if (
    !reportTypeField?.element ||
    !panelTitle ||
    !panelCopy ||
    tabs.length === 0 ||
    !reportFields.reportName?.element ||
    !reportFields.orderedDate?.element ||
    !reportFields.scheduledDate?.element ||
    !reportFields.reportStatus?.element ||
    !reportFields.resultDate?.element ||
    !reportFields.reportOrderingClinician?.element ||
    !reportFields.reportReviewedBy?.element ||
    !reportFields.reportReviewedAt?.element ||
    !reportFields.reportReleaseStatus?.element ||
    !reportFields.reportRemarks?.element ||
    !reportFields.reportVisibleToPatient?.element ||
    !reportFields.reportAbnormalFlag?.element ||
    !addButton ||
    !listStatus ||
    !listTitle ||
    !listCopy ||
    !entryList ||
    !emptyState
  ) {
    return {
      syncFromRecord: () => {},
      preparePayload: () => ({ reports: [], ...buildLegacyReportFields([]) })
    };
  }

  const defaultTab = tabs[0].dataset.reportTab;
  let activeReportType = REPORT_TAB_CONTENT[reportTypeField.element.value] ? reportTypeField.element.value : defaultTab;
  let reportEntries = [];

  const setListStatus = (message, tone = "muted") => {
    listStatus.textContent = message;
    listStatus.dataset.tone = tone;
  };

  const setFileFeedback = value => {
    if (!fileFeedback) {
      return;
    }

    fileFeedback.textContent = value || "No file selected. PDF, image, and DICOM references are allowed.";
  };

  const setActiveTab = reportType => {
    const nextType = REPORT_TAB_CONTENT[reportType] ? reportType : defaultTab;
    const content = REPORT_TAB_CONTENT[nextType];

    tabs.forEach(tab => {
      const isActive = tab.dataset.reportTab === nextType;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    activeReportType = nextType;
    reportTypeField.element.value = nextType;
    panelTitle.textContent = content.title;
    panelCopy.textContent = content.copy;
    listTitle.textContent = nextType;
    listCopy.textContent = `Showing the added ${nextType.toLowerCase()} for this patient record.`;
    renderReportList();
  };

  const readDraft = () =>
    normalizeReportEntry(
      {
        reportName: reportFields.reportName.element.value,
        reportType: activeReportType,
        reportOrderingClinician: reportFields.reportOrderingClinician.element.value,
        orderedDate: reportFields.orderedDate.element.value,
        scheduledDate: reportFields.scheduledDate.element.value,
        reportStatus: reportFields.reportStatus.element.value,
        resultDate: reportFields.resultDate.element.value,
        reportReviewedBy: reportFields.reportReviewedBy.element.value,
        reportReviewedAt: reportFields.reportReviewedAt.element.value,
        reportReleaseStatus: reportFields.reportReleaseStatus.element.value,
        reportRemarks: reportFields.reportRemarks.element.value,
        reportFileReference: reportFields.reportFileReference.element.value,
        reportVisibleToPatient: reportFields.reportVisibleToPatient.element.checked,
        reportAbnormalFlag: reportFields.reportAbnormalFlag.element.checked
      },
      activeReportType
    );

  const clearDraft = ({ preserveType = true } = {}) => {
    const nextDraft = createEmptyReportEntry(preserveType ? activeReportType : defaultTab);

    reportFields.reportName.element.value = nextDraft.reportName;
    reportFields.reportOrderingClinician.element.value = nextDraft.reportOrderingClinician;
    reportFields.orderedDate.element.value = nextDraft.orderedDate;
    reportFields.scheduledDate.element.value = nextDraft.scheduledDate;
    reportFields.reportStatus.element.value = nextDraft.reportStatus;
    reportFields.resultDate.element.value = nextDraft.resultDate;
    reportFields.reportReviewedBy.element.value = nextDraft.reportReviewedBy;
    reportFields.reportReviewedAt.element.value = nextDraft.reportReviewedAt;
    reportFields.reportReleaseStatus.element.value = nextDraft.reportReleaseStatus;
    reportFields.reportRemarks.element.value = nextDraft.reportRemarks;
    reportFields.reportFileReference.element.value = nextDraft.reportFileReference;
    reportFields.reportVisibleToPatient.element.checked = nextDraft.reportVisibleToPatient;
    reportFields.reportAbnormalFlag.element.checked = nextDraft.reportAbnormalFlag;

    if (fileInput) {
      fileInput.value = "";
    }

    setFileFeedback("");

    if (!preserveType) {
      setActiveTab(defaultTab);
      return;
    }

    reportTypeField.element.value = activeReportType;
  };

  const createDetail = (label, value) => {
    const item = document.createElement("div");

    const term = document.createElement("span");
    term.textContent = label;

    const detail = document.createElement("strong");
    detail.textContent = value || "Not provided";

    item.append(term, detail);
    return item;
  };

  const renderReportList = () => {
    const filteredReports = reportEntries.filter(report => report.reportType === activeReportType);

    entryList.replaceChildren(
      ...filteredReports.map(report => {
        const article = document.createElement("article");
        article.className = "report-entry";

        const header = document.createElement("div");
        header.className = "report-entry-head";

        const titleBlock = document.createElement("div");
        const title = document.createElement("h5");
        title.textContent = report.reportName || "Untitled report";
        const subtitle = document.createElement("p");
        subtitle.textContent = report.reportType;
        titleBlock.append(title, subtitle);

        const statusPill = document.createElement("span");
        statusPill.className = "report-entry-pill";
        statusPill.textContent = report.reportStatus || "Draft";

        header.append(titleBlock, statusPill);

        const grid = document.createElement("div");
        grid.className = "report-entry-grid";
        grid.append(
          createDetail("Clinician", report.reportOrderingClinician),
          createDetail("Ordered", report.orderedDate),
          createDetail("Scheduled", report.scheduledDate),
          createDetail("Result", report.resultDate),
          createDetail("File", report.reportFileReference),
          createDetail("Patient visible", report.reportVisibleToPatient ? "Yes" : "No"),
          createDetail("Reviewed by", report.reportReviewedBy),
          createDetail("Release", report.reportReleaseStatus),
          createDetail("Abnormal", report.reportAbnormalFlag ? "Yes" : "No")
        );

        article.append(header, grid);

        if (report.reportRemarks) {
          const remarks = document.createElement("p");
          remarks.className = "report-entry-remarks";
          remarks.textContent = report.reportRemarks;
          article.append(remarks);
        }

        return article;
      })
    );

    entryList.hidden = filteredReports.length === 0;
    emptyState.hidden = filteredReports.length > 0;
    emptyState.textContent =
      filteredReports.length > 0
        ? ""
        : `No ${activeReportType.toLowerCase()} have been added for this patient yet.`;
  };

  const commitDraft = ({ source = "add" } = {}) => {
    const draft = readDraft();

    if (!hasReportEntryContent(draft)) {
      return { valid: true, added: false };
    }

    if (!draft.reportName) {
      setListStatus("Report name is required before adding the report.", "error");
      return { valid: false, added: false };
    }

    if (reportEntries.some(report => areReportEntriesEqual(report, draft))) {
      if (source === "add") {
        setListStatus("This report is already listed under the selected category.", "muted");
      }
      clearDraft({ preserveType: true });
      return { valid: true, added: false };
    }

    reportEntries = [...reportEntries, draft];
    renderReportList();
    clearDraft({ preserveType: true });
    setListStatus(`Added ${draft.reportName} to ${draft.reportType}.`, "success");
    return { valid: true, added: true };
  };

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      setActiveTab(tab.dataset.reportTab);
    });
  });

  fileInput?.addEventListener("change", event => {
    const files = [...(event.currentTarget.files || [])];
    const value = files.length > 0 ? files.map(file => file.name).join(", ") : "";
    reportFileField.element.value = value;
    setFileFeedback(value);
  });

  addButton.addEventListener("click", () => {
    commitDraft({ source: "add" });
  });

  setActiveTab(activeReportType);
  clearDraft({ preserveType: true });
  renderReportList();

  return {
    syncFromRecord: record => {
      reportEntries = normalizeReportEntriesFromRecord(record, defaultTab);
      setActiveTab(record?.reportType || reportEntries[reportEntries.length - 1]?.reportType || defaultTab);
      clearDraft({ preserveType: true });
      setListStatus("", "muted");
      renderReportList();
    },
    preparePayload: () => {
      const commitResult = commitDraft({ source: "save" });

      if (!commitResult.valid) {
        return null;
      }

      return {
        reports: reportEntries.map(report => ({ ...report })),
        ...buildLegacyReportFields(reportEntries)
      };
    }
  };
};

const SECTION_DISPLAY_NAMES = {
  registration: "Patient Registration",
  profile: "Patient Profile",
  activity: "Daily Activity",
  care: "Care Summary",
  medication: "Medication",
  reports: "Reports & Diagnostics",
  consult: "Consultant Visit",
  availability: "Doctor Availability",
  discharge: "Discharge Planning",
  documents: "Document Center",
  notes: "Internal Notes",
  audit: "Audit"
};

const ROLE_PERMISSIONS = {
  "Inpatient coordinator / ward staff": {
    editableSections: ["activity", "care", "medication"],
    hiddenSections: ["audit"],
    canCreateAdmission: false
  },
  "Inpatient department admin / reception team": {
    editableSections: ["activity", "care", "medication", "audit"],
    hiddenSections: [],
    canCreateAdmission: false
  },
  "Reception / scheduling": {
    editableSections: ["registration", "profile", "availability", "consult", "audit"],
    hiddenSections: [],
    canCreateAdmission: true
  },
  "Nurses": {
    editableSections: ["profile", "activity", "care", "medication"],
    hiddenSections: ["audit"],
    canCreateAdmission: false
  },
  "Doctors": {
    editableSections: ["activity", "care", "medication", "reports", "consult", "availability", "discharge", "notes"],
    hiddenSections: ["audit"],
    canCreateAdmission: false
  },
  "Consultants": {
    editableSections: ["consult"],
    hiddenSections: ["registration", "profile", "documents", "audit"],
    canCreateAdmission: false
  },
  "Diagnostics / lab user": {
    editableSections: ["reports"],
    hiddenSections: ["activity", "care", "medication", "consult", "availability", "discharge", "documents", "notes", "audit"],
    canCreateAdmission: false
  },
  "Lab / report staff": {
    editableSections: ["reports"],
    hiddenSections: ["activity", "care", "medication", "consult", "availability", "discharge", "documents", "notes", "audit"],
    canCreateAdmission: false
  },
  "Privacy / compliance reviewer": {
    editableSections: ["documents", "audit"],
    hiddenSections: [],
    canCreateAdmission: false
  }
};

window.PDCMS.initializeAdmissions = () => {
  const apiUrl = window.PDCMS.productConfig?.apiUrl;
  const auth = window.PDCMS.auth;
  const form = document.querySelector("[data-admission-form]");
  const status = document.querySelector("[data-admission-status]");
  const admittedMetric = document.querySelector("[data-dashboard-admitted]");
  const admittedCaption = document.querySelector("[data-dashboard-admitted-caption]");
  const dischargeMetric = document.querySelector("[data-dashboard-discharge]");
  const dischargeCaption = document.querySelector("[data-dashboard-discharge-caption]");
  const pendingReportsMetric = document.querySelector("[data-dashboard-pending-reports]");
  const medicationDueMetric = document.querySelector("[data-dashboard-medication-due]");
  const consultsMetric = document.querySelector("[data-dashboard-consults]");
  const dailyNotesMetric = document.querySelector("[data-dashboard-daily-notes]");
  const priorityMetric = document.querySelector("[data-dashboard-priority]");
  const followupsMetric = document.querySelector("[data-dashboard-followups]");
  const unresolvedAlertsMetric = document.querySelector("[data-dashboard-unresolved-alerts]");
  const vitalsDueMetric = document.querySelector("[data-dashboard-vitals-due]");
  const abnormalReportsMetric = document.querySelector("[data-dashboard-abnormal-reports]");
  const dischargeBlockersMetric = document.querySelector("[data-dashboard-discharge-blockers]");
  const portalPendingMetric = document.querySelector("[data-dashboard-portal-pending]");
  const dashboardAlertList = document.querySelector("[data-dashboard-alert-list]");
  const auditEventList = document.querySelector("[data-audit-event-list]");
  const patientContextName = document.querySelector("[data-patient-context-name]");
  const patientContextMeta = document.querySelector("[data-patient-context-meta]");
  const patientContextRisk = document.querySelector("[data-patient-context-risk]");
  const summaryAdmission = document.querySelector("[data-summary-admission]");
  const summaryMedications = document.querySelector("[data-summary-medications]");
  const summaryReports = document.querySelector("[data-summary-reports]");
  const summaryNextAppointment = document.querySelector("[data-summary-next-appointment]");
  const availabilitySlotPreviews = [...document.querySelectorAll("[data-availability-slot-preview]")];
  const openRegistrationButton = document.querySelector("[data-open-registration]");
  const registrationLink = document.querySelector('[data-panel-link][href="#registration"]');
  const saveRecordButton = document.querySelector("[data-record-save]");
  const cancelEditButton = document.querySelector("[data-record-cancel]");
  const recordStatus = document.querySelector("[data-record-status]");
  const auditCommentInput = document.querySelector("[data-audit-comment]");
  const sectionLabel = document.querySelector("[data-admission-section-label]");
  const sectionTitle = document.querySelector("[data-admission-section-title]");
  const sectionIntro = document.querySelector("[data-admission-section-intro]");
  const submitLabel = document.querySelector("[data-admission-submit-label]");

  if (
    typeof apiUrl !== "function" ||
    !form ||
    !status ||
    !admittedMetric ||
    !admittedCaption ||
    !dischargeMetric ||
    !dischargeCaption ||
    !pendingReportsMetric ||
    !medicationDueMetric ||
    !consultsMetric ||
    !dailyNotesMetric ||
    !priorityMetric ||
    !followupsMetric ||
    !unresolvedAlertsMetric ||
    !vitalsDueMetric ||
    !abnormalReportsMetric ||
    !dischargeBlockersMetric ||
    !portalPendingMetric ||
    !dashboardAlertList ||
    !auditEventList ||
    !patientContextName ||
    !patientContextMeta ||
    !patientContextRisk ||
    !summaryAdmission ||
    !summaryMedications ||
    !summaryReports ||
    !summaryNextAppointment ||
    !saveRecordButton ||
    !cancelEditButton ||
    !recordStatus ||
    !sectionLabel ||
    !sectionTitle ||
    !sectionIntro ||
    !submitLabel
  ) {
    return;
  }

  const fieldEntries = FIELD_CONFIGS.map(config => [config.key, { ...config, element: document.getElementById(config.id) }]);
  if (fieldEntries.some(([, config]) => !config.element)) {
    return;
  }

  const fields = Object.fromEntries(fieldEntries);
  const reportWorkspace = initializeReportWorkspace({
    reportFields: {
      reportName: fields.reportName,
      reportType: fields.reportType,
      reportOrderingClinician: fields.reportOrderingClinician,
      orderedDate: fields.orderedDate,
      scheduledDate: fields.scheduledDate,
      reportStatus: fields.reportStatus,
      resultDate: fields.resultDate,
      reportReviewedBy: fields.reportReviewedBy,
      reportReviewedAt: fields.reportReviewedAt,
      reportReleaseStatus: fields.reportReleaseStatus,
      reportRemarks: fields.reportRemarks,
      reportFileReference: fields.reportFileReference,
      reportVisibleToPatient: fields.reportVisibleToPatient,
      reportAbnormalFlag: fields.reportAbnormalFlag
    }
  });
  const params = new URLSearchParams(window.location.search);
  let currentEditingRecordId = params.get("edit");
  let isEditMode = Boolean(currentEditingRecordId);
  let lastLoadedRecord = null;

  const setStatus = (message, tone = "muted") => {
    status.textContent = message;
    status.dataset.tone = tone;
  };

  const setRecordStatus = (message, tone = "muted") => {
    recordStatus.textContent = message;
    recordStatus.dataset.tone = tone;
  };

  const setBusy = isBusy => {
    submitLabel.disabled = isBusy;
    saveRecordButton.disabled = isBusy;
    cancelEditButton.disabled = isBusy;
  };

  const displayValue = value => {
    if (value === null || value === undefined || value === "") {
      return "Not provided";
    }

    return String(value);
  };

  const renderDashboardAlerts = summary => {
    const alerts = Array.isArray(summary.alerts) ? summary.alerts : [];

    if (alerts.length === 0) {
      dashboardAlertList.replaceChildren(
        Object.assign(document.createElement("article"), { className: "alert-item" })
      );
      const item = dashboardAlertList.firstElementChild;
      const dot = document.createElement("span");
      dot.className = "alert-dot info";
      const message = document.createElement("p");
      message.textContent = "No active alerts from saved patient records.";
      item.append(dot, message);
      return;
    }

    dashboardAlertList.replaceChildren(
      ...alerts.map(alert => {
        const item = document.createElement("article");
        item.className = "alert-item";

        const dot = document.createElement("span");
        dot.className = `alert-dot ${alert.severity || "info"}`;

        const message = document.createElement("p");
        message.textContent = alert.message;

        item.append(dot, message);
        return item;
      })
    );
  };

  const renderAuditEvents = record => {
    const events = [...(Array.isArray(record?.auditEvents) ? record.auditEvents : [])].reverse();

    if (events.length === 0) {
      auditEventList.replaceChildren();
      const row = document.createElement("div");
      const label = document.createElement("span");
      label.textContent = "No audit events loaded";
      const detail = document.createElement("strong");
      detail.textContent = "Save or open a record";
      row.append(label, detail);
      auditEventList.append(row);
      return;
    }

    auditEventList.replaceChildren(
      ...events.map(event => {
        const row = document.createElement("div");
        row.className = "audit-event-row";

        const header = document.createElement("div");
        header.className = "audit-event-header";
        const who = document.createElement("strong");
        who.textContent = event.userName || event.userEmail || "Unknown user";
        const roleTag = document.createElement("span");
        roleTag.className = "audit-event-role";
        roleTag.textContent = event.userRole || "";
        const when = document.createElement("span");
        when.className = "audit-event-time";
        when.textContent = event.timestamp ? new Date(event.timestamp).toLocaleString() : "";
        header.append(who, roleTag, when);

        const actionEl = document.createElement("div");
        actionEl.className = "audit-event-action";
        const eventType = event.eventType || event.action || "edit";
        actionEl.textContent = eventType === "create" ? "Created new admission record" : eventType === "access" ? "Accessed record (read-only)" : "Updated record";

        row.append(header, actionEl);

        const sectionsToRender = (() => {
          if (event.changedSections && typeof event.changedSections === "object" && !Array.isArray(event.changedSections)) {
            return Object.entries(event.changedSections).map(([id, fields]) => ({
              sectionName: SECTION_DISPLAY_NAMES[id] || id,
              fields: Array.isArray(fields) ? fields : []
            }));
          }
          if (Array.isArray(event.sections) && event.sections.length > 0) {
            return event.sections.map(sec => ({ sectionName: sec.sectionName || sec.sectionId, fields: sec.fields || [] }));
          }
          return [];
        })();

        if (sectionsToRender.length > 0) {
          const ul = document.createElement("ul");
          ul.className = "audit-event-sections";
          sectionsToRender.forEach(sec => {
            const li = document.createElement("li");
            const secName = document.createElement("span");
            secName.className = "audit-section-name";
            secName.textContent = sec.sectionName;
            li.append(secName);
            if (sec.fields.length > 0) {
              const fields = document.createElement("span");
              fields.className = "audit-section-fields";
              fields.textContent = ` — ${sec.fields.join(", ")}`;
              li.append(fields);
            }
            ul.append(li);
          });
          row.append(ul);
        }

        if (event.comment) {
          const commentEl = document.createElement("div");
          commentEl.className = "audit-event-comment";
          commentEl.textContent = `"${event.comment}"`;
          row.append(commentEl);
        }

        return row;
      })
    );
  };

  const renderPatientContext = record => {
    if (!record?.id) {
      return;
    }

    patientContextName.textContent = record.fullName || "Unnamed patient";
    patientContextMeta.textContent = `${displayValue(record.patientId)} / ${displayValue(record.admissionId)} - ${displayValue(record.ward)} ${displayValue(record.room)} ${displayValue(record.bedNumber)} - ${displayValue(record.doctor)}`;
    patientContextRisk.textContent = record.allergies
      ? `Allergy: ${record.allergies}`
      : record.status === "Critical" || record.status === "Isolation"
        ? record.status
        : "No high-risk flag";

    summaryAdmission.textContent = `${displayValue(record.status)} - ${displayValue(record.admissionDate)}`;
    summaryMedications.textContent = record.medicineName && record.medStatus !== "Stopped" ? "1 active" : "0 active";
    summaryReports.textContent = `${(record.reports || []).filter(report => !["Available", "Reviewed"].includes(report.reportStatus)).length} pending`;
    summaryNextAppointment.textContent =
      record.appointmentDate || record.followUpDate || record.consultDate || "Not booked";

    renderAuditEvents(record);
  };

  const syncAvailabilityPreview = () => {
    const slotKeys = ["availableSlotOne", "availableSlotTwo", "availableSlotThree", "availableSlotFour", "availableSlotFive"];

    availabilitySlotPreviews.forEach((preview, index) => {
      const value = fields[slotKeys[index]]?.element.value;
      preview.textContent = value ? value.replace("T", " ") : "Not configured";
    });
  };

  const syncDerivedAge = () => {
    const dob = fields.dateOfBirth.element.value;
    if (!dob || fields.age.element.value) {
      return;
    }

    const birthDate = new Date(`${dob}T00:00:00`);
    if (Number.isNaN(birthDate.getTime())) {
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDelta = today.getMonth() - birthDate.getMonth();
    if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
      age -= 1;
    }

    fields.age.element.value = String(Math.max(0, age));
  };

  const getFieldValue = config => {
    if (config.type === "checkbox") {
      return Boolean(config.element.checked);
    }

    return config.element.value;
  };

  const setFieldValue = (config, value) => {
    if (config.type === "checkbox") {
      config.element.checked = Boolean(value);
      return;
    }

    if (config.element.type === "date") {
      config.element.value = normalizeDateInputValue(value);
      return;
    }

    if (config.element.type === "time") {
      config.element.value = normalizeTimeInputValue(value);
      return;
    }

    config.element.value = value ?? "";
  };

  const ALL_SECTION_IDS = [
    "registration", "profile", "activity", "care", "medication",
    "reports", "consult", "availability", "discharge", "documents", "notes", "audit"
  ];

  const applyRolePermissions = () => {
    const role = window.PDCMS.auth?.readStoredSession?.()?.user?.role;
    const perms = ROLE_PERMISSIONS[role];
    if (!perms) return;

    (perms.hiddenSections || []).forEach(sectionId => {
      const section = document.getElementById(sectionId);
      if (section) section.setAttribute("hidden", "");
      const navLink = document.querySelector(`.sidebar-nav a[href="#${sectionId}"]`);
      if (navLink) navLink.setAttribute("hidden", "");
    });

    ALL_SECTION_IDS.forEach(sectionId => {
      if ((perms.hiddenSections || []).includes(sectionId)) return;
      if (perms.editableSections.includes(sectionId)) return;
      const section = document.getElementById(sectionId);
      if (!section) return;

      section.querySelectorAll("input:not([type='submit']), select, textarea").forEach(el => {
        el.disabled = true;
      });

      const sectionHead = section.querySelector(".section-head");
      if (sectionHead) {
        const badge = document.createElement("span");
        badge.className = "read-only-badge";
        badge.textContent = "View only";
        sectionHead.appendChild(badge);
      }
    });

    if (!perms.canCreateAdmission) {
      openRegistrationButton?.setAttribute("hidden", "");
    }
  };

  const fieldSectionMap = {};
  const fieldLabelMap = {};
  FIELD_CONFIGS.forEach(config => {
    const el = document.getElementById(config.id);
    if (!el) return;
    const section = el.closest("section[id]");
    if (section) fieldSectionMap[config.key] = section.id;
    const lbl = document.querySelector(`label[for="${config.id}"]`);
    if (lbl) fieldLabelMap[config.key] = lbl.textContent.trim().replace(/\s+/g, " ");
  });

  const SKIP_DIFF_KEYS = new Set(["sectionVisibility", "auditEvents", "fieldHistory"]);

  const normalizeForDiff = val => {
    if (val === null || val === undefined || val === "") return "";
    if (typeof val === "boolean") return val ? "true" : "false";
    return String(val).trim();
  };

  const diffRecord = (oldRecord, newPayload) => {
    if (!oldRecord) return null;
    const changed = {};
    FIELD_CONFIGS.forEach(config => {
      if (SKIP_DIFF_KEYS.has(config.key)) return;
      const oldVal = normalizeForDiff(oldRecord[config.key]);
      const newVal = normalizeForDiff(newPayload[config.key]);
      if (oldVal === newVal) return;
      const sectionId = fieldSectionMap[config.key] || "other";
      if (!changed[sectionId]) changed[sectionId] = [];
      changed[sectionId].push(fieldLabelMap[config.key] || config.key);
    });
    const oldReports = JSON.stringify(oldRecord.reports || []);
    const newReports = JSON.stringify(newPayload.reports || []);
    if (oldReports !== newReports) {
      changed.reports = changed.reports || [];
      if (!changed.reports.includes("Reports list")) changed.reports.push("Reports list");
    }
    return Object.keys(changed).length > 0 ? changed : null;
  };

  const buildAuditEvent = (changedSections, isNewRecord, comment) => {
    const session = window.PDCMS.auth?.readStoredSession?.();
    const user = session?.user;
    const sections = isNewRecord
      ? []
      : Object.entries(changedSections || {}).map(([sectionId, fieldLabels]) => ({
          sectionId,
          sectionName: SECTION_DISPLAY_NAMES[sectionId] || sectionId,
          fields: fieldLabels
        }));
    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userName: user?.fullName || user?.name || user?.email || "Unknown user",
      userEmail: user?.email || "",
      userRole: user?.role || "Unknown role",
      action: isNewRecord ? "create" : "update",
      sections,
      comment: comment || ""
    };
  };

  const parseRecordAuditEvents = record => {
    if (!record) return record;
    if (typeof record.auditEvents === "string") {
      try { record.auditEvents = JSON.parse(record.auditEvents); } catch { record.auditEvents = []; }
    }
    if (!Array.isArray(record.auditEvents)) record.auditEvents = [];
    return record;
  };

  const VISIBILITY_SECTIONS = [
    "registration", "profile", "activity", "care", "medication",
    "reports", "consult", "availability", "discharge", "documents", "notes"
  ];

  const visibilityCheckboxes = Object.fromEntries(
    VISIBILITY_SECTIONS.map(id => [id, document.querySelector(`[data-visibility-check="${id}"]`)])
  );

  VISIBILITY_SECTIONS.forEach(id => {
    const checkbox = visibilityCheckboxes[id];
    if (!checkbox) return;
    const badge = checkbox.closest(".visibility-badge");
    checkbox.addEventListener("change", () => {
      badge?.classList.toggle("is-visible", checkbox.checked);
    });
  });

  const initVisibilityRole = () => {
    const role = window.PDCMS.auth?.readStoredSession?.()?.user?.role;
    const isPrivacyReviewer = role === "Privacy / compliance reviewer";
    VISIBILITY_SECTIONS.forEach(id => {
      const checkbox = visibilityCheckboxes[id];
      if (!checkbox) return;
      const badge = checkbox.closest(".visibility-badge");
      badge?.classList.toggle("is-editable", isPrivacyReviewer);
      checkbox.disabled = !isPrivacyReviewer;
    });
  };

  const populateVisibility = record => {
    let parsed = {};
    try { parsed = JSON.parse(record.sectionVisibility || "{}"); } catch {}
    VISIBILITY_SECTIONS.forEach(id => {
      const checkbox = visibilityCheckboxes[id];
      if (!checkbox) return;
      const badge = checkbox.closest(".visibility-badge");
      const visible = parsed[id] === true;
      checkbox.checked = visible;
      badge?.classList.toggle("is-visible", visible);
    });
  };

  const collectVisibility = () => JSON.stringify(
    Object.fromEntries(VISIBILITY_SECTIONS.map(id => [id, visibilityCheckboxes[id]?.checked === true]))
  );

  const readPayload = () => {
    const payload = Object.fromEntries(Object.entries(fields).map(([key, config]) => [key, getFieldValue(config)]));
    const reportPayload = reportWorkspace.preparePayload();

    if (!reportPayload) {
      return null;
    }

    return {
      ...payload,
      ...reportPayload,
      sectionVisibility: collectVisibility()
    };
  };

  const populateFields = record => {
    Object.entries(fields).forEach(([key, config]) => {
      setFieldValue(config, record[key]);
    });
    reportWorkspace.syncFromRecord(record);
    syncAvailabilityPreview();
    renderPatientContext(record);
    populateVisibility(record);
  };

  const requestJson = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(auth?.buildAuthHeaders(options.headers || {}) || options.headers || {})
      },
      ...options
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "Request failed.");
    }

    return payload;
  };

  const updateDashboard = async () => {
    const summary = await requestJson(apiUrl("/api/dashboard/summary"));
    admittedMetric.textContent = String(summary.admittedPatients ?? 0);
    dischargeMetric.textContent = String(summary.dischargePlanned ?? 0);
    pendingReportsMetric.textContent = String(summary.pendingReports ?? 0);
    medicationDueMetric.textContent = String(summary.dueMedicationTasks ?? 0);
    consultsMetric.textContent = String(summary.upcomingConsults ?? 0);
    dailyNotesMetric.textContent = String(summary.dailyNoteUpdatesNeeded ?? 0);
    priorityMetric.textContent = String(summary.priorityPatients ?? 0);
    followupsMetric.textContent = String(summary.dischargeFollowUps ?? 0);
    unresolvedAlertsMetric.textContent = `${summary.unresolvedAlerts ?? 0} unresolved`;
    vitalsDueMetric.textContent = String(summary.vitalsMonitoringDue ?? 0);
    abnormalReportsMetric.textContent = String(summary.abnormalReports ?? 0);
    dischargeBlockersMetric.textContent = String(summary.dischargeBlockers ?? 0);
    portalPendingMetric.textContent = String(summary.portalSetupPending ?? 0);

    admittedCaption.textContent =
      Number(summary.admittedPatients) > 0 ? "Records saved in backend" : "No admissions yet";
    dischargeCaption.textContent =
      Number(summary.dischargePlanned) > 0 ? "Patients marked for discharge" : "No planned discharges";

    renderDashboardAlerts(summary);
  };

  const syncEditUrl = recordId => {
    const nextUrl = new URL(window.location.href);

    if (recordId) {
      nextUrl.searchParams.set("edit", recordId);
      if (!nextUrl.hash) {
        nextUrl.hash = "registration";
      }
    } else {
      nextUrl.searchParams.delete("edit");
    }

    history.replaceState(null, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
  };

  const setModeCopy = record => {
    const copy = isEditMode ? getEditCopy(record?.fullName) : CREATE_COPY;

    sectionLabel.textContent = copy.label;
    sectionTitle.textContent = copy.title;
    sectionIntro.textContent = copy.intro;
    submitLabel.textContent = copy.submit;
    saveRecordButton.textContent = copy.footer;
    cancelEditButton.hidden = !isEditMode;
  };

  const saveRecord = async () => {
    const wasEditMode = isEditMode;
    const payload = readPayload();

    if (!payload) {
      setStatus("Fix the report entry before saving the patient record.", "error");
      setRecordStatus("Fix the report entry before saving the patient record.", "error");
      return;
    }

    const comment = auditCommentInput?.value?.trim() || "";
    const changedSections = wasEditMode ? diffRecord(lastLoadedRecord, payload) : null;
    payload.auditComment = comment;
    payload.changedSectionsSummary = changedSections ? JSON.stringify(changedSections) : "";
    if (auditCommentInput) auditCommentInput.value = "";

    setBusy(true);
    setStatus(wasEditMode ? "Saving changes..." : "Saving admission...");
    setRecordStatus(wasEditMode ? "Saving changes..." : "Saving admission...");

    try {
      const admission = await requestJson(
        wasEditMode ? apiUrl(`/api/admissions/${currentEditingRecordId}`) : apiUrl("/api/admissions"),
        {
          method: wasEditMode ? "PATCH" : "POST",
          body: JSON.stringify(payload)
        }
      );

      lastLoadedRecord = admission;
      currentEditingRecordId = admission.id;
      isEditMode = true;
      syncEditUrl(admission.id);
      populateFields(admission);
      setModeCopy(admission);
      await updateDashboard();

      if (wasEditMode) {
        setStatus(`Saved changes for ${admission.fullName}.`, "success");
        setRecordStatus("All section updates were saved.", "success");
      } else {
        setStatus(
          `Saved ${admission.fullName} as ${admission.admissionId} / ${admission.patientId}.`,
          "success"
        );
        setRecordStatus("The record is now open in edit mode across all sidebar sections.", "success");
      }
    } catch (error) {
      setStatus(error.message, "error");
      setRecordStatus(error.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const loadEditRecord = async recordId => {
    if (!recordId) {
      setModeCopy();
      return;
    }

    setBusy(true);
    setStatus("Loading patient record...");
    setRecordStatus("Loading patient record...");

    try {
      const record = await requestJson(apiUrl(`/api/admissions/${recordId}`));
      lastLoadedRecord = record;
      currentEditingRecordId = record.id;
      isEditMode = true;
      populateFields(record);
      setModeCopy(record);
      setStatus(`Loaded ${record.fullName} for editing.`, "success");
      setRecordStatus("Use the sidebar to review each section, then save changes.", "muted");
    } catch (error) {
      currentEditingRecordId = null;
      isEditMode = false;
      syncEditUrl(null);
      setModeCopy();
      setStatus(error.message, "error");
      setRecordStatus(error.message, "error");
    } finally {
      setBusy(false);
    }
  };

  form.addEventListener("submit", event => {
    event.preventDefault();
    void saveRecord();
  });

  saveRecordButton.addEventListener("click", () => {
    void saveRecord();
  });

  cancelEditButton.addEventListener("click", () => {
    window.location.href = "/patients";
  });

  openRegistrationButton?.addEventListener("click", () => {
    registrationLink?.click();
    setTimeout(() => {
      fields.fullName.element.focus();
    }, 0);
  });

  fields.dateOfBirth.element.addEventListener("change", syncDerivedAge);
  ["availableSlotOne", "availableSlotTwo", "availableSlotThree", "availableSlotFour", "availableSlotFive"].forEach(key => {
    fields[key].element.addEventListener("change", syncAvailabilityPreview);
  });

  const restrictDoctorOnlyFields = () => {
    const role = window.PDCMS.auth?.readStoredSession?.()?.user?.role;
    const canConfirmDischarge = role === "Doctors" || role === "Head admin / super admin";
    document.querySelectorAll("[data-doctor-only]").forEach(el => {
      el.disabled = !canConfirmDischarge;
    });
  };

  initVisibilityRole();
  applyRolePermissions();
  restrictDoctorOnlyFields();
  setModeCopy();
  syncAvailabilityPreview();

  if (isEditMode) {
    if (!window.location.hash) {
      registrationLink?.click();
    }

    void loadEditRecord(currentEditingRecordId);
  }

  void updateDashboard().catch(() => {
    admittedCaption.textContent = "Unable to load counts";
    dischargeCaption.textContent = "Unable to load counts";
  });
};
