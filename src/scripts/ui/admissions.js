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
  { key: "bloodGroup", id: "blood-group" },
  { key: "insuranceProfileType", id: "insurance" },
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
  { key: "assignedNurse", id: "assigned-nurse" },
  { key: "profileAssignedDoctor", id: "profile-assigned-doctor" },
  { key: "admissionHistory", id: "admission-history" },
  { key: "currentRoom", id: "current-room" },
  { key: "profileConditionSummary", id: "profile-condition-summary" },
  { key: "attachedDocumentsCount", id: "attached-documents-count" },
  { key: "documentReference", id: "document-reference" },
  { key: "dischargeSummaryVisibleToPatient", id: "discharge-summary-visible-to-patient", type: "checkbox" },
  { key: "consultantNoteVisibleToPatient", id: "consultant-note-visible-to-patient", type: "checkbox" },
  { key: "finalLabReportVisibleToPatient", id: "final-lab-report-visible-to-patient", type: "checkbox" },
  { key: "activityDate", id: "activity-date" },
  { key: "activityTime", id: "activity-time" },
  { key: "activityType", id: "activity-type" },
  { key: "nursingUpdate", id: "nursing-update" },
  { key: "doctorRounds", id: "doctor-rounds" },
  { key: "vitalsRecorded", id: "vitals-recorded", type: "checkbox" },
  { key: "mealCompleted", id: "meal-completed", type: "checkbox" },
  { key: "procedureCompleted", id: "procedure-completed", type: "checkbox" },
  { key: "mobilityDone", id: "mobility-done", type: "checkbox" },
  { key: "remarks", id: "remarks" },
  { key: "treatmentNotes", id: "treatment-notes" },
  { key: "diagnosisUpdate", id: "diagnosis-update" },
  { key: "careConditionSummary", id: "condition-summary" },
  { key: "dietInstructions", id: "diet-instructions" },
  { key: "precautions", id: "precautions" },
  { key: "progressNotes", id: "progress-notes" },
  { key: "medicineName", id: "medicine-name" },
  { key: "dose", id: "dose" },
  { key: "medicineType", id: "medicine-type" },
  { key: "route", id: "route" },
  { key: "frequency", id: "frequency" },
  { key: "timing", id: "timing" },
  { key: "duration", id: "duration" },
  { key: "food", id: "food" },
  { key: "startDate", id: "start-date" },
  { key: "endDate", id: "end-date" },
  { key: "prescribedBy", id: "prescribed-by" },
  { key: "medStatus", id: "med-status" },
  { key: "medInstructions", id: "med-instructions" },
  { key: "reportName", id: "report-name" },
  { key: "reportType", id: "report-type" },
  { key: "orderedDate", id: "ordered-date" },
  { key: "scheduledDate", id: "scheduled-date" },
  { key: "reportStatus", id: "report-status" },
  { key: "resultDate", id: "result-date" },
  { key: "reportRemarks", id: "report-remarks" },
  { key: "reportFileReference", id: "report-file-reference" },
  { key: "reportVisibleToPatient", id: "report-visible-to-patient", type: "checkbox" },
  { key: "consultantName", id: "consultant-name" },
  { key: "consultantSpecialty", id: "consultant-specialty" },
  { key: "consultReason", id: "consult-reason" },
  { key: "consultDate", id: "consult-date" },
  { key: "consultTime", id: "consult-time" },
  { key: "consultStatus", id: "consult-status" },
  { key: "consultNotes", id: "consult-notes" },
  { key: "appointmentDoctor", id: "appointment-doctor" },
  { key: "appointmentDepartment", id: "appointment-department" },
  { key: "appointmentDate", id: "appointment-date" },
  { key: "appointmentTime", id: "appointment-time" },
  { key: "slotDuration", id: "slot-duration" },
  { key: "visitReason", id: "visit-reason" },
  { key: "appointmentStatus", id: "appointment-status" },
  { key: "expectedDischarge", id: "expected-discharge" },
  { key: "dischargeDate", id: "discharge-date" },
  { key: "dischargeSummary", id: "discharge-summary" },
  { key: "dischargeMedication", id: "discharge-medication" },
  { key: "homeCare", id: "home-care" },
  { key: "warningSigns", id: "warning-signs" },
  { key: "followUpDate", id: "follow-up-date" },
  { key: "reviewInstructions", id: "review-instructions" },
  { key: "staffNotes", id: "staff-notes" },
  { key: "doctorNotes", id: "doctor-notes" },
  { key: "handoverNotes", id: "handover-notes" },
  { key: "notePatientFacing", id: "note-patient-facing", type: "checkbox" },
  { key: "whoUpdatedWhat", id: "who-updated-what" },
  { key: "timestampLogs", id: "timestamp-logs" },
  { key: "editHistoryCount", id: "edit-history-count" },
  { key: "roleBasedVisibility", id: "role-based-visibility" },
  { key: "approvalFlow", id: "approval-flow" }
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

const initializeReportWorkspace = ({ reportTypeField, reportFileField }) => {
  const tabs = [...document.querySelectorAll("[data-report-tab]")];
  const panelTitle = document.querySelector("[data-report-panel-title]");
  const panelCopy = document.querySelector("[data-report-panel-copy]");
  const fileInput = document.getElementById("report-file-upload");
  const fileFeedback = document.querySelector("[data-report-file-feedback]");

  if (!reportTypeField?.element || !panelTitle || !panelCopy || tabs.length === 0) {
    return {
      syncFromRecord: () => {},
      resetFileFeedback: () => {}
    };
  }

  const defaultTab = tabs[0].dataset.reportTab;

  const setFileFeedback = value => {
    if (!fileFeedback) {
      return;
    }

    fileFeedback.textContent = value || "No file selected. Only DICOM and PDF files are allowed.";
  };

  const setActiveTab = reportType => {
    const nextType = REPORT_TAB_CONTENT[reportType] ? reportType : defaultTab;
    const content = REPORT_TAB_CONTENT[nextType];

    tabs.forEach(tab => {
      const isActive = tab.dataset.reportTab === nextType;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    reportTypeField.element.value = nextType;
    panelTitle.textContent = content.title;
    panelCopy.textContent = content.copy;
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

  setActiveTab(reportTypeField.element.value);
  setFileFeedback(reportFileField?.element?.value);

  return {
    syncFromRecord: record => {
      setActiveTab(record?.reportType);
      setFileFeedback(record?.reportFileReference || "");
      if (fileInput && !record?.reportFileReference) {
        fileInput.value = "";
      }
    },
    resetFileFeedback: () => {
      if (fileInput) {
        fileInput.value = "";
      }

      setActiveTab(defaultTab);
      reportFileField.element.value = "";
      setFileFeedback("");
    }
  };
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
  const openRegistrationButton = document.querySelector("[data-open-registration]");
  const registrationLink = document.querySelector('[data-panel-link][href="#registration"]');
  const saveRecordButton = document.querySelector("[data-record-save]");
  const cancelEditButton = document.querySelector("[data-record-cancel]");
  const recordStatus = document.querySelector("[data-record-status]");
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
    reportTypeField: fields.reportType,
    reportFileField: fields.reportFileReference
  });
  const params = new URLSearchParams(window.location.search);
  let currentEditingRecordId = params.get("edit");
  let isEditMode = Boolean(currentEditingRecordId);

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

    config.element.value = value ?? "";
  };

  const readPayload = () =>
    Object.fromEntries(Object.entries(fields).map(([key, config]) => [key, getFieldValue(config)]));

  const populateFields = record => {
    Object.entries(fields).forEach(([key, config]) => {
      setFieldValue(config, record[key]);
    });
    reportWorkspace.syncFromRecord(record);
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

    admittedCaption.textContent =
      Number(summary.admittedPatients) > 0 ? "Records saved in backend" : "No admissions yet";
    dischargeCaption.textContent =
      Number(summary.dischargePlanned) > 0 ? "Patients marked for discharge" : "No planned discharges";
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

  setModeCopy();

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
