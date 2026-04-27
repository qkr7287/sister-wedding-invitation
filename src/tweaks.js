// Live tweaks panel — toggles theme / scroll mode / 3D scene at runtime.

const STORAGE_KEY = 'wedding-tweaks-v1';

const defaults = {
  theme: 'dark',   // dark | light
  mode: 'intro',   // intro | full
  scene: 'ring'    // ring | dancer
};

const groups = [
  {
    key: 'theme',
    title: 'Mood',
    options: [
      { value: 'dark', label: 'Dark' },
      { value: 'light', label: 'Light' }
    ]
  },
  {
    key: 'mode',
    title: 'Scroll mode',
    options: [
      { value: 'intro', label: 'Intro 3D' },
      { value: 'full', label: 'Full scroll' }
    ]
  },
  {
    key: 'scene',
    title: '3D scene',
    options: [
      { value: 'ring', label: 'Ring' },
      { value: 'dancer', label: 'Dancer' }
    ]
  }
];

export function initTweaks(onChange) {
  const state = loadState();
  applyToBody(state);

  const toggle = document.querySelector('.tweaks__toggle');
  const panel = document.getElementById('tweaks-panel');

  panel.innerHTML = groups
    .map(
      (g) => `
    <div class="tweaks__group" data-key="${g.key}">
      <div class="tweaks__title">${g.title}</div>
      <div class="tweaks__row${g.options.length === 3 ? ' tweaks__row--three' : ''}">
        ${g.options
          .map(
            (o) =>
              `<button class="tweaks__opt" type="button" data-value="${o.value}" aria-pressed="${state[g.key] === o.value}">${o.label}</button>`
          )
          .join('')}
      </div>
    </div>
  `
    )
    .join('');

  toggle.addEventListener('click', () => {
    const open = !panel.hidden;
    panel.hidden = open;
    toggle.setAttribute('aria-expanded', String(!open));
  });

  panel.querySelectorAll('.tweaks__group').forEach((g) => {
    const key = g.dataset.key;
    g.querySelectorAll('.tweaks__opt').forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = btn.dataset.value;
        if (state[key] === value) return;
        state[key] = value;
        g.querySelectorAll('.tweaks__opt').forEach((b) =>
          b.setAttribute('aria-pressed', String(b.dataset.value === value))
        );
        applyToBody(state);
        saveState(state);
        onChange(key, value, { ...state });
      });
    });
  });

  return { state: () => ({ ...state }) };
}

function applyToBody(state) {
  const body = document.body;
  body.classList.remove('theme-dark', 'theme-light');
  body.classList.add(`theme-${state.theme}`);
  body.classList.remove('mode-intro', 'mode-full');
  body.classList.add(`mode-${state.mode}`);
  body.classList.remove('scene-ring', 'scene-dancer');
  body.classList.add(`scene-${state.scene}`);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return { ...defaults };
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
}
