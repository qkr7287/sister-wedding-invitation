import './style.css';
import { buildSections } from './sections.js';
import { ThreeScene } from './threeScene.js';
import { initScroll, initReveal } from './scroll.js';
import { initTweaks } from './tweaks.js';
import { initAudio } from './audio.js';

const main = async () => {
  buildSections();
  initReveal();
  initAudio();

  const canvas = document.getElementById('three-canvas');
  const three = new ThreeScene(canvas);

  const tweaks = initTweaks((key, value, state) => {
    if (key === 'theme') three.setTheme(value);
    if (key === 'scene') three.setMode(value);
    if (key === 'mode') applyScrollMode(state.mode);
  });

  const initial = tweaks.state();
  three.setTheme(initial.theme);
  three.setMode(initial.scene);
  applyScrollMode(initial.mode);

  initScroll((p) => three.setScrollProgress(p));

  // Reveal once everything renders
  requestAnimationFrame(() => {
    document.body.classList.add('three-ready');
    setTimeout(() => document.body.classList.add('loaded'), 500);
  });
};

function applyScrollMode(mode) {
  // mode-intro: 3D fades to a soft backdrop after first viewport
  // mode-full: 3D stays visible the whole way (no auto-fade)
  document.body.classList.toggle('mode-full', mode === 'full');
  document.body.classList.toggle('mode-intro', mode === 'intro');
}

main();
