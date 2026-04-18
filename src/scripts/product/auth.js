window.PDCMS = window.PDCMS || {};

const STAFF_ROLE_OPTIONS = [
  "Inpatient department admin / reception team",
  "Nurses",
  "Doctors",
  "Consultants",
  "Lab / report staff"
];

const AUTH_STORAGE_KEY = "pdcms_staff_session";

const readStoredSession = () => {
  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
};

const setStoredSession = session => {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

const clearStoredSession = () => {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

const getAuthToken = () => readStoredSession()?.token || "";

const buildAuthHeaders = headers => {
  const token = getAuthToken();

  return token
    ? {
        ...headers,
        Authorization: `Bearer ${token}`
      }
    : { ...headers };
};

const redirectToLogin = () => {
  const nextPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.href = `/login?next=${encodeURIComponent(nextPath)}`;
};

const syncStaffSessionUI = session => {
  const staffNameElements = [...document.querySelectorAll("[data-staff-name]")];
  const staffRoleElements = [...document.querySelectorAll("[data-staff-role]")];
  const authOnlyElements = [...document.querySelectorAll("[data-auth-only]")];

  staffNameElements.forEach(element => {
    element.textContent = session?.user?.fullName || "Staff member";
  });

  staffRoleElements.forEach(element => {
    element.textContent = session?.user?.role || "No staff profile";
  });

  authOnlyElements.forEach(element => {
    element.hidden = !session;
  });
};

const logout = async ({ notifyServer = true } = {}) => {
  const apiUrl = window.PDCMS.productConfig?.apiUrl;
  const token = getAuthToken();

  if (notifyServer && typeof apiUrl === "function" && token) {
    try {
      await fetch(apiUrl("/api/auth/logout"), {
        method: "POST",
        headers: buildAuthHeaders({
          "Content-Type": "application/json"
        })
      });
    } catch {
      // Ignore logout transport errors and clear local state anyway.
    }
  }

  clearStoredSession();
  syncStaffSessionUI(null);
  redirectToLogin();
};

const bindLogoutButtons = () => {
  const buttons = [...document.querySelectorAll("[data-auth-logout]")];
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      void logout();
    });
  });
};

const requireStaffSession = async () => {
  const apiUrl = window.PDCMS.productConfig?.apiUrl;
  const session = readStoredSession();

  if (!session?.token || typeof apiUrl !== "function") {
    redirectToLogin();
    return false;
  }

  try {
    const response = await fetch(apiUrl("/api/auth/session"), {
      headers: buildAuthHeaders()
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload?.user) {
      throw new Error(payload.error || "Session expired.");
    }

    const nextSession = {
      token: session.token,
      user: payload.user
    };

    setStoredSession(nextSession);
    syncStaffSessionUI(nextSession);
    bindLogoutButtons();
    return true;
  } catch {
    clearStoredSession();
    redirectToLogin();
    return false;
  }
};

window.PDCMS.auth = {
  STAFF_ROLE_OPTIONS,
  AUTH_STORAGE_KEY,
  bindLogoutButtons,
  buildAuthHeaders,
  clearStoredSession,
  getAuthToken,
  logout,
  readStoredSession,
  redirectToLogin,
  requireStaffSession,
  setStoredSession,
  syncStaffSessionUI
};
