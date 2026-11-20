(() => {
  'use strict';

  const header = document.querySelector('.header');
  const root = document.documentElement;
  const progress = header.querySelector('.reading-progress span');
  const nav = header.querySelector('.portfolio-nav');
  const glass = nav.querySelector('.nav-glass');
  const links = [...nav.querySelectorAll('a')];
  const sections = links.map(link => document.getElementById(link.hash.slice(1)));
  let currentSection = null;
  let scheduledFrame = 0;

  function updateCurrentSection() {
    scheduledFrame = 0;
    const scrollRange = root.scrollHeight - window.innerHeight;
    const fraction = scrollRange > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollRange)) : 0;
    progress.style.transform = `scaleX(${fraction})`;
    const boundary = header.getBoundingClientRect().bottom + 28;
    const atPageEnd = window.scrollY + window.innerHeight >= root.scrollHeight - 2;
    let visibleSection = null;

    for (const section of sections) {
      if (section.getBoundingClientRect().top <= boundary) visibleSection = section.id;
    }

    const contact = sections[sections.length - 1];
    if (atPageEnd && contact.getBoundingClientRect().top < window.innerHeight) {
      visibleSection = contact.id;
    }

    if (visibleSection !== currentSection) {
      currentSection = visibleSection;
      for (const link of links) {
        if (link.hash === `#${currentSection}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      }
    }
    const activeLink = nav.querySelector('[aria-current="location"]');
    if (activeLink) {
      const center = activeLink.offsetLeft + activeLink.offsetWidth / 2;
      glass.style.setProperty('--glass-center', `${center}px`);
    }
    nav.classList.toggle('has-active-section', Boolean(activeLink));
  }

  function scheduleUpdate() {
    if (!scheduledFrame) scheduledFrame = requestAnimationFrame(updateCurrentSection);
  }

  function measureHeader() {
    root.style.setProperty('--portfolio-header-height', `${header.offsetHeight}px`);
    scheduleUpdate();
  }

  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', measureHeader, { passive: true });
  window.addEventListener('hashchange', scheduleUpdate);
  document.addEventListener('portfolio:rendered', scheduleUpdate);
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(measureHeader);
    for (const element of [header, document.body, ...links]) observer.observe(element);
  }
  measureHeader();
})();
