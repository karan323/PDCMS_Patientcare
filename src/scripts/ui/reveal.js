window.PDCMS = window.PDCMS || {};

window.PDCMS.initializeRevealObserver = selector => {
  const revealItems = document.querySelectorAll(selector);

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach(item => item.classList.add("reveal", "is-visible"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal", "is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach(item => {
    item.classList.add("reveal");
    revealObserver.observe(item);
  });
};
