(() => {
  'use strict';

  const track = document.querySelector('#certificate-track');
  const slides = [...track.children];
  const imageDialog = document.querySelector('#image-dialog');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const speed = 28;
  let copies = [];
  let frame = 0;
  let position = 0;
  let cycle = 0;
  let lastTime = null;
  let visible = false;
  let hovered = false;
  let touching = false;
  let touchTimer;

  function measure() {
    cycle = copies.length ? copies[0].offsetLeft - slides[0].offsetLeft : 0;
    position = track.scrollLeft;
  }

  function animate(time) {
    if (lastTime !== null && cycle > 0) {
      position = (position + Math.min(time - lastTime, 50) * speed / 1000) % cycle;
      track.scrollLeft = position;
    }
    lastTime = time;
    frame = requestAnimationFrame(animate);
  }

  function syncMotion() {
    const shouldMove = cycle > 0 && visible && !document.hidden && !hovered && !touching
      && !track.contains(document.activeElement) && !imageDialog.open;
    if (shouldMove && !frame) {
      position = track.scrollLeft;
      lastTime = null;
      frame = requestAnimationFrame(animate);
    } else if (!shouldMove && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  function syncPreference() {
    if (!reducedMotion.matches && !copies.length) {
      copies = slides.map(slide => {
        const copy = slide.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        copy.querySelector('[id]').removeAttribute('id');
        const button = copy.querySelector('button');
        button.tabIndex = -1;
        button.removeAttribute('aria-labelledby');
        button.addEventListener('mousedown', event => event.preventDefault());
        return copy;
      });
      track.append(...copies);
    } else if (reducedMotion.matches) {
      if (cycle && track.scrollLeft >= cycle) track.scrollLeft %= cycle;
      for (const copy of copies) copy.remove();
      copies = [];
    }
    measure();
    syncMotion();
  }

  track.addEventListener('wheel', event => {
    if (!event.cancelable || event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
    const end = track.scrollWidth - track.clientWidth;
    if (end <= 0 || (event.deltaY < 0 && track.scrollLeft < 1)
      || (event.deltaY > 0 && track.scrollLeft >= end - 1)) return;

    const scale = event.deltaMode === 1 ? 18 : event.deltaMode === 2 ? track.clientWidth : 1;
    event.preventDefault();
    track.scrollLeft += event.deltaY * scale;
  }, { passive: false });

  track.addEventListener('keydown', event => {
    if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const step = slides[1].offsetLeft - slides[0].offsetLeft;
    track.scrollLeft += event.key === 'ArrowRight' ? step : -step;
  });

  track.addEventListener('pointerenter', event => {
    hovered = event.pointerType === 'mouse';
    syncMotion();
  });
  track.addEventListener('pointerleave', () => {
    hovered = false;
    syncMotion();
  });
  track.addEventListener('touchstart', () => {
    clearTimeout(touchTimer);
    touching = true;
    syncMotion();
  }, { passive: true });
  for (const event of ['touchend', 'touchcancel']) {
    track.addEventListener(event, () => {
      touchTimer = setTimeout(() => {
        touching = false;
        syncMotion();
      }, 900);
    }, { passive: true });
  }
  track.addEventListener('focusin', syncMotion);
  track.addEventListener('focusout', () => queueMicrotask(syncMotion));
  document.addEventListener('visibilitychange', syncMotion);
  new MutationObserver(syncMotion).observe(imageDialog, { attributeFilter: ['open'] });
  new ResizeObserver(() => { measure(); syncMotion(); }).observe(track);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    syncMotion();
  }).observe(track);
  reducedMotion.addEventListener('change', syncPreference);
  syncPreference();
})();
