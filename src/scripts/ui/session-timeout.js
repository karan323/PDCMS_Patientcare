window.PDCMS = window.PDCMS || {};

window.PDCMS.initializeSessionTimeout = () => {
  const WARN_BEFORE_MS = 5 * 60 * 1000;
  const COUNTDOWN_SECONDS = 60;

  const readTokenExpiry = () => {
    const token = window.PDCMS.auth?.getAuthToken?.();
    if (!token) {
      return null;
    }

    try {
      const [encodedPayload] = token.split(".");
      const padded = encodedPayload.padEnd(encodedPayload.length + (4 - (encodedPayload.length % 4)) % 4, "=");
      const decoded = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
      const payload = JSON.parse(decoded);
      return typeof payload?.exp === "number" ? payload.exp : null;
    } catch {
      return null;
    }
  };

  const buildWarningDialog = () => {
    const overlay = document.createElement("div");
    overlay.className = "session-timeout-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-labelledby", "session-timeout-title");

    overlay.innerHTML = `
      <div class="session-timeout-dialog">
        <div class="session-timeout-icon" aria-hidden="true">&#9201;</div>
        <h2 id="session-timeout-title">Your session is about to expire</h2>
        <p class="session-timeout-copy">
          Your staff session will expire in <strong class="session-timeout-countdown"></strong> seconds.
          Save any unsaved work now or stay to remain logged in.
        </p>
        <div class="session-timeout-actions">
          <button class="primary-btn" type="button" data-session-stay>Stay logged in</button>
          <button class="secondary-btn" type="button" data-session-logout>Log out now</button>
        </div>
      </div>
    `;

    return overlay;
  };

  let warningTimer = null;
  let expiryTimer = null;
  let countdownInterval = null;
  let overlay = null;

  const dismissWarning = () => {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }

    clearInterval(countdownInterval);
    countdownInterval = null;
  };

  const showWarning = expiryMs => {
    if (overlay) {
      return;
    }

    overlay = buildWarningDialog();
    document.body.appendChild(overlay);

    const countdownEl = overlay.querySelector(".session-timeout-countdown");
    const stayButton = overlay.querySelector("[data-session-stay]");
    const logoutButton = overlay.querySelector("[data-session-logout]");

    let remaining = COUNTDOWN_SECONDS;

    const tick = () => {
      remaining -= 1;
      if (countdownEl) {
        countdownEl.textContent = String(remaining);
      }

      if (remaining <= 0) {
        clearInterval(countdownInterval);
        countdownInterval = null;
        dismissWarning();
        void window.PDCMS.auth?.logout?.();
      }
    };

    if (countdownEl) {
      countdownEl.textContent = String(remaining);
    }

    countdownInterval = setInterval(tick, 1000);

    stayButton?.addEventListener("click", () => {
      dismissWarning();
      scheduleWarning();
    });

    logoutButton?.addEventListener("click", () => {
      dismissWarning();
      void window.PDCMS.auth?.logout?.();
    });
  };

  const scheduleWarning = () => {
    clearTimeout(warningTimer);
    clearTimeout(expiryTimer);

    const exp = readTokenExpiry();
    if (!exp) {
      return;
    }

    const now = Date.now();
    const msUntilExpiry = exp - now;

    if (msUntilExpiry <= 0) {
      void window.PDCMS.auth?.logout?.();
      return;
    }

    const msUntilWarn = Math.max(0, msUntilExpiry - WARN_BEFORE_MS);

    warningTimer = setTimeout(() => {
      showWarning(exp);
    }, msUntilWarn);

    expiryTimer = setTimeout(() => {
      dismissWarning();
      void window.PDCMS.auth?.logout?.();
    }, msUntilExpiry);
  };

  scheduleWarning();
};

document.addEventListener("DOMContentLoaded", () => {
  window.PDCMS.initializeSessionTimeout?.();
});
