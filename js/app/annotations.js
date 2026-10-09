// 3D sahneye bağlı açıklamalar: numaralı parça etiketleri (HTML), boyut çizgileri ve
// ölçek için 1,8 m boyunda bir insan figürü.
import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { DIMS, ENVELOPE } from './model.js';

/**
 * Parça etiketleri. Her etiket gerçek bir <button>'dır; klavyeyle odaklanabilir.
 * @param {{model: any, onSelect: (id: string) => void, onHover: (id: string|null) => void}} opts
 */
export function createHotspots({ model, onSelect, onHover }) {
  const items = [];
  for (const [id, part] of model.parts) {
    if (!part.hotspot) continue;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hotspot';
    button.dataset.part = id;
    // Klavye ve ekran okuyucu kullanıcıları aynı işlevi Parçalar listesinden erişilebilir biçimde
    // kullanır; sahnedeki etiketler fare/dokunma içindir ve sekme sırasını kalabalıklaştırmaz.
    button.tabIndex = -1;
    button.innerHTML = '<span class="hotspot__dot"></span><span class="hotspot__label"></span>';
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      onSelect(id);
    });
    button.addEventListener('pointerenter', () => onHover(id));
    button.addEventListener('pointerleave', () => onHover(null));
    // Etiket üzerinde sürükleme sahneyi döndürmesin
    button.addEventListener('pointerdown', (e) => e.stopPropagation());
    const object = new CSS2DObject(button);
    object.center.set(0.5, 0.5);
    part.hotspot.add(object);
    items.push({ id, button, object, inner: false, occluded: false });
  }

  const raycaster = new THREE.Raycaster();
  const world = new THREE.Vector3();
  const dir = new THREE.Vector3();

  /**
   * Etiketlerin metin, numara ve görünürlüğünü günceller.
   * @param {{label: (id:string)=>string, number: (id:string)=>number, isInner: (id:string)=>boolean}} info
   */
  function setContent(info) {
    for (const item of items) {
      item.inner = info.isInner(item.id);
      item.button.classList.toggle('hotspot--inner', item.inner);
      item.button.querySelector('.hotspot__dot').textContent = String(info.number(item.id));
      item.button.querySelector('.hotspot__label').textContent = info.label(item.id);
      item.button.setAttribute('aria-label', `${info.number(item.id)}. ${info.label(item.id)}`);
    }
  }

  function setVisibility({ labels, inside }) {
    for (const item of items) {
      const show = labels && (!item.inner || inside);
      item.object.visible = show;
    }
  }

  function setActive(id) {
    for (const item of items) item.button.classList.toggle('is-active', item.id === id);
  }

  /** Model tarafından gizlenen etiketleri soluklaştırır (zaman zaman çağrılır). */
  function updateOcclusion(camera, targets, isClipped) {
    for (const item of items) {
      if (!item.object.visible) continue;
      item.object.getWorldPosition(world);
      dir.subVectors(world, camera.position);
      const distance = dir.length();
      raycaster.set(camera.position, dir.normalize());
      raycaster.far = distance - 0.08;
      const hits = raycaster.intersectObjects(targets, false);
      const blocker = hits.find((h) => h.object.userData.partId !== item.id && !isClipped(h));
      const occluded = Boolean(blocker);
      if (occluded !== item.occluded) {
        item.occluded = occluded;
        item.button.classList.toggle('is-occluded', occluded);
      }
    }
  }

  return { items, setContent, setVisibility, setActive, updateOcclusion };
}

/** Boyut çizgileri ve insan figürü. */
export function createDimensions({ scene }) {
  const group = new THREE.Group();
  group.name = 'dimensions';
  group.visible = false;
  scene.add(group);

  const material = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, depthTest: false });
  const labels = [];

  function line(points) {
    const geo = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(...p)));
    const l = new THREE.Line(geo, material);
    l.renderOrder = 20;
    group.add(l);
    return l;
  }

  function measure(a, b, tickDir, labelOffset, key, value) {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...b);
    const T = new THREE.Vector3(...tickDir).multiplyScalar(0.25);
    line([a, b]);
    line([A.clone().add(T).toArray(), A.clone().sub(T).toArray()]);
    line([B.clone().add(T).toArray(), B.clone().sub(T).toArray()]);
    const el = document.createElement('div');
    el.className = 'dim-label';
    const object = new CSS2DObject(el);
    object.position.copy(A).add(B).multiplyScalar(0.5).add(new THREE.Vector3(...labelOffset));
    group.add(object);
    labels.push({ el, key, value });
  }

  const xTip = DIMS.barrel.front - DIMS.dac.length;
  const xEnd = DIMS.comms.back + 0.2;
  const yLow = -2.6;
  const zFront = 3.6;
  measure([xTip, yLow, zFront], [xEnd, yLow, zFront], [0, 1, 0], [0, -0.45, 0], 'dims.length', ENVELOPE.length);
  const ySass = DIMS.barrel.side * Math.sqrt(3) / 2 + DIMS.sass.gap + 0.4;
  const w = (DIMS.sass.panelWidth * 3) / 2;
  measure([DIMS.sass.front - 0.6, ySass, -w], [DIMS.sass.front - 0.6, ySass, w], [1, 0, 0], [-0.2, 0.45, 0], 'dims.width', ENVELOPE.width);
  // Birincil ayna çapı (aynanın önünde, dikey)
  const xm = DIMS.primary.x - 0.25;
  measure([xm, -DIMS.primary.radius, 0.05], [xm, DIMS.primary.radius, 0.05], [0, 0, 1], [0, 0, 0.9], 'dims.mirror', null);

  // Ölçek için insan figürü (1,8 m)
  const person = new THREE.Group();
  person.name = 'person';
  const skin = new THREE.MeshStandardMaterial({ color: 0xffc53d, roughness: 0.55, metalness: 0.1, emissive: 0x4a3200, emissiveIntensity: 0.6 });
  const add = (geo, x, y, z, rz = 0) => {
    const m = new THREE.Mesh(geo, skin);
    m.position.set(x, y, z);
    m.rotation.z = rz;
    m.castShadow = true;
    person.add(m);
    return m;
  };
  add(new THREE.SphereGeometry(0.11, 20, 14), 0, 1.68, 0);
  add(new THREE.CapsuleGeometry(0.16, 0.42, 6, 14), 0, 1.25, 0);
  add(new THREE.CapsuleGeometry(0.068, 0.72, 4, 10), -0.09, 0.47, 0);
  add(new THREE.CapsuleGeometry(0.068, 0.72, 4, 10), 0.09, 0.47, 0);
  add(new THREE.CapsuleGeometry(0.05, 0.56, 4, 10), -0.25, 1.17, 0, -0.12);
  add(new THREE.CapsuleGeometry(0.05, 0.56, 4, 10), 0.25, 1.17, 0, 0.12);
  person.position.set(-1.6, yLow + 0.35, zFront);
  person.rotation.y = 0.5;
  group.add(person);
  const personLabel = document.createElement('div');
  personLabel.className = 'dim-label dim-label--person';
  const personTag = new CSS2DObject(personLabel);
  personTag.position.set(0, 2.15, 0);
  person.add(personTag);
  labels.push({ el: personLabel, key: 'dims.person', value: null });

  /** Etiket metinlerini geçerli dile göre yazar. */
  function setText(t, formatNumber) {
    for (const { el, key, value } of labels) {
      el.textContent = value == null ? t(key) : t(key, { v: formatNumber(value, { maximumFractionDigits: 1 }) });
    }
  }

  return {
    group,
    setText,
    setVisible(on) { group.visible = on; },
    get visible() { return group.visible; },
  };
}
