window.PDCMS = window.PDCMS || {};

window.PDCMS.initializePatientSearch = () => {
  const apiUrl = window.PDCMS.productConfig?.apiUrl;
  const form = document.querySelector("[data-patient-search-form]");
  const input = document.querySelector("[data-patient-search-input]");
  const resetButton = document.querySelector("[data-patient-search-reset]");
  const filterToggleButton = document.querySelector("[data-patient-search-filter-toggle]");
  const filtersPanel = document.querySelector("[data-patient-search-filters]");
  const patientIdFilterInput = document.querySelector("[data-patient-filter-patient-id]");
  const fullNameFilterInput = document.querySelector("[data-patient-filter-full-name]");
  const doctorFilterInput = document.querySelector("[data-patient-filter-doctor]");
  const dateModeSelect = document.querySelector("[data-patient-filter-date-mode]");
  const singleDateField = document.querySelector("[data-patient-filter-single-field]");
  const rangeStartField = document.querySelector("[data-patient-filter-range-start-field]");
  const rangeEndField = document.querySelector("[data-patient-filter-range-end-field]");
  const entryDateInput = document.querySelector("[data-patient-filter-entry-date]");
  const entryDateFromInput = document.querySelector("[data-patient-filter-entry-date-from]");
  const entryDateToInput = document.querySelector("[data-patient-filter-entry-date-to]");
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
    !filterToggleButton ||
    !filtersPanel ||
    !patientIdFilterInput ||
    !fullNameFilterInput ||
    !doctorFilterInput ||
    !dateModeSelect ||
    !singleDateField ||
    !rangeStartField ||
    !rangeEndField ||
    !entryDateInput ||
    !entryDateFromInput ||
    !entryDateToInput ||
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
      ["Patient ID", record.patientId],
      ["Date of entry", record.admissionDate],
      ["Doctor", record.doctor],
      ["Department", record.department]
    ];

    grid.replaceChildren(...fieldPairs.map(([label, value]) => createField(label, value)));
    article.append(header, grid);

    return article;
  };

  const renderRecords = (records, description) => {
    list.replaceChildren(...records.map(renderRecord));
    empty.hidden = records.length > 0;
    list.hidden = records.length === 0;
    count.textContent = `${records.length} record${records.length === 1 ? "" : "s"}`;
    caption.textContent = description;
  };

  const setFiltersOpen = isOpen => {
    filtersPanel.hidden = !isOpen;
    filterToggleButton.textContent = isOpen ? "Hide filters" : "Advanced filters";
    filterToggleButton.setAttribute("aria-expanded", String(isOpen));
  };

  const syncDateFields = () => {
    const mode = dateModeSelect.value;
    singleDateField.hidden = mode !== "single";
    rangeStartField.hidden = mode !== "range";
    rangeEndField.hidden = mode !== "range";

    if (mode !== "single") {
      entryDateInput.value = "";
    }

    if (mode !== "range") {
      entryDateFromInput.value = "";
      entryDateToInput.value = "";
    }
  };

  const hasAdvancedFilterValue = () =>
    Boolean(
      patientIdFilterInput.value.trim() ||
        fullNameFilterInput.value.trim() ||
        doctorFilterInput.value.trim() ||
        dateModeSelect.value ||
        entryDateInput.value ||
        entryDateFromInput.value ||
        entryDateToInput.value
    );

  const getDefaultSearchRequest = () => ({
    queryString: "all=true",
    description: "Showing every patient admission saved in the backend.",
    isSearching: false
  });

  const getSearchRequest = () => {
    const searchQuery = input.value.trim();
    const patientId = patientIdFilterInput.value.trim();
    const fullName = fullNameFilterInput.value.trim();
    const doctor = doctorFilterInput.value.trim();
    const dateMode = dateModeSelect.value;
    const entryDate = entryDateInput.value;
    const entryDateFrom = entryDateFromInput.value;
    const entryDateTo = entryDateToInput.value;
    const params = new URLSearchParams();
    const descriptions = [];

    if (searchQuery) {
      params.set("q", searchQuery);
      descriptions.push(`patient ID or name matching "${searchQuery}"`);
    }

    if (patientId) {
      params.set("patientId", patientId);
      descriptions.push(`patient ID matching "${patientId}"`);
    }

    if (fullName) {
      params.set("fullName", fullName);
      descriptions.push(`patient name matching "${fullName}"`);
    }

    if (doctor) {
      params.set("doctor", doctor);
      descriptions.push(`doctor matching "${doctor}"`);
    }

    if (dateMode === "single") {
      if (!entryDate) {
        throw new Error("Select a date of entry to use the single date filter.");
      }

      params.set("entryDate", entryDate);
      descriptions.push(`date of entry on ${entryDate}`);
    }

    if (dateMode === "range") {
      if (!entryDateFrom || !entryDateTo) {
        throw new Error("Select both date values to use the date range filter.");
      }

      if (entryDateFrom > entryDateTo) {
        throw new Error("Date of entry range start must be on or before the end date.");
      }

      params.set("entryDateFrom", entryDateFrom);
      params.set("entryDateTo", entryDateTo);
      descriptions.push(`date of entry between ${entryDateFrom} and ${entryDateTo}`);
    }

    if (!params.toString()) {
      return getDefaultSearchRequest();
    }

    return {
      queryString: params.toString(),
      description: `Showing results for ${descriptions.join(", ")}.`,
      isSearching: true
    };
  };

  const handleLoadError = error => {
    list.replaceChildren();
    list.hidden = true;
    empty.hidden = false;
    count.textContent = "0 records";
    caption.textContent = "Unable to load records from the backend.";
    setStatus(error.message, "error");
  };

  const loadRecords = async searchRequest => {
    setStatus(searchRequest.isSearching ? "Searching patients..." : "Loading all patients...");

    const payload = await requestJson(apiUrl(`/api/admissions?${searchRequest.queryString}`));
    renderRecords(payload.items || [], searchRequest.description);
    setStatus(searchRequest.isSearching ? "Search complete." : "All patients loaded.", "success");
  };

  form.addEventListener("submit", event => {
    event.preventDefault();

    let searchRequest;
    try {
      searchRequest = getSearchRequest();
    } catch (error) {
      setStatus(error.message, "error");
      if (hasAdvancedFilterValue()) {
        setFiltersOpen(true);
      }
      return;
    }

    void loadRecords(searchRequest).catch(handleLoadError);
  });

  filterToggleButton.addEventListener("click", () => {
    setFiltersOpen(filtersPanel.hidden);
  });

  dateModeSelect.addEventListener("change", () => {
    syncDateFields();
    if (dateModeSelect.value) {
      setFiltersOpen(true);
    }
  });

  resetButton.addEventListener("click", () => {
    form.reset();
    syncDateFields();
    setFiltersOpen(false);

    void loadRecords(getDefaultSearchRequest()).catch(handleLoadError);
  });

  syncDateFields();
  setFiltersOpen(false);

  void loadRecords(getDefaultSearchRequest()).catch(handleLoadError);
};

document.addEventListener("DOMContentLoaded", () => {
  window.PDCMS.initializePatientSearch?.();
});
