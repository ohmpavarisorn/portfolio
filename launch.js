(() => {
  const hero = document.querySelector('.launch-hero');
  const motion = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  if (!hero) return;

  function reset() {
    hero.style.removeProperty('--launch-x');
    hero.style.removeProperty('--launch-y');
  }

  hero.addEventListener('pointermove', event => {
    if (!motion.matches || event.pointerType !== 'mouse') return;
    const bounds = hero.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    hero.style.setProperty('--launch-x', `${x * 26}px`);
    hero.style.setProperty('--launch-y', `${y * 18}px`);
  }, { passive: true });

  hero.addEventListener('pointerleave', reset);
  motion.addEventListener('change', reset);
})();
