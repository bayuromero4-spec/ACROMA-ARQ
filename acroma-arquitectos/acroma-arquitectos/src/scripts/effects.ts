/**
 * Efectos de la web pública (único JavaScript de animación).
 *  - Revelado al hacer scroll ([data-reveal], con escalonado en [data-reveal-group])
 *  - Contadores animados ([data-count])
 *  - Parallax suave del hero ([data-parallax])
 *  - Estado "scrolled" del header
 *  - Destello de vidrio que sigue al puntero ([data-glass])
 *
 * Todo se desactiva con prefers-reduced-motion. Solo se animan transform/opacity.
 */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- Revelado al hacer scroll ---------- */
function setupReveal() {
  // Escalonado: los hijos directos de un grupo entran uno tras otro
  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
    const step = Number(group.dataset.revealGroup) || 90;
    Array.from(group.children).forEach((child, i) => {
      const el = child as HTMLElement;
      if (!el.hasAttribute('data-reveal')) el.setAttribute('data-reveal', '');
      el.style.setProperty('--d', `${Math.min(i, 8) * step}ms`);
    });
  });

  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        el.classList.add('is-in');
        io.unobserve(el);
        // Al terminar la entrada se limpia el estado, para que los efectos hover no hereden el retraso
        const delay = parseInt(el.style.getPropertyValue('--d')) || 0;
        setTimeout(() => {
          el.removeAttribute('data-reveal');
          el.classList.remove('is-in');
          el.style.removeProperty('--d');
        }, delay + 1150);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
  );
  items.forEach((el) => io.observe(el));
}

/* ---------- Contadores ---------- */
function setupCounters() {
  const els = document.querySelectorAll<HTMLElement>('[data-count]');
  if (reduceMotion) return;
  els.forEach((el) => {
    const match = (el.textContent ?? '').trim().match(/^(\D*)(\d+)(.*)$/);
    if (!match) return;
    const [, prefix, num, suffix] = match;
    const target = Number(num);
    el.textContent = `${prefix}0${suffix}`;
    const run = () => {
      const start = performance.now();
      const duration = 1500;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          setTimeout(run, 500);
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
  });
}

/* ---------- Scroll: header + parallax ---------- */
function setupScroll() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const parallax = document.querySelector<HTMLElement>('[data-parallax]');
  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY;
    header?.toggleAttribute('data-scrolled', y > 24);
    if (parallax && !reduceMotion && y < window.innerHeight * 1.3) {
      // La imagen se mueve más despacio que la página
      parallax.style.transform = `translate3d(0, ${(y * 0.22).toFixed(1)}px, 0) scale(${(1.08 - y * 0.00004).toFixed(4)})`;
    }
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  update();
}

/* ---------- Destello del vidrio ---------- */
function setupGlassShine() {
  if (!finePointer || reduceMotion) return;
  document.querySelectorAll<HTMLElement>('[data-glass]').forEach((card) => {
    // El destello es un hijo propio: así la variable no se hereda a todo el contenido
    const shine = document.createElement('span');
    shine.className = 'shine';
    shine.setAttribute('aria-hidden', 'true');
    card.prepend(shine);

    let raf = 0;
    card.addEventListener('pointermove', (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        shine.style.setProperty('--mx', `${e.clientX - r.left}px`);
        shine.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
  });
}

setupReveal();
setupCounters();
setupScroll();
setupGlassShine();
