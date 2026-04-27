import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const DANCER_URL = 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb';

const isMobile = matchMedia('(max-width: 720px)').matches;
const dprCap = isMobile ? 1.5 : Math.min(window.devicePixelRatio, 2);

// Per-section accent palettes — drives ring tint, sparkle color, accent light.
// Keys map to data-section names in markup.
const SECTION_PALETTES = {
  hero:     { ring: 0xc8a86a, spark: 0xfff1d6, accent: 0xe6cf9a },
  greeting: { ring: 0xb8b3a8, spark: 0xeae6dc, accent: 0xd0c8b8 },
  couple:   { ring: 0xd4a18a, spark: 0xfde0d0, accent: 0xe6b4a0 },
  gallery:  { ring: 0xe6c995, spark: 0xfff5e0, accent: 0xf0d8a8 },
  calendar: { ring: 0xa67d3d, spark: 0xfde0a8, accent: 0xc89a4f },
  location: { ring: 0xa97442, spark: 0xfdd0a0, accent: 0xc99060 },
  account:  { ring: 0xdaa57a, spark: 0xfde0c0, accent: 0xeac9a0 },
  share:    { ring: 0xc8a86a, spark: 0xfff1d6, accent: 0xe6cf9a }
};

// Dancer animation per section (uses RobotExpressive built-in clip names).
const SECTION_DANCE = {
  hero: 'Dance',
  greeting: 'Wave',
  couple: 'Yes',
  gallery: 'Dance',
  calendar: 'ThumbsUp',
  location: 'Walking',
  account: 'Yes',
  share: 'Dance'
};

const lerpColor = (color, target, alpha) => color.lerp(target, alpha);

export class ThreeScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(dprCap);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    this.camera.position.set(0, 0.5, 6);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    this.clock = new THREE.Clock();
    this.mode = 'ring';
    this.theme = 'dark';
    this.scrollProgress = 0;
    this.sectionProgress = 0;
    this.activeSection = 'hero';

    // Live palette colors (lerp toward target each frame)
    this.palette = {
      ring: new THREE.Color(SECTION_PALETTES.hero.ring),
      spark: new THREE.Color(SECTION_PALETTES.hero.spark),
      accent: new THREE.Color(SECTION_PALETTES.hero.accent)
    };
    this.target = {
      ring: new THREE.Color(SECTION_PALETTES.hero.ring),
      spark: new THREE.Color(SECTION_PALETTES.hero.spark),
      accent: new THREE.Color(SECTION_PALETTES.hero.accent)
    };

    this.groups = {
      ring: this._buildRing(),
      dancer: new THREE.Group()
    };
    this.scene.add(this.groups.ring);
    this.scene.add(this.groups.dancer);

    this._buildParticles();
    this._buildDeco();

    this.dancerLoaded = false;
    this.dancerMixer = null;
    this.dancerActions = {};
    this.dancerCurrent = null;

    this._applyTheme();
    this._setMode('ring');

    window.addEventListener('resize', () => this._resize());
    this._resize();
    this._tick = this._tick.bind(this);
    this.renderer.setAnimationLoop(this._tick);
  }

  setTheme(theme) {
    this.theme = theme;
    this._applyTheme();
  }

  setMode(mode) {
    this._setMode(mode);
    if (mode === 'dancer' && !this.dancerLoaded) this._loadDancer();
  }

  setScrollProgress(p) {
    this.scrollProgress = p;
  }

  setActiveSection(name, progress = 0) {
    if (!SECTION_PALETTES[name]) return;
    this.activeSection = name;
    this.sectionProgress = progress;
    const pal = SECTION_PALETTES[name];
    this.target.ring.setHex(pal.ring);
    this.target.spark.setHex(pal.spark);
    this.target.accent.setHex(pal.accent);

    if (this.dancerActions[SECTION_DANCE[name]]) {
      this._playDance(SECTION_DANCE[name]);
    }
  }

  _applyTheme() {
    const dark = this.theme === 'dark';
    this.scene.background = null;
    this.renderer.setClearColor(0x000000, 0);
    const fogColor = dark ? 0x0b0a08 : 0xf7f1e8;
    this.scene.fog = new THREE.Fog(fogColor, 7, 16);
    if (this.particleMat) {
      this.particleMat.opacity = dark ? 0.85 : 0.55;
    }
    if (this.ringMat) {
      this.ringMat.emissiveIntensity = dark ? 0.3 : 0.05;
    }
    if (this.deco?.ribbon) {
      this.deco.ribbon.material.opacity = dark ? 0.18 : 0.32;
    }
  }

  _setMode(mode) {
    this.mode = mode;
    this.groups.ring.visible = mode === 'ring';
    this.groups.dancer.visible = mode === 'dancer';
    if (this.deco?.group) {
      // Deco visible in ring mode, hidden in dancer mode (avoids visual clutter)
      this.deco.group.visible = mode === 'ring';
    }
  }

  _buildRing() {
    const group = new THREE.Group();
    group.scale.setScalar(0.62);
    group.position.y = -0.15;

    const ringGeo = new THREE.TorusGeometry(1.0, 0.12, 64, 256);
    this.ringMat = new THREE.MeshPhysicalMaterial({
      color: 0xc8a86a,
      metalness: 1.0,
      roughness: 0.18,
      emissive: 0x3a2a10,
      emissiveIntensity: 0.3,
      iridescence: 1.0,
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [120, 720]
    });
    const ring = new THREE.Mesh(ringGeo, this.ringMat);
    ring.rotation.x = Math.PI / 2.4;
    group.add(ring);

    const innerGeo = new THREE.TorusGeometry(0.86, 0.022, 32, 200);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xfff1d6,
      metalness: 1.0,
      roughness: 0.4
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    inner.rotation.x = Math.PI / 2.4;
    group.add(inner);

    const gemGeo = new THREE.IcosahedronGeometry(0.16, 1);
    const gemMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0,
      transmission: 1,
      ior: 2.4,
      thickness: 0.6,
      clearcoat: 1
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.set(0, 0.78, 0.4);
    group.add(gem);
    this.gem = gem;

    this.keyLight = new THREE.DirectionalLight(0xfff1d6, 1.4);
    this.keyLight.position.set(3, 4, 4);
    group.add(this.keyLight);

    this.rimLight = new THREE.PointLight(0xc8a86a, 2.0, 12);
    this.rimLight.position.set(-3, -2, -2);
    group.add(this.rimLight);

    this.ringGroup = group;
    return group;
  }

  _buildParticles() {
    const count = isMobile ? 200 : 480;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
      speeds[i] = 0.05 + Math.random() * 0.15;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleSpeeds = speeds;
    this.particleGeo = geo;

    this.particleMat = new THREE.PointsMaterial({
      color: 0xc8a86a,
      size: 0.025,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.particles = new THREE.Points(geo, this.particleMat);
    this.scene.add(this.particles);
  }

  _buildDeco() {
    const group = new THREE.Group();
    this.scene.add(group);

    // ---- Sparkles (4-pointed star) ----
    const sparkCount = isMobile ? 14 : 26;
    const sparkGeo = new THREE.BufferGeometry();
    const sparkPos = new Float32Array(sparkCount * 3);
    const sparkPhase = new Float32Array(sparkCount);
    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3 + 0] = (Math.random() - 0.5) * 8;
      sparkPos[i * 3 + 1] = (Math.random() - 0.5) * 6;
      sparkPos[i * 3 + 2] = (Math.random() - 0.5) * 3 - 0.5;
      sparkPhase[i] = Math.random() * Math.PI * 2;
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));

    this.deco = { group, sparkPhase, sparkGeo };

    const sparkMat = new THREE.PointsMaterial({
      map: this._makeSparkleTexture(),
      color: 0xfff1d6,
      size: 0.42,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    this.deco.sparkMat = sparkMat;
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    group.add(sparks);
    this.deco.sparks = sparks;

    // ---- Silk ribbons ----
    const ribbonGroup = new THREE.Group();
    group.add(ribbonGroup);
    this.deco.ribbonGroup = ribbonGroup;

    const ribbonMat = new THREE.MeshBasicMaterial({
      color: 0xfff5e0,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.deco.ribbon = { material: ribbonMat };

    const makeRibbon = (offset) => {
      const points = [];
      const baseX = (Math.random() - 0.5) * 6;
      const baseY = (Math.random() - 0.5) * 4;
      for (let i = 0; i < 6; i++) {
        points.push(
          new THREE.Vector3(
            baseX + Math.sin(i * 0.9 + offset) * 1.6,
            baseY + i * 0.5 - 1.2,
            -1 + Math.cos(i * 0.7 + offset) * 0.4
          )
        );
      }
      const curve = new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.4);
      const geo = new THREE.TubeGeometry(curve, 64, 0.014, 6, false);
      return new THREE.Mesh(geo, ribbonMat);
    };

    for (let i = 0; i < 3; i++) {
      const ribbon = makeRibbon(i * 1.7);
      ribbonGroup.add(ribbon);
    }
  }

  _makeSparkleTexture() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.4, 'rgba(255,241,214,0.6)');
    grad.addColorStop(1, 'rgba(255,241,214,0)');

    // Cross-shaped sparkle: vertical + horizontal beams
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(size / 2, size / 2, size / 2, size / 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(size / 2, size / 2, size / 14, size / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.fill();

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  async _loadDancer() {
    this.dancerLoaded = true;
    const loader = new GLTFLoader();
    try {
      const gltf = await loader.loadAsync(DANCER_URL);
      const model = gltf.scene;
      model.scale.setScalar(0.32);
      model.position.y = -1.2;

      this.dancerMixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        this.dancerActions[clip.name] = this.dancerMixer.clipAction(clip);
      });
      this._playDance(SECTION_DANCE[this.activeSection] || 'Dance');

      this.groups.dancer.add(model);

      const dancerKey = new THREE.DirectionalLight(0xfff1d6, 1.6);
      dancerKey.position.set(2, 4, 3);
      this.groups.dancer.add(dancerKey);

      const dancerRim = new THREE.PointLight(0xc8a86a, 2.0, 12);
      dancerRim.position.set(-2, 1, -2);
      this.groups.dancer.add(dancerRim);
    } catch (err) {
      console.warn('Dancer model failed to load', err);
    }
  }

  _playDance(name) {
    const next = this.dancerActions[name];
    if (!next || next === this.dancerCurrent) return;
    if (this.dancerCurrent) {
      this.dancerCurrent.fadeOut(0.4);
    }
    next.reset().fadeIn(0.4).play();
    this.dancerCurrent = next;
  }

  _resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  _tick() {
    const dt = this.clock.getDelta();
    const t = this.clock.elapsedTime;
    const lerpA = Math.min(1, dt * 2.4);

    // ---- Palette lerp ----
    lerpColor(this.palette.ring, this.target.ring, lerpA);
    lerpColor(this.palette.spark, this.target.spark, lerpA);
    lerpColor(this.palette.accent, this.target.accent, lerpA);
    if (this.ringMat) this.ringMat.color.copy(this.palette.ring);
    if (this.particleMat) this.particleMat.color.copy(this.palette.ring);
    if (this.rimLight) this.rimLight.color.copy(this.palette.accent);
    if (this.deco?.sparkMat) this.deco.sparkMat.color.copy(this.palette.spark);

    // ---- Ring scene ----
    if (this.ringGroup) {
      this.ringGroup.rotation.y = t * 0.18 + this.scrollProgress * Math.PI * 1.5;
      this.ringGroup.rotation.x = -0.15 + Math.sin(t * 0.4) * 0.05;
      this.ringGroup.position.y = -0.15 + Math.sin(t * 0.6) * 0.04;
      if (this.gem) this.gem.rotation.y = t * 1.2;
    }

    // ---- Dancer scene ----
    if (this.groups.dancer) {
      this.groups.dancer.rotation.y = t * 0.15 + this.scrollProgress * Math.PI;
    }
    if (this.dancerMixer) this.dancerMixer.update(dt);

    // ---- Particles (drift up) ----
    if (this.particleGeo) {
      const pos = this.particleGeo.attributes.position.array;
      for (let i = 0; i < this.particleSpeeds.length; i++) {
        pos[i * 3 + 1] += this.particleSpeeds[i] * dt * 0.6;
        if (pos[i * 3 + 1] > 5) pos[i * 3 + 1] = -5;
      }
      this.particleGeo.attributes.position.needsUpdate = true;
      this.particles.rotation.y = this.scrollProgress * 0.6;
    }

    // ---- Deco layer ----
    if (this.deco?.group) {
      this.deco.group.rotation.z = Math.sin(t * 0.05) * 0.02 + this.scrollProgress * 0.3;
      this.deco.group.position.y = -this.scrollProgress * 1.2;
    }
    if (this.deco?.sparkMat) {
      // Twinkle by oscillating size
      this.deco.sparkMat.size = 0.42 + Math.sin(t * 1.4) * 0.06;
      this.deco.sparkMat.opacity = 0.55 + Math.sin(t * 1.1) * 0.18;
    }
    if (this.deco?.ribbonGroup) {
      this.deco.ribbonGroup.rotation.y = t * 0.04;
      this.deco.ribbonGroup.children.forEach((r, i) => {
        r.position.x = Math.sin(t * 0.18 + i) * 0.4;
      });
    }

    // ---- Camera scroll offset ----
    const camOffset = this.scrollProgress * 0.8;
    this.camera.position.y = 0.5 - camOffset;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }
}
