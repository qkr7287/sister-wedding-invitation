import Lenis from 'lenis';

let lenisInstance = null;

export function initScroll(onProgress) {
  lenisInstance = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    smoothTouch: false,
    lerp: 0.1
  });

  const raf = (time) => {
    lenisInstance.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  const reportProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    document.body.classList.toggle('scrolled', window.scrollY > window.innerHeight * 0.4);
    onProgress(p);
  };
  lenisInstance.on('scroll', reportProgress);
  reportProgress();

  return lenisInstance;
}

export function scrollToSection(target) {
  if (!lenisInstance) return;
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (el) lenisInstance.scrollTo(el, { duration: 1.4 });
}

// Tracks which section is most visible and how far through it the user has scrolled.
// onChange({ index, name, progress }) fires whenever the active section or its progress changes.
export function initSectionTracker(onChange) {
  const sections = Array.from(document.querySelectorAll('[data-section]'));
  if (!sections.length) return { sections: [] };

  let activeIndex = 0;

  const compute = () => {
    const vh = window.innerHeight;
    let bestIdx = 0;
    let bestVisible = -Infinity;
    sections.forEach((sec, i) => {
      const rect = sec.getBoundingClientRect();
      // Score: how centered the section is in the viewport
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(center - vh / 2);
      const score = -dist;
      if (score > bestVisible) {
        bestVisible = score;
        bestIdx = i;
      }
    });

    const active = sections[bestIdx];
    const rect = active.getBoundingClientRect();
    // Progress within the active section: 0 when it just enters, 1 when it leaves
    const totalRange = vh + rect.height;
    const into = vh - rect.top;
    const progress = Math.max(0, Math.min(1, into / totalRange));

    if (bestIdx !== activeIndex) {
      activeIndex = bestIdx;
      sections.forEach((s, i) => s.classList.toggle('is-active', i === bestIdx));
    }

    onChange({
      index: bestIdx,
      name: active.dataset.section,
      progress
    });
  };

  window.addEventListener('scroll', compute, { passive: true });
  window.addEventListener('resize', compute);
  compute();

  return { sections };
}

export function initReveal() {
  const els = document.querySelectorAll('.reveal, .reveal-text');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          if (el.classList.contains('reveal-text')) {
            const chars = el.querySelectorAll('.char');
            chars.forEach((c, i) => {
              c.style.transitionDelay = `${i * 28}ms`;
            });
          }
          el.classList.add('is-in');
          io.unobserve(el);
        }
      });
    },
    { rootMargin: '-12% 0px', threshold: 0.05 }
  );
  els.forEach((el) => io.observe(el));
}
