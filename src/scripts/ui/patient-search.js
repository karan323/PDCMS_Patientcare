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
  const editPanel = document.querySelector("[data-patient-edit-panel]");
  const editForm = document.querySelector("[data-patient-edit-form]");
  const editTitle = document.querySelector("[data-patient-edit-title]");
  const editStatus = document.querySelector("[data-patient-edit-status]");
  const editCancelButton = document.querySelector("[data-patient-edit-cancel]");
  const editSubmitButton = document.querySelector("[data-patient-edit-submit]");
  const editFieldElements = [...document.querySelectorAll("[data-patient-edit-field]")];
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
    !editPanel ||
    !editForm ||
    !editTitle ||
    !editStatus ||
    !editCancelButton ||
    !editSubmitButton ||
    editFieldElements.length === 0 ||
    !status ||
    !list ||
    !empty ||
    !count ||
    !caption
  ) {
    return;
  }

  const editFields = Object.fromEntries(
    editFieldElements.map(field => [field.dataset.patientEditField, field])
  );

  let currentSearchRequest = null;
  let currentEditingRecordId = null;

  const setStatus = (message, tone = "muted") => {
    status.textContent = message;
    status.dataset.tone = tone;
  };

  const setEditStatus = (message, tone = "muted") => {
    editStatus.textContent = message;
    editStatus.dataset.tone = tone;
  };

  const setEditBusy = isBusy => {
    editSubmitButton.disabled = isBusy;
    editCancelButton.disabled = isBusy;
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

    const actions = document.createElement("div");
    actions.className = "patient-record-head-actions";

    const statusPill = document.createElement("span");
    statusPill.className = "pill success";
    statusPill.textContent = displayValue(record.status);

    const editButton = document.createElement("button");
    editButton.className = "secondary-btn patient-record-edit-btn";
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.dataset.patientEditRecord = record.id;

    actions.append(statusPill, editButton);
    header.append(titleBlock, actions);

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

  const setEditOpen = isOpen => {
    editPanel.hidden = !isOpen;

    if (isOpen) {
      editPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
    const isBroadSearch = searchQuery.startsWith("*");
    const normalizedBroadSearchQuery = searchQuery.slice(1).trim();
    const patientId = patientIdFilterInput.value.trim();
    const fullName = fullNameFilterInput.value.trim();
    const doctor = doctorFilterInput.value.trim();
    const dateMode = dateModeSelect.value;
    const entryDate = entryDateInput.value;
    const entryDateFrom = entryDateFromInput.value;
    const entryDateTo = entryDateToInput.value;
    const params = new URLSearchParams();
    const descriptions = [];

    if (isBroadSearch && !normalizedBroadSearchQuery) {
      throw new Error("Enter a search term after * to run a broad patient search.");
    }

    if (searchQuery) {
      params.set("q", searchQuery);
      descriptions.push(
        isBroadSearch && normalizedBroadSearchQuery
          ? `any patient field matching "${normalizedBroadSearchQuery}"`
          : `patient ID or name matching "${searchQuery}"`
      );
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
    currentSearchRequest = searchRequest;
    setStatus(searchRequest.isSearching ? "Searching patients..." : "Loading all patients...");

    const payload = await requestJson(apiUrl(`/api/admissions?${searchRequest.queryString}`));
    renderRecords(payload.items || [], searchRequest.description);
    setStatus(searchRequest.isSearching ? "Search complete." : "All patients loaded.", "success");
  };

  const populateEditForm = record => {
    Object.entries(editFields).forEach(([key, field]) => {
      field.value = record[key] ?? "";
    });

    editTitle.textContent = `Edit ${displayValue(record.fullName)}`;
    setEditStatus("Update the patient admission details and save changes.");
  };

  const closeEditPanel = () => {
    currentEditingRecordId = null;
    editForm.reset();
    setEditStatus("");
    setEditBusy(false);
    setEditOpen(false);
  };

  const readEditPayload = () =>
    Object.fromEntries(
      Object.entries(editFields).map(([key, field]) => [key, field.value])
    );

  const openEditPanel = async recordId => {
    setEditOpen(true);
    setEditStatus("Loading patient record...");
    setEditBusy(true);

    try {
      const record = await requestJson(apiUrl(`/api/admissions/${recordId}`));
      currentEditingRecordId = record.id;
      populateEditForm(record);
    } catch (error) {
      setEditStatus(error.message, "error");
    } finally {
      setEditBusy(false);
    }
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

    closeEditPanel();
    void loadRecords(searchRequest).catch(handleLoadError);
  });

  editForm.addEventListener("submit", event => {
    event.preventDefault();

    if (!currentEditingRecordId) {
      setEditStatus("Open a patient record before saving changes.", "error");
      return;
    }

    setEditBusy(true);
    setEditStatus("Saving changes...");

    void requestJson(apiUrl(`/api/admissions/${currentEditingRecordId}`), {
      method: "PATCH",
      body: JSON.stringify(readEditPayload())
    })
      .then(async updated => {
        await loadRecords(currentSearchRequest || getDefaultSearchRequest());
        closeEditPanel();
        setStatus(`Updated ${updated.fullName}.`, "success");
      })
      .catch(error => {
        setEditStatus(error.message, "error");
      })
      .finally(() => {
        setEditBusy(false);
      });
  });

  list.addEventListener("click", event => {
    const button = event.target.closest("[data-patient-edit-record]");
    if (!button) {
      return;
    }

    void openEditPanel(button.dataset.patientEditRecord);
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
    closeEditPanel();

    void loadRecords(getDefaultSearchRequest()).catch(handleLoadError);
  });

  editCancelButton.addEventListener("click", () => {
    closeEditPanel();
  });

  syncDateFields();
  setFiltersOpen(false);
  setEditOpen(false);

  void loadRecords(getDefaultSearchRequest()).catch(handleLoadError);
};

document.addEventListener("DOMContentLoaded", () => {
  window.PDCMS.initializePatientSearch?.();
});
