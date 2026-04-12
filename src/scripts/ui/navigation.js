window.PDCMS = window.PDCMS || {};

const setPanelVisibility = (panel, isVisible) => {
  panel.hidden = !isVisible;
  panel.classList.toggle("is-open", isVisible);
};

const updateActiveLink = (navLinks, activeId) => {
  navLinks.forEach(link => {
    const targetId = link.getAttribute("href")?.slice(1);
    const isActive = targetId === activeId;

    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const scrollToSection = (target, behavior) => {
  target.scrollIntoView({ behavior, block: "start" });
};

window.PDCMS.initializePanelNavigation = ({
  dashboardId,
  collapsibleSelector,
  sharedSelector,
  navLinkSelector
}) => {
  const collapsibleSections = [...document.querySelectorAll(collapsibleSelector)];
  const sharedPanels = [...document.querySelectorAll(sharedSelector)];
  const navLinks = [...document.querySelectorAll(navLinkSelector)];
  const dashboardSection = document.getElementById(dashboardId);

  if (!dashboardSection) {
    return;
  }

  const openPanel = (targetId, shouldScroll = true, scrollBehavior = "smooth") => {
    if (!targetId || targetId === dashboardSection.id) {
      collapsibleSections.forEach(section => setPanelVisibility(section, false));
      sharedPanels.forEach(panel => setPanelVisibility(panel, false));
      updateActiveLink(navLinks, dashboardSection.id);

      if (shouldScroll) {
        scrollToSection(dashboardSection, scrollBehavior);
      }

      return;
    }

    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    const sectionToOpen = target.closest(collapsibleSelector);
    if (!sectionToOpen) {
      return;
    }

    collapsibleSections.forEach(section => {
      setPanelVisibility(section, section === sectionToOpen);
    });
    sharedPanels.forEach(panel => setPanelVisibility(panel, true));
    updateActiveLink(navLinks, targetId);

    if (shouldScroll) {
      requestAnimationFrame(() => {
        scrollToSection(target, scrollBehavior);
      });
    }
  };

  collapsibleSections.forEach(section => setPanelVisibility(section, false));
  sharedPanels.forEach(panel => setPanelVisibility(panel, false));
  updateActiveLink(navLinks, dashboardSection.id);

  navLinks.forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();

      const targetId = link.getAttribute("href")?.slice(1);
      if (!targetId) {
        return;
      }

      history.replaceState(null, "", `#${targetId}`);
      openPanel(targetId);
    });
  });

  const initialHash = window.location.hash.slice(1);
  if (initialHash && initialHash !== dashboardSection.id) {
    openPanel(initialHash, true, "auto");
  }
};
