// Görüntüleyici: WebGL çizici, kamera, yörünge kontrolleri, son işleme (bloom) ve
// gerektiğinde çizim yapan (pil dostu) animasyon döngüsü.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

const QUALITY = {
  high: { pixelRatio: 2, bloom: true, shadows: true, shadowSize: 2048, samples: 4 },
  medium: { pixelRatio: 1.5, bloom: true, shadows: true, shadowSize: 1024, samples: 4 },
  low: { pixelRatio: 1, bloom: false, shadows: false, shadowSize: 512, samples: 0 },
};

export function createViewer({ canvas, stage, reducedMotion }) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.localClippingEnabled = true;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020309);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 4000);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = !reducedMotion;
  controls.dampingFactor = 0.075;
  controls.minDistance = 2.2;
  controls.maxDistance = 70;
  controls.zoomToCursor = true;
  controls.autoRotateSpeed = 0.6;
  controls.rotateSpeed = 0.85;
  controls.screenSpacePanning = true;

  // Etiketler (HTML) için ikinci çizici
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.className = 'labels';
  labelRenderer.domElement.setAttribute('aria-hidden', 'true');
  stage.appendChild(labelRenderer.domElement);

  // Son işleme: HDR çizim hedefi + bloom + ton eşleme
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, target);
  const renderPass = new RenderPass(scene, camera);
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.4, 0.35, 1.05);
  const output = new OutputPass();
  composer.addPass(renderPass);
  composer.addPass(bloom);
  composer.addPass(output);

  let quality = QUALITY.high;
  let qualityName = 'high';
  let width = 1;
  let height = 1;
  let needsRender = true;
  // Yan panel açıkken sahneyi görünür alana ortalamak için yatay görüntü kaydırma (piksel)
  const viewShift = { value: 0, target: 0, y: 0, targetY: 0 };
  const frameHooks = new Set();
  const listeners = new Set();

  function applySize() {
    const rect = stage.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width));
    height = Math.max(1, Math.round(rect.height));
    const ratio = Math.min(window.devicePixelRatio || 1, quality.pixelRatio);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    composer.setPixelRatio(ratio);
    composer.setSize(width, height);
    bloom.setSize(width * ratio, height * ratio);
    labelRenderer.setSize(width, height);
    camera.aspect = width / height;
    applyViewShift();
    needsRender = true;
  }

  function applyViewShift() {
    if (Math.abs(viewShift.value) < 0.5 && Math.abs(viewShift.y) < 0.5) camera.clearViewOffset();
    else camera.setViewOffset(width, height, viewShift.value, viewShift.y, width, height);
    camera.updateProjectionMatrix();
  }

  function setQuality(name) {
    quality = QUALITY[name] ?? QUALITY.high;
    qualityName = name;
    renderer.shadowMap.enabled = quality.shadows;
    for (const rt of [composer.renderTarget1, composer.renderTarget2]) {
      if (rt.samples !== quality.samples) {
        rt.samples = quality.samples;
        rt.dispose(); // yeni örnekleme sayısıyla yeniden oluşturulsun
      }
    }
    scene.traverse((obj) => {
      if (obj.isDirectionalLight && obj.castShadow) {
        obj.shadow.mapSize.set(quality.shadowSize, quality.shadowSize);
        obj.shadow.map?.dispose();
        obj.shadow.map = null;
      }
      if (obj.material) {
        const list = Array.isArray(obj.material) ? obj.material : [obj.material];
        for (const material of list) material.needsUpdate = true;
      }
    });
    applySize();
  }

  const resizeObserver = new ResizeObserver(applySize);
  resizeObserver.observe(stage);
  window.addEventListener('resize', applySize);

  controls.addEventListener('change', () => { needsRender = true; });

  function render() {
    if (quality.bloom) composer.render();
    else renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
  }

  // Kare süresi ölçümü (otomatik kalite ayarı için)
  let fpsSamples = [];
  const timer = new THREE.Timer();
  timer.connect(document);

  function frame(time) {
    timer.update(time);
    const dt = Math.min(timer.getDelta(), 0.1);
    if (Math.abs(viewShift.target - viewShift.value) > 0.5 || Math.abs(viewShift.targetY - viewShift.y) > 0.5) {
      const k = Math.min(1, dt * 7);
      viewShift.value += (viewShift.target - viewShift.value) * k;
      viewShift.y += (viewShift.targetY - viewShift.y) * k;
      applyViewShift();
      needsRender = true;
    }
    let active = controls.update(dt) === true;
    for (const hook of frameHooks) {
      if (hook(dt, timer.getElapsed()) === true) active = true;
    }
    if (active || needsRender || controls.autoRotate) {
      needsRender = false;
      render();
      fpsSamples.push(dt);
      if (fpsSamples.length >= 90) {
        const avg = fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length;
        fpsSamples = [];
        for (const listener of listeners) listener(1 / avg);
      }
    }
  }

  applySize();
  renderer.setAnimationLoop(frame);

  return {
    renderer,
    scene,
    camera,
    controls,
    labelRenderer,
    bloom,
    get quality() { return qualityName; },
    get size() { return { width, height }; },
    setQuality,
    /** Sahneyi kaydırır (piksel). x > 0: nesneler sola, y > 0: nesneler yukarı. */
    setViewShift(px, py = 0, instant = false) {
      viewShift.target = px;
      viewShift.targetY = py;
      if (instant || reducedMotion) {
        viewShift.value = px;
        viewShift.y = py;
        applyViewShift();
      }
      needsRender = true;
    },
    requestRender() { needsRender = true; },
    /** Her karede çağrılır; true döndürürse çizim sürer. */
    addFrameHook(hook) { frameHooks.add(hook); return () => frameHooks.delete(hook); },
    onFps(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    renderNow: render,
    resize: applySize,
    dispose() {
      renderer.setAnimationLoop(null);
      resizeObserver.disconnect();
      controls.dispose();
      composer.dispose();
      renderer.dispose();
    },
  };
}
