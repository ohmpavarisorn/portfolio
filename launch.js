(() => {
  const hero = document.querySelector('.launch-hero');
  if (!hero) return;

  const motion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  let pendingFrame = 0;
  let activeCard = null;
  let pointer = null;

  function resetCard() {
    if (!activeCard) return;
    for (const property of ['--card-x', '--card-y', '--card-depth']) {
      activeCard.style.removeProperty(property);
    }
    activeCard = null;
  }

  function reset() {
    cancelAnimationFrame(pendingFrame);
    pendingFrame = 0;
    pointer = null;
    hero.style.removeProperty('--launch-x');
    hero.style.removeProperty('--launch-y');
    resetCard();
  }

  function paint() {
    pendingFrame = 0;
    const { x, y, card } = pointer;
    const scene = hero.getBoundingClientRect();
    hero.style.setProperty('--launch-x', `${((x - scene.left) / scene.width - .5) * 38}px`);
    hero.style.setProperty('--launch-y', `${((y - scene.top) / scene.height - .5) * 26}px`);

    if (activeCard !== card) resetCard();
    if (!card) return;

    activeCard = card;
    const bounds = card.getBoundingClientRect();
    const horizontal = (x - bounds.left) / bounds.width - .5;
    const vertical = (y - bounds.top) / bounds.height - .5;
    card.style.setProperty('--card-x', `${vertical * -12}deg`);
    card.style.setProperty('--card-y', `${horizontal * 14}deg`);
    card.style.setProperty('--card-depth', '12px');
  }

  hero.addEventListener('pointermove', event => {
    if (!motion.matches || event.pointerType !== 'mouse') return;
    pointer = { x: event.clientX, y: event.clientY, card: event.target.closest('.launch-card') };
    if (!pendingFrame) pendingFrame = requestAnimationFrame(paint);
  }, { passive: true });

  hero.addEventListener('pointerleave', reset);
  motion.addEventListener('change', reset);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      hero.classList.toggle('is-in-view', entry.isIntersecting);
      if (!entry.isIntersecting) reset();
    });
    observer.observe(hero);
  } else {
    hero.classList.add('is-in-view');
  }
})();
