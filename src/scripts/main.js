window.PDCMS = window.PDCMS || {};

document.addEventListener("DOMContentLoaded", () => {
  const {
    productConfig,
    initializePanelNavigation,
    initializeRevealObserver,
    initializeAdmissions,
    initializeWorkload
  } = window.PDCMS;

  if (!productConfig || !initializePanelNavigation || !initializeRevealObserver) {
    return;
  }

  initializePanelNavigation(productConfig);
  initializeRevealObserver(productConfig.revealSelector);
  initializeAdmissions?.();
  initializeWorkload?.();
});
