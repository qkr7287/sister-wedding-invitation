import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const DANCER_URL = 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb';

const isMobile = matchMedia('(max-width: 720px)').matches;
const dprCap = isMobile ? 1.5 : Math.min(window.devicePixelRatio, 2);

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

    this.groups = {
      ring: this._buildRing(),
      dancer: new THREE.Group()
    };
    this.scene.add(this.groups.ring);
    this.scene.add(this.groups.dancer);
    this._buildParticles();

    this.dancerLoaded = false;
    this.dancerMixer = null;
    this.dancerAction = null;

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

  _applyTheme() {
    const dark = this.theme === 'dark';
    this.scene.background = null;
    this.renderer.setClearColor(0x000000, 0);
    const fogColor = dark ? 0x0b0a08 : 0xf7f1e8;
    this.scene.fog = new THREE.Fog(fogColor, 7, 16);
    if (this.keyLight) {
      this.keyLight.intensity = dark ? 1.4 : 1.1;
      this.keyLight.color.setHex(dark ? 0xfff1d6 : 0xfff8ec);
    }
    if (this.rimLight) {
      this.rimLight.color.setHex(dark ? 0xc8a86a : 0xb07a4a);
    }
    if (this.particleMat) {
      this.particleMat.color.setHex(dark ? 0xc8a86a : 0xb07a4a);
      this.particleMat.opacity = dark ? 0.85 : 0.55;
    }
    if (this.ringMat) {
      this.ringMat.color.setHex(dark ? 0xc8a86a : 0xb07a4a);
      this.ringMat.emissive.setHex(dark ? 0x3a2a10 : 0x1a0e04);
    }
  }

  _setMode(mode) {
    this.mode = mode;
    this.groups.ring.visible = mode === 'ring';
    this.groups.dancer.visible = mode === 'dancer';
  }

  _buildRing() {
    const group = new THREE.Group();

    group.scale.setScalar(0.62);
    group.position.y = -0.15;

    const ringGeo = new THREE.TorusGeometry(1.0, 0.12, 64, 256);
    this.ringMat = new THREE.MeshStandardMaterial({
      color: 0xc8a86a,
      metalness: 1.0,
      roughness: 0.18,
      emissive: 0x3a2a10,
      emissiveIntensity: 0.4
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

  async _loadDancer() {
    this.dancerLoaded = true;
    const loader = new GLTFLoader();
    try {
      const gltf = await loader.loadAsync(DANCER_URL);
      const model = gltf.scene;
      model.scale.setScalar(0.32);
      model.position.y = -1.2;

      this.dancerMixer = new THREE.AnimationMixer(model);
      const dance = gltf.animations.find((a) => a.name === 'Dance') || gltf.animations[0];
      if (dance) {
        this.dancerAction = this.dancerMixer.clipAction(dance);
        this.dancerAction.play();
      }
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

    if (this.ringGroup) {
      this.ringGroup.rotation.y = t * 0.18 + this.scrollProgress * Math.PI * 1.5;
      this.ringGroup.rotation.x = -0.15 + Math.sin(t * 0.4) * 0.05;
      this.ringGroup.position.y = -0.15 + Math.sin(t * 0.6) * 0.04;
      if (this.gem) this.gem.rotation.y = t * 1.2;
    }

    if (this.groups.dancer) {
      this.groups.dancer.rotation.y = t * 0.15 + this.scrollProgress * Math.PI;
    }
    if (this.dancerMixer) this.dancerMixer.update(dt);

    if (this.particleGeo) {
      const pos = this.particleGeo.attributes.position.array;
      for (let i = 0; i < this.particleSpeeds.length; i++) {
        pos[i * 3 + 1] += this.particleSpeeds[i] * dt * 0.6;
        if (pos[i * 3 + 1] > 5) pos[i * 3 + 1] = -5;
      }
      this.particleGeo.attributes.position.needsUpdate = true;
      this.particles.rotation.y = this.scrollProgress * 0.6;
    }

    const camOffset = this.scrollProgress * 0.8;
    this.camera.position.y = 0.5 - camOffset;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }
}
