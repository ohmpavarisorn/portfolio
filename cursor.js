(() => {
  'use strict';

  const glow = document.querySelector('.cursor-spotlight');
  const enabled = matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');

  function hide() {
    glow.classList.remove('is-visible', 'is-action');
  }

  document.addEventListener('pointermove', event => {
    if (!enabled.matches || event.pointerType !== 'mouse' || !(event.target instanceof Element)) return;
    if (event.target.closest('input, textarea, [contenteditable]')) {
      hide();
      return;
    }
    glow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
    glow.classList.add('is-visible');
    glow.classList.toggle('is-action', Boolean(event.target.closest('a[href], button:not(:disabled), select, summary')));
  }, { passive: true });

  document.addEventListener('pointerleave', hide);
  window.addEventListener('blur', hide);
  enabled.addEventListener('change', hide);
})();
