window.PDCMS = window.PDCMS || {};

window.PDCMS.initializePatientSearch = () => {
  const apiUrl = window.PDCMS.productConfig?.apiUrl;
  const form = document.querySelector("[data-patient-search-form]");
  const input = document.querySelector("[data-patient-search-input]");
  const resetButton = document.querySelector("[data-patient-search-reset]");
  const status = document.querySelector("[data-patient-search-status]");
  const list = document.querySelector("[data-patient-record-list]");
  const empty = document.querySelector("[data-patient-record-empty]");
  const count = document.querySelector("[data-patient-search-count]");
  const caption = document.querySelector("[data-patient-search-caption]");

  if (
    typeof apiUrl !== "function" ||
    !form ||
    !input ||
    !resetButton ||
    !status ||
    !list ||
    !empty ||
    !count ||
    !caption
  ) {
    return;
  }

  const setStatus = (message, tone = "muted") => {
    status.textContent = message;
    status.dataset.tone = tone;
  };

  const requestJson = async url => {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json" }
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.error || "Request failed.");
    }

    return payload;
  };

  const displayValue = value => {
    if (value === null || value === undefined || value === "") {
      return "Not provided";
    }

    return String(value);
  };

  const createField = (label, value) => {
    const row = document.createElement("div");

    const term = document.createElement("span");
    term.textContent = label;

    const detail = document.createElement("strong");
    detail.textContent = displayValue(value);

    row.append(term, detail);
    return row;
  };

  const renderRecord = record => {
    const article = document.createElement("article");
    article.className = "patient-record";

    const header = document.createElement("div");
    header.className = "patient-record-head";

    const titleBlock = document.createElement("div");
    const title = document.createElement("h4");
    title.textContent = record.fullName;
    const subtitle = document.createElement("p");
    subtitle.textContent = `${displayValue(record.patientId)} • ${displayValue(record.admissionId)}`;
    titleBlock.append(title, subtitle);

    const statusPill = document.createElement("span");
    statusPill.className = "pill success";
    statusPill.textContent = displayValue(record.status);

    header.append(titleBlock, statusPill);

    const grid = document.createElement("div");
    grid.className = "patient-record-grid";

    const fieldPairs = [
      ["Admission date", record.admissionDate],
      ["Admission time", record.admissionTime],
      ["Department", record.department],
      ["Doctor", record.doctor],
      ["Age", record.age],
      ["Gender", record.gender],
      ["Date of birth", record.dateOfBirth],
      ["Mobile number", record.mobileNumber],
      ["Emergency contact", record.emergencyContact],
      ["Blood group", record.bloodGroup],
      ["Insurance / profile", record.insuranceProfileType],
      ["Ward", record.ward],
      ["Room", record.room],
      ["Bed number", record.bedNumber],
      ["Address", record.address],
      ["Diagnosis", record.diagnosis],
      ["Allergies", record.allergies],
      ["Created at", record.createdAt]
    ];

    grid.replaceChildren(...fieldPairs.map(([label, value]) => createField(label, value)));
    article.append(header, grid);

    return article;
  };

  const renderRecords = (records, query) => {
    list.replaceChildren(...records.map(renderRecord));
    empty.hidden = records.length > 0;
    list.hidden = records.length === 0;
    count.textContent = `${records.length} record${records.length === 1 ? "" : "s"}`;
    caption.textContent = query
      ? `Showing matches for "${query}".`
      : "Showing every patient admission saved in the backend.";
  };

  const loadRecords = async query => {
    setStatus(query ? "Searching patients..." : "Loading all patients...");

    const params = new URLSearchParams();
    if (query) {
      params.set("q", query);
    } else {
      params.set("all", "true");
    }

    const payload = await requestJson(apiUrl(`/api/admissions?${params.toString()}`));
    renderRecords(payload.items || [], query);
    setStatus(query ? "Search complete." : "All patients loaded.", "success");
  };

  form.addEventListener("submit", event => {
    event.preventDefault();
    const query = input.value.trim();

    void loadRecords(query).catch(error => {
      list.replaceChildren();
      list.hidden = true;
      empty.hidden = false;
      count.textContent = "0 records";
      caption.textContent = "Unable to load records from the backend.";
      setStatus(error.message, "error");
    });
  });

  resetButton.addEventListener("click", () => {
    input.value = "";

    void loadRecords("").catch(error => {
      setStatus(error.message, "error");
    });
  });

  void loadRecords("").catch(error => {
    count.textContent = "0 records";
    caption.textContent = "Unable to load records from the backend.";
    empty.hidden = false;
    setStatus(error.message, "error");
  });
};

document.addEventListener("DOMContentLoaded", () => {
  window.PDCMS.initializePatientSearch?.();
});
