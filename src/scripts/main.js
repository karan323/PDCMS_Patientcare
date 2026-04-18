window.PDCMS = window.PDCMS || {};

document.addEventListener("DOMContentLoaded", () => {
  void (async () => {
    const {
      auth,
      productConfig,
      initializePanelNavigation,
      initializeRevealObserver,
      initializeAdmissions,
      initializeWorkload
    } = window.PDCMS;

    if (!productConfig || !initializePanelNavigation || !initializeRevealObserver) {
      return;
    }

    if (auth?.requireStaffSession) {
      const isAllowed = await auth.requireStaffSession();
      if (!isAllowed) {
        return;
      }
    }

    initializePanelNavigation(productConfig);
    initializeRevealObserver(productConfig.revealSelector);
    initializeAdmissions?.();
    initializeWorkload?.();
  })();
});
