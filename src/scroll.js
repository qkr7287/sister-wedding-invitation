import Lenis from 'lenis';

export function initScroll(onProgress) {
  const lenis = new Lenis({
    duration: 1.15,
    smoothWheel: true,
    smoothTouch: false,
    lerp: 0.1
  });

  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  const reportProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    document.body.classList.toggle('scrolled', window.scrollY > window.innerHeight * 0.4);
    onProgress(p);
  };
  lenis.on('scroll', reportProgress);
  reportProgress();

  return lenis;
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
