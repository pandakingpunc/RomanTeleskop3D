// 3D uygulamanın beyni: sahneyi kurar, durumları (seçim, kesit, patlatma, açılma, ışık yolu…)
// yönetir ve arayüze küçük bir API sunar. Arayüz katmanı (js/ui) yalnızca bu API'yi kullanır.
import * as THREE from 'three';
import { createViewer } from './viewer.js';
import { createEnvironment } from './environment.js';
import { createMaterialLibrary } from './materials.js';
import { buildObservatory } from './model.js';
import { createCameraRig } from './camera-rig.js';
import { createCutaway } from './cutaway.js';
import { createLightPath } from './lightpath.js';
import { createHotspots, createDimensions } from './annotations.js';
import { PARTS, PART_ORDER, partNumber } from '../content/parts.js';
import { TOUR, DEPLOY_STEPS } from '../content/sequences.js';
import { t, pick, formatNumber, onLanguageChange } from '../i18n.js';

const GLOW_OUTER = 0x42c8ff;
const GLOW_INNER = 0xffc53d;
const DEFAULT_VIEW = new THREE.Vector3(0.62, 0.42, 1);
const LIGHT_VIEW = new THREE.Vector3(0.22, 0.42, 1);

function autoQuality() {
  const coarse = matchMedia('(pointer: coarse)').matches;
  const small = Math.min(screen.width, screen.height) < 820;
  const memory = navigator.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  if (memory <= 2 || cores <= 2) return 'low';
  if (coarse && small) return 'medium';
  return 'high';
}

export async function createApp({ canvas, stage, reducedMotion = false, onProgress }) {
  const viewer = createViewer({ canvas, stage, reducedMotion });
  const { scene, camera, controls, renderer } = viewer;
  onProgress?.(0.55);
  await nextFrame();

  const env = createEnvironment({ scene, renderer });
  const materials = createMaterialLibrary();
  const model = buildObservatory(materials);
  scene.add(model.root);
  onProgress?.(0.75);
  await nextFrame();

  const rig = createCameraRig({ camera, controls, reducedMotion });
  const cutaway = createCutaway({ model });
  const light = createLightPath({ model });
  const dims = createDimensions({ scene });
  const targets = [...model.parts.values()].flatMap((p) => p.meshes);
  const events = new EventTarget();

  const state = {
    selected: null,
    hover: null,
    inside: false,
    light: false,
    lightStep: 1,
    explode: 0,
    explodeTarget: 0,
    deploy: 1,
    dims: false,
    labels: true,
    autorotate: false,
    bodies: true,
    quality: 'auto',
    activeQuality: autoQuality(),
  };
  let deployTween = null;
  let lowered = false;

  const emit = (type, detail) => events.dispatchEvent(new CustomEvent(type, { detail }));
  // Dikey (telefon) ekranlarda yatay görüş açısı dar olduğundan biraz daha geniş çerçevele
  const pad = (value) => value * (camera.aspect < 0.9 ? 1.12 : 1);
  const emitState = () => emit('state', { ...state });

  const hotspots = createHotspots({
    model,
    onSelect: (id) => select(id, { focus: true, source: 'hotspot' }),
    onHover: (id) => setHover(id, { source: 'hotspot' }),
  });

  /* ------------------------- Vurgulama ------------------------- */
  const isInner = (id) => PARTS[id]?.layer === 'inner';

  function glow(id, level) {
    const part = model.parts.get(id);
    if (!part) return;
    const color = isInner(id) ? GLOW_INNER : GLOW_OUTER;
    for (const mesh of part.meshes) {
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
        if (level > 0) {
          material.emissive.setHex(color);
          material.emissiveIntensity = level === 2 ? 0.26 : 0.16;
        } else {
          material.emissive.setHex(material.userData.baseEmissive ?? 0);
          material.emissiveIntensity = material.userData.baseEmissiveIntensity ?? 1;
        }
      }
    }
    viewer.requestRender();
  }

  function refreshGlow(id) {
    if (!id) return;
    glow(id, id === state.selected ? 2 : id === state.hover ? 1 : 0);
  }

  function setHover(id, { x, y, source = 'pointer' } = {}) {
    if (id === state.hover) {
      if (id) emit('hover', { id, x, y, source });
      return;
    }
    const previous = state.hover;
    state.hover = id;
    refreshGlow(previous);
    refreshGlow(id);
    emit('hover', { id, x, y, source });
  }

  /* ------------------------- Seçim ve kamera ------------------------- */
  function partBox(id) {
    const box = new THREE.Box3();
    model.root.updateMatrixWorld(true);
    for (const mesh of model.parts.get(id)?.meshes ?? []) box.expandByObject(mesh);
    return box;
  }

  function modelBox() {
    model.root.updateMatrixWorld(true);
    return new THREE.Box3().setFromObject(model.root);
  }

  function focusPart(id, duration) {
    const info = PARTS[id];
    const box = partBox(id);
    if (box.isEmpty()) return;
    const dir = info?.view ? new THREE.Vector3(...info.view) : camera.position.clone().sub(controls.target);
    rig.frame(box, dir, { padding: pad(2.0), minDistance: 4, duration });
  }

  function select(id, { focus = false, source = 'ui' } = {}) {
    if (id && !model.parts.has(id)) return;
    const previous = state.selected;
    state.selected = id;
    refreshGlow(previous);
    refreshGlow(id);
    hotspots.setActive(id);
    if (id && isInner(id) && !state.inside) setInside(true);
    if (id && focus) focusPart(id);
    emit('select', { id, source });
    emitState();
  }

  function cycle(step) {
    let index = PART_ORDER.indexOf(state.selected);
    // Seçim yokken → ilk parçaya, ← son parçaya gider
    if (index === -1) index = step > 0 ? -1 : 0;
    const next = PART_ORDER[(index + step + PART_ORDER.length) % PART_ORDER.length];
    select(next, { focus: true, source: 'keyboard' });
  }

  function resetView(duration) {
    rig.frame(modelBox(), DEFAULT_VIEW, { padding: pad(0.86), duration });
  }

  /* ------------------------- Modlar ------------------------- */
  function setInside(on) {
    on = Boolean(on);
    if (on === state.inside) return;
    state.inside = on;
    if (on && state.explodeTarget > 0) setExplode(0);
    cutaway.setEnabled(on);
    if (!on && state.light) stopLight();
    if (!on && state.selected && isInner(state.selected)) select(null, { source: 'system' });
    syncHotspots();
    viewer.requestRender();
    emitState();
  }

  function setExplode(value, { frame = false } = {}) {
    state.explodeTarget = THREE.MathUtils.clamp(value, 0, 1);
    if (frame) {
      const box = state.explodeTarget > 0 ? explodedBox(state.explodeTarget) : modelBox();
      rig.frame(box, camera.position.clone().sub(controls.target), { padding: pad(state.explodeTarget > 0 ? 0.8 : 0.86) });
    }
    if (state.explodeTarget > 0) {
      if (state.inside) setInside(false);
      if (state.light) stopLight();
      // Boyut çizgileri birleşik modele aittir
      if (state.dims) {
        state.dims = false;
        dims.setVisible(false);
      }
    }
    emitState();
  }

  function setDeploy(value, duration = 2600) {
    deployTween = {
      from: state.deploy,
      to: THREE.MathUtils.clamp(value, 0, 1),
      t0: performance.now(),
      dur: reducedMotion ? 1 : duration * Math.max(0.25, Math.abs(value - state.deploy)),
    };
    emitState();
  }

  function startLight() {
    state.light = true;
    setExplode(0);
    if (!state.inside) setInside(true);
    light.setActive(true);
    syncHotspots();
    setLightStep(1);
    const box = new THREE.Box3(new THREE.Vector3(-8.6, -1.6, -1.8), new THREE.Vector3(1.6, 1.6, 2.0));
    rig.frame(box, LIGHT_VIEW, { padding: pad(0.95) });
    emitState();
  }

  function stopLight() {
    state.light = false;
    light.setActive(false);
    syncHotspots();
    emitState();
  }

  function setLightStep(step) {
    state.lightStep = THREE.MathUtils.clamp(step, 1, 5);
    light.setStep(state.lightStep);
    emitState();
  }

  function setDims(on) {
    state.dims = Boolean(on);
    dims.setVisible(state.dims);
    if (state.dims) {
      // Ölçüler birleşik modele aittir
      setExplode(0);
      rig.frame(modelBox(), new THREE.Vector3(0.35, 0.3, 1), { padding: pad(1.0) });
    }
    viewer.requestRender();
    emitState();
  }

  function setLabels(on) {
    state.labels = Boolean(on);
    syncHotspots();
    viewer.requestRender();
    emitState();
  }

  function setAutorotate(on) {
    state.autorotate = Boolean(on);
    controls.autoRotate = state.autorotate;
    emitState();
  }

  function setBodies(on) {
    state.bodies = Boolean(on);
    env.setBodiesVisible(state.bodies);
    viewer.requestRender();
    emitState();
  }

  function setQuality(name) {
    state.quality = name;
    state.activeQuality = name === 'auto' ? autoQuality() : name;
    lowered = false;
    viewer.setQuality(state.activeQuality);
    emitState();
  }

  function syncHotspots() {
    // Işık yolu anlatımı sırasında etiketler sahneyi kalabalıklaştırmasın
    hotspots.setVisibility({ labels: state.labels && !state.light, inside: state.inside });
  }

  /* ------------------------- Diziler (tur, açılış) ------------------------- */
  function tourStep(index) {
    const stop = TOUR[index];
    if (!stop) return;
    if (state.light) stopLight();
    if (stop.overview) {
      if (state.selected) select(null, { source: 'tour' });
      setInside(false);
      setExplode(stop.explode ?? 0);
      const box = stop.explode ? explodedBox(stop.explode) : modelBox();
      rig.frame(box, new THREE.Vector3(...stop.view), { padding: pad(stop.explode ? 0.8 : 0.86), duration: 1800 });
      return;
    }
    setExplode(0);
    setInside(Boolean(stop.inside));
    select(stop.part, { source: 'tour' });
    focusPart(stop.part, 1800);
  }

  function explodedBox(amount) {
    const saved = state.explode;
    model.setExplode(amount);
    const box = modelBox();
    model.setExplode(saved);
    return box;
  }

  function deployStep(index) {
    const step = DEPLOY_STEPS[index];
    if (!step) return;
    if (index === 0) {
      setExplode(0);
      setInside(false);
      select(null, { source: 'deploy' });
      rig.frame(modelBox(), new THREE.Vector3(0.75, 0.55, 1), { padding: pad(0.9), duration: 1600 });
      setDeploy(0, 1400);
    } else {
      setDeploy(step.value, 2600);
    }
  }

  /* ------------------------- İşaretçi (fare/dokunma) ------------------------- */
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let pointerDown = null;
  let pendingMove = null;

  function pickAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(targets, false);
    return hits.find((h) => !cutaway.isClipped(h))?.object.userData.partId ?? null;
  }

  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    pendingMove = { x: e.clientX, y: e.clientY, dragging: e.buttons !== 0 };
  });
  canvas.addEventListener('pointerleave', () => {
    pendingMove = null;
    setHover(null);
  });
  canvas.addEventListener('pointerdown', (e) => {
    pointerDown = { x: e.clientX, y: e.clientY, time: performance.now() };
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!pointerDown) return;
    const dx = e.clientX - pointerDown.x;
    const dy = e.clientY - pointerDown.y;
    const quick = performance.now() - pointerDown.time < 600;
    pointerDown = null;
    if (dx * dx + dy * dy > 36 || !quick) return;
    const id = pickAt(e.clientX, e.clientY);
    if (id) select(id, { focus: true, source: 'pointer' });
    else if (state.selected) select(null, { source: 'pointer' });
  });
  canvas.addEventListener('dblclick', (e) => {
    if (!pickAt(e.clientX, e.clientY)) resetView();
  });
  controls.addEventListener('start', () => emit('interaction', {}));

  /* ------------------------- Kare döngüsü ------------------------- */
  let occlusionTimer = 0;
  const lastPose = new Float32Array(19);
  const pose = new Float32Array(19);
  viewer.addFrameHook((dt) => {
    let active = rig.update();

    if (pendingMove) {
      const { x, y, dragging } = pendingMove;
      pendingMove = null;
      if (!dragging) setHover(pickAt(x, y), { x, y });
    }

    // Patlatma: hedefe yumuşak yaklaşım
    if (Math.abs(state.explode - state.explodeTarget) > 0.0005) {
      state.explode += (state.explodeTarget - state.explode) * Math.min(1, dt * (reducedMotion ? 30 : 4.5));
      if (Math.abs(state.explode - state.explodeTarget) < 0.0005) state.explode = state.explodeTarget;
      model.setExplode(state.explode);
      active = true;
    }

    // Açılma animasyonu
    if (deployTween) {
      const k = Math.min(1, (performance.now() - deployTween.t0) / deployTween.dur);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      state.deploy = THREE.MathUtils.lerp(deployTween.from, deployTween.to, e);
      model.setDeploy(state.deploy);
      if (k >= 1) {
        deployTween = null;
        emitState();
      }
      active = true;
    }

    if (cutaway.update(camera, dt)) active = true;
    if (light.update(dt)) active = true;
    env.update(camera, renderer.getPixelRatio());

    // Etiket örtülme testi pahalıdır: yalnızca kamera ya da model değiştiyse yap
    occlusionTimer += dt;
    if (state.labels && occlusionTimer > 0.15) {
      occlusionTimer = 0;
      camera.updateMatrixWorld();
      pose.set(camera.matrixWorld.elements);
      pose[16] = state.explode;
      pose[17] = state.deploy;
      pose[18] = state.inside ? 1 : 0;
      if (pose.some((v, i) => v !== lastPose[i])) {
        lastPose.set(pose);
        hotspots.updateOcclusion(camera, targets, cutaway.isClipped);
      }
    }
    return active;
  });

  viewer.onFps((fps) => {
    if (state.quality !== 'auto' || lowered || rig.busy) return;
    if (fps < 28 && state.activeQuality !== 'low') {
      state.activeQuality = state.activeQuality === 'high' ? 'medium' : 'low';
      viewer.setQuality(state.activeQuality);
      if (state.activeQuality === 'low') lowered = true;
      emit('quality-lowered', { quality: state.activeQuality });
      emitState();
    }
  });

  /* ------------------------- Dil ------------------------- */
  function applyLanguage() {
    hotspots.setContent({
      label: (id) => pick(PARTS[id])?.name ?? id,
      number: (id) => partNumber(id),
      isInner,
    });
    dims.setText(t, formatNumber);
    viewer.requestRender();
  }
  onLanguageChange(applyLanguage);
  applyLanguage();

  /* ------------------------- Ekran görüntüsü ------------------------- */
  function screenshot() {
    viewer.renderNow();
    const w = canvas.width;
    const h = canvas.height;
    const out = document.createElement('canvas');
    out.width = w;
    out.height = h;
    const ctx = out.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    const scale = Math.max(1, w / 1400);
    ctx.font = `600 ${Math.round(15 * scale)}px system-ui, -apple-system, Segoe UI, sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.72)';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${t('app.heading')} · pandakingpunc.github.io/RomanTeleskop3D`, 18 * scale, h - 16 * scale);
    return new Promise((resolve) => out.toBlob(resolve, 'image/png'));
  }

  /* ------------------------- Başlangıç ------------------------- */
  viewer.setQuality(state.activeQuality);
  syncHotspots();
  // Açılışta uzaktan yaklaşan kamera
  const { center, distance } = rig.distanceToFit(modelBox(), 0.86);
  camera.position.copy(center).addScaledVector(DEFAULT_VIEW.clone().normalize(), distance * (reducedMotion ? 1 : 2.4));
  controls.target.copy(center);
  controls.update();
  onProgress?.(0.95);

  // Samanyolu arka planını ilk karelerden sonra, ana iş parçacığı boşaldığında üret
  const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 400));
  idle(() => {
    env.loadSky();
    viewer.requestRender();
  }, { timeout: 3000 });

  return {
    events,
    on(type, fn) { events.addEventListener(type, (e) => fn(e.detail)); },
    get state() { return { ...state }; },
    viewer,
    intro() { resetView(2400); },
    select,
    focusPart,
    cycle,
    resetView,
    setInside,
    setExplode,
    setDeploy,
    setDims,
    setLabels,
    setAutorotate,
    setBodies,
    setQuality,
    setViewShift: (px, py) => viewer.setViewShift(px, py),
    startLight,
    stopLight,
    setLightStep,
    tourStep,
    deployStep,
    screenshot,
  };
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}
