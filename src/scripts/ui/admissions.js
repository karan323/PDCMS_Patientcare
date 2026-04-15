window.PDCMS = window.PDCMS || {};

window.PDCMS.initializeAdmissions = () => {
  const apiUrl = window.PDCMS.productConfig?.apiUrl;
  const form = document.querySelector("[data-admission-form]");
  const status = document.querySelector("[data-admission-status]");
  const admittedMetric = document.querySelector("[data-dashboard-admitted]");
  const admittedCaption = document.querySelector("[data-dashboard-admitted-caption]");
  const dischargeMetric = document.querySelector("[data-dashboard-discharge]");
  const dischargeCaption = document.querySelector("[data-dashboard-discharge-caption]");
  const openRegistrationButton = document.querySelector("[data-open-registration]");
  const registrationLink = document.querySelector('[data-panel-link][href="#registration"]');

  if (
    typeof apiUrl !== "function" ||
    !form ||
    !status ||
    !admittedMetric ||
    !admittedCaption ||
    !dischargeMetric ||
    !dischargeCaption
  ) {
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');

  const getField = id => document.getElementById(id);

  const setStatus = (message, tone = "muted") => {
    status.textContent = message;
    status.dataset.tone = tone;
  };

  const setBusy = isBusy => {
    if (submitButton) {
      submitButton.disabled = isBusy;
    }
  };

  const requestJson = async (url, options = {}) => {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
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

  const readPayload = () => ({
    patientId: getField("patient-id")?.value,
    admissionId: getField("admission-id")?.value,
    fullName: getField("patient-name")?.value,
    age: getField("age")?.value,
    gender: getField("gender")?.value,
    dateOfBirth: getField("dob")?.value,
    mobileNumber: getField("mobile")?.value,
    address: getField("address")?.value,
    emergencyContact: getField("emergency-contact")?.value,
    bloodGroup: getField("blood-group")?.value,
    insuranceProfileType: getField("insurance")?.value,
    admissionDate: getField("admission-date")?.value,
    admissionTime: getField("admission-time")?.value,
    department: getField("department")?.value,
    ward: getField("ward")?.value,
    room: getField("room")?.value,
    bedNumber: getField("bed-number")?.value,
    doctor: getField("doctor")?.value,
    diagnosis: getField("diagnosis")?.value,
    allergies: getField("allergies")?.value,
    status: getField("status")?.value
  });

  form.addEventListener("submit", event => {
    event.preventDefault();

    const payload = readPayload();
    setBusy(true);
    setStatus("Saving admission...");

    void requestJson(apiUrl("/api/admissions"), {
      method: "POST",
      body: JSON.stringify(payload)
    })
      .then(async admission => {
        form.reset();
        await updateDashboard();
        setStatus(
          `Saved ${admission.fullName} as ${admission.admissionId} / ${admission.patientId}.`,
          "success"
        );
      })
      .catch(error => {
        setStatus(error.message, "error");
      })
      .finally(() => {
        setBusy(false);
      });
  });

  openRegistrationButton?.addEventListener("click", () => {
    registrationLink?.click();
    setTimeout(() => {
      getField("patient-name")?.focus();
    }, 0);
  });

  void updateDashboard().catch(() => {
    admittedCaption.textContent = "Unable to load counts";
    dischargeCaption.textContent = "Unable to load counts";
  });
};
