window.PDCMS = window.PDCMS || {};

const normalizeBaseUrl = value => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().replace(/\/+$/, "");
};

const apiBaseUrl = normalizeBaseUrl(
  window.PDCMS_RUNTIME_CONFIG?.apiBaseUrl ||
    document.querySelector('meta[name="pdcms-api-base-url"]')?.content ||
    window.location.origin
);

window.PDCMS.productConfig = {
  apiBaseUrl,
  apiUrl: path => `${apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`,
  dashboardId: "dashboard",
  collapsibleSelector: "[data-collapsible]",
  sharedSelector: "[data-collapsible-shared]",
  navLinkSelector: "[data-panel-link]",
  revealSelector: ".surface, .hero, .sidebar-card, .slot-card, .metric-card"
};
