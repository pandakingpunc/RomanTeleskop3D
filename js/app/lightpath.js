// Işık yolu görselleştirmesi: yıldız ışığının birincil aynadan aletlere kadar izlediği yol.
// Işın demetleri yarı saydam koniler, fotonlar ise parlayan noktalar olarak çizilir.
// Adım (1..5) arttıkça yolun bir sonraki bölümü görünür olur.
import * as THREE from 'three';
import { DIMS } from './model.js';
import { createGlowTexture } from './textures.js';

const CYAN = new THREE.Color(0x56d3ff);
const AMBER = new THREE.Color(0xffc53d);
const WHITE = new THREE.Color(0xdff6ff);

function beamMaterial(color, opacity) {
  return new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    userData: { target: opacity },
  });
}

/** İki nokta arasında X'ten bağımsız yönlü silindir/koni. */
function segmentMesh(a, b, rA, rB, material, radial = 48) {
  const dir = new THREE.Vector3().subVectors(b, a);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(rB, rA, len, radial, 1, true);
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  mesh.renderOrder = 5;
  return mesh;
}

export function createLightPath({ model }) {
  const group = new THREE.Group();
  group.name = 'light-path';
  group.visible = false;
  model.root.add(group);

  const { radius: R, sag, x: xp } = DIMS.primary;
  const xs = DIMS.secondary.x + 0.035;
  const rs = DIMS.secondary.radius * 0.95;
  const xStart = DIMS.barrel.front - 4.2;
  const rOut = R * 0.96;
  const rIn = 0.34;

  model.root.updateMatrixWorld(true);
  const P = (name) => model.root.worldToLocal(model.anchors[name].getWorldPosition(new THREE.Vector3()));
  const focus = P('focus');
  const wfiPath = [P('tertiary'), P('fold'), P('wfiEntry'), P('wfiWheel'), P('detector')];
  const cgiPath = [P('cgiPickoff'), P('cgiEntry'), P('dm1'), P('dm2'), P('cgiMask'), P('cgiCamera')];
  // Aşama sınırları (alet kollarında): 4. adım girişe kadar, 5. adım sona kadar
  const wfiStage4 = 3; // focus->tertiary->fold->entry
  const cgiStage4 = 2; // focus->pickoff->entry

  // --- Işın demetleri (her aşama için ayrı malzeme, böylece sırayla belirebilir)
  const stageMaterials = [[], [], [], [], []];
  const addBeam = (stage, mesh) => {
    stageMaterials[stage].push(mesh.material);
    group.add(mesh);
  };
  const xPrim = xp - sag * 0.9;
  // 1: Gelen paralel ışık (halka biçimli: ortası ikincil aynanın gölgesi)
  addBeam(0, segmentMesh(new THREE.Vector3(xStart, 0, 0), new THREE.Vector3(xPrim, 0, 0), rOut, rOut, beamMaterial(CYAN, 0.045)));
  addBeam(0, segmentMesh(new THREE.Vector3(xStart, 0, 0), new THREE.Vector3(xPrim, 0, 0), rIn, rIn, beamMaterial(CYAN, 0.02)));
  // 2: Birincil -> ikincil (yakınsayan koni)
  addBeam(1, segmentMesh(new THREE.Vector3(xPrim, 0, 0), new THREE.Vector3(xs, 0, 0), rOut, rs, beamMaterial(CYAN, 0.12)));
  // 3: İkincil -> odak (birincil aynanın deliğinden geçer)
  addBeam(2, segmentMesh(new THREE.Vector3(xs, 0, 0), focus, rs, 0.015, beamMaterial(CYAN, 0.2)));
  // 4 ve 5: Alet kolları (ince tüpler)
  // Alet kolları yapıların arkasında kalmasın diye derinlik testi olmadan (röntgen gibi) çizilir
  const tube = (stage, a, b, color, r = 0.045) => {
    const mesh = segmentMesh(a, b, r, r, beamMaterial(color, 0.55), 12);
    mesh.material.depthTest = false;
    mesh.renderOrder = 7;
    addBeam(stage, mesh);
  };
  [focus, ...wfiPath].forEach((p, i, arr) => {
    if (i < arr.length - 1) tube(i < wfiStage4 ? 3 : 4, p, arr[i + 1], CYAN);
  });
  [focus, ...cgiPath].forEach((p, i, arr) => {
    if (i < arr.length - 1) tube(i < cgiStage4 ? 3 : 4, p, arr[i + 1], AMBER, 0.022);
  });

  // --- Fotonlar
  const COUNT = 200;
  const photons = [];
  const tmp = new THREE.Vector3();
  for (let i = 0; i < COUNT; i++) {
    const cgi = i % 4 === 0;
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(rIn * rIn + Math.random() * (rOut * rOut - rIn * rIn));
    const y = Math.sin(angle) * r;
    const z = Math.cos(angle) * r;
    const k = rs / R;
    const points = [
      new THREE.Vector3(xStart, y, z),
      new THREE.Vector3(xp - (sag * r * r) / (R * R), y, z),
      new THREE.Vector3(xs, y * k, z * k),
      focus.clone(),
      ...(cgi ? cgiPath : wfiPath).map((p) => p.clone()),
    ];
    const cumulative = [0];
    for (let s = 1; s < points.length; s++) cumulative.push(cumulative[s - 1] + points[s].distanceTo(points[s - 1]));
    // Her adımın bittiği nokta indeksi
    const branch4 = 3 + (cgi ? cgiStage4 : wfiStage4);
    const stageEnds = [1, 2, 3, branch4, points.length - 1];
    photons.push({ points, cumulative, stageEnds, cgi, phase: Math.random(), speed: 0.85 + Math.random() * 0.3 });
  }
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 4);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({
    size: 0.16,
    map: createGlowTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)', 64),
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
    color: new THREE.Color(2.2, 2.2, 2.2),
  }));
  points.frustumCulled = false;
  points.renderOrder = 8;
  group.add(points);

  let active = false;
  let step = 1;
  let time = 0;
  let fade = 0; // genel görünürlük

  function setActive(on) {
    active = on;
    if (on) group.visible = true;
  }

  function setStep(n) {
    step = THREE.MathUtils.clamp(n, 1, 5);
  }

  const SPEED = 2.6; // m/s (görsel)

  function update(dt) {
    if (!group.visible) return false;
    fade += ((active ? 1 : 0) - fade) * Math.min(1, dt * 4);
    if (!active && fade < 0.01) {
      fade = 0;
      group.visible = false;
      return true;
    }
    time += dt;
    // Demet saydamlıkları: görünen aşamalar hedef değere, diğerleri sıfıra
    stageMaterials.forEach((list, i) => {
      for (const material of list) {
        const target = i < step ? material.userData.target * fade : 0;
        material.opacity += (target - material.opacity) * Math.min(1, dt * 3);
      }
    });
    for (let i = 0; i < COUNT; i++) {
      const p = photons[i];
      const endIndex = p.stageEnds[step - 1];
      const total = p.cumulative[endIndex];
      const travelled = ((p.phase * total + time * SPEED * p.speed) % total + total) % total;
      let s = 1;
      while (s < endIndex && p.cumulative[s] < travelled) s++;
      const segStart = p.cumulative[s - 1];
      const segLen = p.cumulative[s] - segStart || 1;
      tmp.lerpVectors(p.points[s - 1], p.points[s], (travelled - segStart) / segLen);
      positions[i * 3] = tmp.x;
      positions[i * 3 + 1] = tmp.y;
      positions[i * 3 + 2] = tmp.z;
      const split = s > 3;
      const c = split ? (p.cgi ? AMBER : CYAN) : s > 1 ? CYAN : WHITE;
      // Yolun başında ve sonunda yumuşak belirme/sönme
      const u = travelled / total;
      const edge = Math.min(1, u * 12, (1 - u) * 10);
      const a = edge * fade * (split && p.cgi ? 1 : 0.9);
      colors[i * 4] = c.r;
      colors[i * 4 + 1] = c.g;
      colors[i * 4 + 2] = c.b;
      colors[i * 4 + 3] = a;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    return true;
  }

  return {
    group,
    setActive,
    setStep,
    update,
    get active() { return active; },
    get step() { return step; },
  };
}
