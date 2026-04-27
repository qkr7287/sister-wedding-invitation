import { scrollToSection } from './scroll.js';

// Korean labels per section name (matches data-section in markup)
const LABELS = {
  hero: '표지',
  greeting: '인사',
  couple: '신랑신부',
  gallery: '사진',
  calendar: '일시',
  location: '위치',
  account: '마음',
  share: '공유'
};

export function initPagination() {
  const sections = Array.from(document.querySelectorAll('[data-section]'));
  if (!sections.length) return () => {};

  const nav = document.createElement('nav');
  nav.className = 'pagination';
  nav.setAttribute('aria-label', 'Sections');

  const dots = sections.map((sec, i) => {
    const name = sec.dataset.section;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pagination__dot';
    btn.dataset.target = name;
    btn.setAttribute('aria-label', LABELS[name] || name);
    btn.innerHTML = `
      <span class="pagination__pill" aria-hidden="true"></span>
      <span class="pagination__label">${LABELS[name] || name}</span>
    `;
    btn.addEventListener('click', () => scrollToSection(sec));
    nav.appendChild(btn);
    return { btn, name, index: i };
  });

  document.body.appendChild(nav);

  // Returns a setter that updates active state
  return (activeIndex) => {
    dots.forEach((d, i) => {
      d.btn.classList.toggle('is-active', i === activeIndex);
    });
  };
}
