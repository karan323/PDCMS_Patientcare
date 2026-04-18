window.PDCMS = window.PDCMS || {};

window.PDCMS.initializeAuthPage = () => {
  const apiUrl = window.PDCMS.productConfig?.apiUrl;
  const auth = window.PDCMS.auth;
  const page = document.querySelector("[data-auth-page]");

  if (!page || typeof apiUrl !== "function" || !auth) {
    return;
  }

  const tabs = [...document.querySelectorAll("[data-auth-tab]")];
  const panels = [...document.querySelectorAll("[data-auth-panel]")];
  const roleSelects = [...document.querySelectorAll("[data-staff-role-select]")];
  const loginForm = document.querySelector("[data-login-form]");
  const registerForm = document.querySelector("[data-register-form]");
  const loginStatus = document.querySelector("[data-login-status]");
  const registerStatus = document.querySelector("[data-register-status]");
  const nextUrl = new URLSearchParams(window.location.search).get("next") || "/";

  if (!loginForm || !registerForm || !loginStatus || !registerStatus || tabs.length === 0 || panels.length === 0) {
    return;
  }

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

  const setStatus = (element, message, tone = "muted") => {
    element.textContent = message;
    element.dataset.tone = tone;
  };

  const setBusy = (form, isBusy) => {
    [...form.querySelectorAll("input, select, button")].forEach(element => {
      element.disabled = isBusy;
    });
  };

  const setActiveTab = tabName => {
    tabs.forEach(tab => {
      const isActive = tab.dataset.authTab === tabName;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });

    panels.forEach(panel => {
      panel.hidden = panel.dataset.authPanel !== tabName;
    });
  };

  const populateRoleSelects = () => {
    roleSelects.forEach(select => {
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Select staff profile";
      placeholder.selected = true;
      select.append(placeholder);

      auth.STAFF_ROLE_OPTIONS.forEach(role => {
        const option = document.createElement("option");
        option.value = role;
        option.textContent = role;
        select.append(option);
      });
    });
  };

  const persistSessionAndRedirect = payload => {
    auth.setStoredSession({
      token: payload.token,
      user: payload.user
    });
    window.location.href = nextUrl;
  };

  const openRequestedTab = () => {
    if (window.location.pathname.includes("create-account")) {
      setActiveTab("register");
      return;
    }

    setActiveTab("login");
  };

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      setActiveTab(tab.dataset.authTab);
    });
  });

  loginForm.addEventListener("submit", event => {
    event.preventDefault();

    const payload = {
      email: loginForm.elements["email"].value,
      password: loginForm.elements["password"].value,
      role: loginForm.elements["role"].value
    };

    setBusy(loginForm, true);
    setStatus(loginStatus, "Signing in...");

    void requestJson(apiUrl("/api/auth/login"), {
      method: "POST",
      body: JSON.stringify(payload)
    })
      .then(session => {
        setStatus(loginStatus, "Login successful.", "success");
        persistSessionAndRedirect(session);
      })
      .catch(error => {
        setStatus(loginStatus, error.message, "error");
      })
      .finally(() => {
        setBusy(loginForm, false);
      });
  });

  registerForm.addEventListener("submit", event => {
    event.preventDefault();

    const payload = {
      fullName: registerForm.elements["fullName"].value,
      email: registerForm.elements["email"].value,
      password: registerForm.elements["password"].value,
      role: registerForm.elements["role"].value
    };

    setBusy(registerForm, true);
    setStatus(registerStatus, "Creating staff account...");

    void requestJson(apiUrl("/api/auth/register"), {
      method: "POST",
      body: JSON.stringify(payload)
    })
      .then(session => {
        setStatus(registerStatus, "Account created.", "success");
        persistSessionAndRedirect(session);
      })
      .catch(error => {
        setStatus(registerStatus, error.message, "error");
      })
      .finally(() => {
        setBusy(registerForm, false);
      });
  });

  populateRoleSelects();
  openRequestedTab();

  const existingSession = auth.readStoredSession();
  if (existingSession?.token) {
    void requestJson(apiUrl("/api/auth/session"), {
      headers: auth.buildAuthHeaders()
    })
      .then(payload => {
        auth.setStoredSession({
          token: existingSession.token,
          user: payload.user
        });
        window.location.href = nextUrl;
      })
      .catch(() => {
        auth.clearStoredSession();
      });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  window.PDCMS.initializeAuthPage?.();
});
