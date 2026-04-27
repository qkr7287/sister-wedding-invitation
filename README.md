# Sister&rsquo;s Wedding Invitation

Editorial, 3D-driven wedding invitation web. Mobile + desktop responsive, single-page, statically buildable.

## Stack

- **Vite** (build / dev server)
- **Three.js** (WebGL scene — switchable Ring / Dancer)
- **Lenis** (smooth scroll)
- **Vanilla JS + CSS** (no UI framework, no GSAP)
- **Fonts**: Fraunces (variable serif) + Italiana (display) + Pretendard (Korean)

## Live tweaks

A floating panel (top-right) lets you switch:

- **Mood**: Dark cinematic / Light romantic
- **Scroll mode**: Intro 3D / Full scroll
- **3D scene**: Ring / Dancer (animated humanoid)

Selections persist in `localStorage`.

## Develop

```bash
npm install
npm run dev    # http://localhost:5173
npm run build
npm run preview
```

## Configuration

Copy `.env.example` to `.env` and fill in the wedding info. All keys are optional &mdash; defaults live in `src/config.js`.

```bash
cp .env.example .env
```

## Project layout

```
index.html
src/
  main.js          # entry & orchestration
  config.js        # env-driven data + defaults
  sections.js      # all wedding sections (hero, greeting, ...)
  threeScene.js    # WebGL: ring + dancer + particles
  scroll.js        # Lenis + IntersectionObserver reveals
  tweaks.js        # live tweaks panel
  audio.js         # demo ambient pad (Web Audio)
  style.css        # editorial style sheet w/ themes
```

## Notes

- The dancer model is fetched from `threejs.org/examples/models/gltf/RobotExpressive/` &mdash; replace with a custom .glb later.
- Maps are placeholder buttons; Kakao + Naver SDK integration is planned.
- BGM is a procedural ambient pad &mdash; replace with an audio file when ready.
