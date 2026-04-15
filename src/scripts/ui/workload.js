window.PDCMS = window.PDCMS || {};

window.PDCMS.initializeWorkload = () => {
  const apiUrl = window.PDCMS.productConfig?.apiUrl;
  const panel = document.querySelector(".hero-workload");

  if (!panel || typeof apiUrl !== "function") {
    return;
  }

  const toggleButton = panel.querySelector("[data-workload-toggle]");
  const calendarButton = panel.querySelector("[data-workload-calendar]");
  const dateInput = panel.querySelector("[data-workload-date]");
  const dateLabel = panel.querySelector("[data-workload-date-label]");
  const form = panel.querySelector("[data-workload-form]");
  const input = panel.querySelector("[data-workload-input]");
  const list = panel.querySelector("[data-workload-list]");
  const emptyState = panel.querySelector("[data-workload-empty]");
  const status = panel.querySelector("[data-workload-status]");

  if (!toggleButton || !calendarButton || !dateInput || !dateLabel || !form || !input || !list || !emptyState || !status) {
    return;
  }

  const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const formatDateValue = date => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  let activeDate = formatDateValue(new Date());
  let isBusy = false;

  const setBusy = nextState => {
    isBusy = nextState;
    toggleButton.disabled = nextState;
    calendarButton.disabled = nextState;
    input.disabled = nextState;

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = nextState;
    }
  };

  const setStatus = (message, tone = "muted") => {
    status.textContent = message;
    status.dataset.tone = tone;
  };

  const updateDateLabel = dateKey => {
    const parsedDate = new Date(`${dateKey}T00:00:00`);
    dateLabel.textContent = `Viewing ${dateFormatter.format(parsedDate)}`;
  };

  const syncEmptyState = tasks => {
    const hasItems = tasks.length > 0;
    list.hidden = !hasItems;
    emptyState.hidden = hasItems;
    emptyState.textContent = hasItems
      ? ""
      : `No tasks for ${dateLabel.textContent.replace("Viewing ", "")}. Use + Add to create the first checklist item.`;
  };

  const createItem = task => {
    const item = document.createElement("li");
    item.className = "workload-item";

    const label = document.createElement("label");
    label.className = "workload-check";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = Boolean(task.done);
    checkbox.dataset.workloadId = task.id;

    const text = document.createElement("span");
    text.textContent = task.text;

    label.append(checkbox, text);
    item.append(label);

    return item;
  };

  const renderTasks = tasks => {
    list.replaceChildren(...tasks.map(createItem));
    syncEmptyState(tasks);
  };

  const closeForm = () => {
    form.hidden = true;
    input.value = "";
  };

  const openForm = () => {
    form.hidden = false;
    input.focus();
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

  const loadDate = async dateKey => {
    setBusy(true);
    setStatus("Loading tasks...");

    try {
      const payload = await requestJson(apiUrl(`/api/workloads?date=${encodeURIComponent(dateKey)}`));
      activeDate = payload.date;
      dateInput.value = payload.date;
      updateDateLabel(payload.date);
      renderTasks(payload.items || []);
      setStatus("");
    } catch (error) {
      renderTasks([]);
      setStatus(error.message, "error");
    } finally {
      setBusy(false);
    }
  };

  const addTask = async taskText => {
    setBusy(true);
    setStatus("Saving task...");

    try {
      await requestJson(apiUrl("/api/workloads"), {
        method: "POST",
        body: JSON.stringify({
          date: activeDate,
          text: taskText
        })
      });

      closeForm();
      await loadDate(activeDate);
      setStatus("Task saved.", "success");
    } catch (error) {
      setStatus(error.message, "error");
      setBusy(false);
    }
  };

  const updateTaskState = async (taskId, done) => {
    setStatus("Saving update...");

    try {
      await requestJson(apiUrl(`/api/workloads/${encodeURIComponent(taskId)}`), {
        method: "PATCH",
        body: JSON.stringify({ done })
      });

      setStatus("Checklist updated.", "success");
    } catch (error) {
      setStatus(error.message, "error");
      await loadDate(activeDate);
    }
  };

  toggleButton.addEventListener("click", () => {
    if (isBusy) {
      return;
    }

    if (form.hidden) {
      openForm();
      return;
    }

    closeForm();
  });

  calendarButton.addEventListener("click", () => {
    if (isBusy) {
      return;
    }

    if (typeof dateInput.showPicker === "function") {
      dateInput.showPicker();
      return;
    }

    dateInput.focus();
    dateInput.click();
  });

  dateInput.addEventListener("change", () => {
    if (!dateInput.value || isBusy) {
      return;
    }

    closeForm();
    void loadDate(dateInput.value);
  });

  form.addEventListener("submit", event => {
    event.preventDefault();

    const taskText = input.value.trim();
    if (!taskText || isBusy) {
      input.focus();
      return;
    }

    void addTask(taskText);
  });

  input.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeForm();
      toggleButton.focus();
    }
  });

  list.addEventListener("change", event => {
    const target = event.target;

    if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") {
      return;
    }

    const taskId = target.dataset.workloadId;
    if (!taskId) {
      return;
    }

    void updateTaskState(taskId, target.checked);
  });

  updateDateLabel(activeDate);
  void loadDate(activeDate);
};
