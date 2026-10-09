// Roman Uzay Teleskobu'nun şematik 3D modeli.
// Ölçüler metre cinsindendir; NASA'nın basın kiti, mühendislik makaleleri ve 3D baskı
// modelinden yaklaşık olarak türetilmiştir (açılmış uzunluk ≈ 12,7 m).
// Eksenler: X = optik eksen (açıklık -X yönünde), Y = Güneş'e bakan taraf
// (güneş paneli kalkanı), Z = Geniş Alan Aleti tarafı.
import * as THREE from 'three';

const SQRT3 = Math.sqrt(3);

export const DIMS = {
  // Dış tüp: düz yüzleri Güneş'e ve karşı tarafa bakan altıgen (köşeden köşeye ≈ 4,1 m)
  barrel: { side: 2.05, front: -4.75, back: -0.1, aperture: 1.5 },
  stilts: { back: 1.5 },
  dac: { length: 3.6, width: 3.0, chamfer: 0.8 },
  primary: { x: -0.55, radius: 1.2, hole: 0.3, thickness: 0.26, sag: 0.12 },
  secondary: { x: -3.05, radius: 0.29 },
  // Gövde: altıgen, köşeden köşeye ≈ 4,3 m, derinlik ≈ 2 m
  bus: { side: 2.15, front: 1.5, back: 3.5 },
  comms: { back: 3.85 },
  // Güneş paneli kalkanı: 3 x 2 panel, her biri ≈ 2,1 m x 3 m
  sass: { front: -4.6, back: 1.4, panelWidth: 2.1, gap: 0.18, thickness: 0.05 },
  liss: { front: 1.52, back: 3.62 },
  antenna: { dish: 1.7, boom: 1.75 },
};

/** Açılmış ve katlı durumdaki yaklaşık dış ölçüler (boyut çizgileri için). */
export const ENVELOPE = {
  length: 12.7,
  width: 6.3,
  stowedLength: 8.5,
  stowedWidth: 4.5,
};

const UP = new THREE.Vector3(0, 1, 0);
const smooth = (a, b, t) => {
  const x = THREE.MathUtils.clamp((t - a) / (b - a), 0, 1);
  return x * x * (3 - 2 * x);
};

/** Düzgün çokgen köşeleri (z, y). start=0 iken köşe +Z yönündedir. */
export function polygonPoints(sides, radius, start = 0) {
  const points = [];
  for (let k = 0; k < sides; k++) {
    const a = start + (k * Math.PI * 2) / sides;
    points.push(new THREE.Vector2(radius * Math.cos(a), radius * Math.sin(a)));
  }
  return points;
}

/** Düz üst yüzlü altıgen (köşeler ±Z'de). */
const hexagon = (side) => polygonPoints(6, side, 0);

/**
 * X ekseni boyunca uzanan düz yüzlü prizma. Kesit noktaları (z, y) biçimindedir.
 * UV'ler metre cinsindendir; böylece folyo dokusu her parçada aynı ölçekte görünür.
 */
function prismGeometry(points, x0, x1, { caps = false, faces, uvScale = 0.7 } = {}) {
  const pos = [];
  const nor = [];
  const uv = [];
  const n = points.length;
  const centroid = points.reduce((acc, p) => acc.add(p), new THREE.Vector2()).multiplyScalar(1 / n);
  let perimeter = 0;
  const e1 = new THREE.Vector3();
  const e2 = new THREE.Vector3();
  const gn = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    const len = a.distanceTo(b);
    if (!faces || faces.includes(i)) {
      const mid = a.clone().add(b).multiplyScalar(0.5).sub(centroid);
      const edge = b.clone().sub(a).normalize();
      const out = mid.clone().sub(edge.clone().multiplyScalar(mid.dot(edge))).normalize();
      const normal = new THREE.Vector3(0, out.y, out.x);
      const quad = [
        [x0, a, perimeter],
        [x1, a, perimeter],
        [x1, b, perimeter + len],
        [x0, b, perimeter + len],
      ].map(([x, p, s]) => ({ p: new THREE.Vector3(x, p.y, p.x), uv: [x * uvScale, s * uvScale] }));
      e1.subVectors(quad[1].p, quad[0].p);
      e2.subVectors(quad[2].p, quad[0].p);
      gn.crossVectors(e1, e2);
      const tri = gn.dot(normal) < 0 ? [0, 2, 1, 0, 3, 2] : [0, 1, 2, 0, 2, 3];
      for (const k of tri) {
        pos.push(quad[k].p.x, quad[k].p.y, quad[k].p.z);
        nor.push(normal.x, normal.y, normal.z);
        uv.push(...quad[k].uv);
      }
    }
    perimeter += len;
  }
  if (caps) {
    for (const [x, sign] of [[x0, -1], [x1, 1]]) {
      for (let i = 0; i < n; i++) {
        const verts = [centroid, points[i], points[(i + 1) % n]].map((p) => new THREE.Vector3(x, p.y, p.x));
        e1.subVectors(verts[1], verts[0]);
        e2.subVectors(verts[2], verts[0]);
        gn.crossVectors(e1, e2);
        const order = gn.x * sign >= 0 ? [0, 1, 2] : [0, 2, 1];
        for (const k of order) {
          pos.push(verts[k].x, verts[k].y, verts[k].z);
          nor.push(sign, 0, 0);
          uv.push(verts[k].z * uvScale, verts[k].y * uvScale);
        }
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return geometry;
}

/**
 * Yarım altıgen çerçeve (ortasında yuvarlak açıklık), X'e dik düzlemde.
 * upper=true üst yarıyı, false alt yarıyı üretir. Şekil Z'ye göre simetrik olduğundan
 * döndürme sonrası aynalanma sorun olmaz.
 */
function hexFrameHalf(side, holeRadius, depth, upper) {
  const pts = hexagon(side);
  const shape = new THREE.Shape();
  shape.moveTo(pts[0].x, 0);
  if (upper) [1, 2].forEach((k) => shape.lineTo(pts[k].x, pts[k].y));
  else [5, 4].forEach((k) => shape.lineTo(pts[k].x, pts[k].y));
  shape.lineTo(pts[3].x, 0);
  shape.lineTo(-holeRadius, 0);
  shape.absarc(0, 0, holeRadius, Math.PI, upper ? 0 : Math.PI * 2, upper);
  shape.lineTo(pts[0].x, 0);
  const geometry = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 28 });
  geometry.rotateY(Math.PI / 2);
  return geometry;
}

/** X ekseni boyunca uzanan silindir. */
function cylinderX(rTop, rBottom, length, segments = 32, open = false) {
  return new THREE.CylinderGeometry(rTop, rBottom, length, segments, 1, open).rotateZ(-Math.PI / 2);
}

export function buildObservatory(materials) {
  const root = new THREE.Group();
  root.name = 'observatory';
  const parts = new Map();
  const shells = [];
  const explodeGroups = [];
  const anchors = {};
  const rig = {};

  const S = DIMS.barrel.side;
  const TOP = (S * SQRT3) / 2; // dış tüpün üst yüz yüksekliği
  const xf = DIMS.barrel.front;
  const xb = DIMS.barrel.back;

  function entry(id) {
    let p = parts.get(id);
    if (!p) {
      p = { id, meshes: [], hotspot: null };
      parts.set(id, p);
    }
    return p;
  }

  /** Parçaya ait bir ağ (mesh) ekler. matKey tek anahtar ya da malzeme grubu dizisi olabilir. */
  function mesh(parent, geometry, partId, matKey, opts = {}) {
    const { shell = false, cast = true, receive = true, side, edges = true } = opts;
    const resolvedSide = side ?? (shell ? THREE.DoubleSide : undefined);
    const material = Array.isArray(matKey)
      ? matKey.map((key) => materials.get(partId, key, { shell, side: resolvedSide }))
      : materials.get(partId, matKey, { shell, side: resolvedSide });
    const m = new THREE.Mesh(geometry, material);
    m.castShadow = cast;
    m.receiveShadow = receive;
    m.userData.partId = partId;
    m.userData.shell = shell;
    m.userData.edges = shell && edges;
    parent.add(m);
    entry(partId).meshes.push(m);
    if (shell) shells.push(m);
    return m;
  }

  function group(parent, name, offset) {
    const g = new THREE.Group();
    g.name = name;
    parent.add(g);
    if (offset) {
      g.userData.offset = new THREE.Vector3(...offset);
      g.userData.base = g.position.clone();
      explodeGroups.push(g);
    }
    return g;
  }

  function hotspot(partId, parent, position) {
    const o = new THREE.Object3D();
    o.position.set(...position);
    parent.add(o);
    entry(partId).hotspot = o;
    return o;
  }

  function anchor(name, parent, position) {
    const o = new THREE.Object3D();
    o.position.set(...position);
    parent.add(o);
    anchors[name] = o;
    return o;
  }

  function strut(parent, a, b, radius, partId, matKey, opts) {
    const A = new THREE.Vector3(...a);
    const B = new THREE.Vector3(...b);
    const dir = B.clone().sub(A);
    const len = dir.length();
    const m = mesh(parent, new THREE.CylinderGeometry(radius, radius, len, 8, 1), partId, matKey, opts);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(UP, dir.normalize());
    return m;
  }

  /* ------------------------------------------------------------------
     DIŞ TÜP (Outer Barrel Assembly) — patlatmada iki yarıya ayrılır
     ------------------------------------------------------------------ */
  const barrelTop = group(root, 'barrel-top', [-0.3, 2.9, 0]);
  const barrelBottom = group(root, 'barrel-bottom', [-0.3, -3.1, 0]);
  {
    const hex = hexagon(S);
    const halves = [
      { g: barrelTop, faces: [0, 1, 2], upper: true },
      { g: barrelBottom, faces: [3, 4, 5], upper: false },
    ];
    for (const { g, faces, upper } of halves) {
      const wall = prismGeometry(hex, xf, xb, { faces });
      mesh(g, wall, 'barrel', 'mli', { shell: true, side: THREE.FrontSide });
      mesh(g, wall, 'barrel', 'absorber', { shell: true, side: THREE.BackSide, cast: false });
      // Ön yüz: yuvarlak açıklıklı altıgen çerçeve
      const front = mesh(g, hexFrameHalf(S + 0.04, DIMS.barrel.aperture, 0.08, upper), 'barrel', 'aluminum', { shell: true });
      front.position.x = xf - 0.04;
      const rear = mesh(g, hexFrameHalf(S + 0.02, DIMS.primary.radius + 0.28, 0.06, upper), 'barrel', 'composite', { shell: true });
      rear.position.x = xb - 0.06;
      // Folyo dikiş bantları
      for (const x of [xf + 1.5, xf + 3.05]) {
        mesh(g, prismGeometry(hexagon(S + 0.025), x - 0.05, x + 0.05, { faces }), 'barrel', 'mliDark', { shell: true });
      }
      // İç perdeler: eğik gelen başıboş ışığı tuzaklar (gerçekte 10 adet)
      for (const x of [xf + 0.35, xf + 0.75, xf + 1.15, xf + 1.55]) {
        const vane = mesh(g, hexFrameHalf(S - 0.03, 1.38, 0.025, upper), 'barrel', 'absorber', { cast: false });
        vane.position.x = x;
      }
    }
    hotspot('barrel', barrelTop, [-2.6, TOP * 0.5 + 0.05, S * 0.75 + 0.03]);
  }

  /* ------------------------------------------------------------------
     DİKMELER ("sütunlar üstündeki ev"): üst tüpü gövdeye bağlar
     ------------------------------------------------------------------ */
  const stiltGroup = group(root, 'stilts', [0.15, 0, 0]);
  {
    const top = hexagon(S - 0.05);
    const bottom = hexagon(DIMS.bus.side - 0.1);
    const x1 = DIMS.stilts.back;
    for (let i = 0; i < 6; i++) {
      const a = top[i];
      const b = bottom[i];
      const c = bottom[(i + 1) % 6];
      const cut = { shell: true, edges: false };
      strut(stiltGroup, [xb, a.y, a.x], [x1, b.y, b.x], 0.055, 'barrel', 'composite', cut);
      strut(stiltGroup, [xb, a.y, a.x], [x1, (b.y + c.y) / 2, (b.x + c.x) / 2], 0.04, 'barrel', 'composite', cut);
      strut(stiltGroup, [xb, top[(i + 1) % 6].y, top[(i + 1) % 6].x], [x1, (b.y + c.y) / 2, (b.x + c.x) / 2], 0.04, 'barrel', 'composite', cut);
    }
  }

  /* ------------------------------------------------------------------
     AÇILIR AÇIKLIK KAPAĞI (Deployable Aperture Cover) — yumuşak siperlik
     ------------------------------------------------------------------ */
  const dacGroup = group(root, 'dac', [-1.4, 3.3, 0]);
  {
    const { length: L, width: W, chamfer: c } = DIMS.dac;
    const hinge = new THREE.Group();
    hinge.position.set(xf, TOP + 0.05, 0);
    dacGroup.add(hinge);
    rig.dacHinge = hinge;
    const shape = new THREE.Shape();
    shape.moveTo(0, -W / 2);
    shape.lineTo(-(L - c), -W / 2);
    shape.lineTo(-L, -W / 2 + c);
    shape.lineTo(-L, W / 2 - c);
    shape.lineTo(-(L - c), W / 2);
    shape.lineTo(0, W / 2);
    shape.closePath();
    // Güneş'e bakan yüz gümüş, açıklığa bakan yüz siyah (iki katmanlı battaniye)
    const outer = new THREE.ShapeGeometry(shape);
    outer.rotateX(Math.PI / 2);
    const outerMesh = mesh(hinge, outer, 'dac', 'mli', { shell: true, side: THREE.BackSide });
    outerMesh.position.y = 0.03;
    const inner = new THREE.ShapeGeometry(shape);
    inner.rotateX(Math.PI / 2);
    mesh(hinge, inner, 'dac', 'absorber', { shell: true, side: THREE.FrontSide, cast: false });
    // Üç yaylı bom (biri ortada, ikisi kenarlarda)
    for (const z of [-W / 2 + 0.04, 0, W / 2 - 0.04]) {
      const len = z === 0 ? L - 0.05 : L - c;
      const boom = mesh(hinge, cylinderX(0.03, 0.03, len, 10), 'dac', 'aluminum');
      boom.position.set(-len / 2, 0.05, z);
    }
    rig.dacFlaps = [];
    for (const side of [-1, 1]) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(18), 3));
      geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 2], 2));
      geo.addGroup(0, 3, 0);
      geo.addGroup(3, 3, 1);
      const flap = mesh(dacGroup, geo, 'dac', ['mli', 'absorber'], { shell: true, side: THREE.FrontSide });
      rig.dacFlaps.push({ flap, side, geo });
    }
    const tip = new THREE.Object3D();
    tip.position.set(-(L - c), 0, 0);
    hinge.add(tip);
    rig.dacTip = tip;
    hotspot('dac', hinge, [-L * 0.5, 0.1, 0]);
  }

  /* ------------------------------------------------------------------
     BİRİNCİL AYNA ve taşıyıcı halkası
     ------------------------------------------------------------------ */
  const primaryGroup = group(root, 'primary', [0, 0, 0]);
  {
    const { x, radius, hole, thickness, sag } = DIMS.primary;
    // Profil (r, h): ön yüzey h = -sag·r²/R² (kenarlar ışığa doğru kıvrılır = içbükey), arka yüz h = kalınlık
    const profile = [];
    const steps = 28;
    for (let i = 0; i <= steps; i++) {
      const r = hole + ((radius - hole) * i) / steps;
      profile.push(new THREE.Vector2(r, (-sag * r * r) / (radius * radius)));
    }
    profile.push(new THREE.Vector2(radius, thickness));
    profile.push(new THREE.Vector2(hole, thickness));
    profile.push(profile[0].clone());
    const mirrorGeo = new THREE.LatheGeometry(profile, 96);
    mirrorGeo.rotateZ(-Math.PI / 2); // dönme ekseni +Y -> +X
    const mirror = mesh(primaryGroup, mirrorGeo, 'primary', 'mirror', { side: THREE.DoubleSide });
    mirror.position.x = x;
    const back = mesh(primaryGroup, cylinderX(radius * 0.97, radius * 0.88, 0.24, 64), 'primary', 'mirrorBack');
    back.position.x = x + thickness + 0.12;
    const ring = mesh(primaryGroup, cylinderX(radius + 0.2, radius + 0.2, 0.46, 64, true), 'primary', 'mli', { side: THREE.DoubleSide });
    ring.position.x = x + 0.14;
    const lip = mesh(primaryGroup, new THREE.RingGeometry(radius + 0.02, radius + 0.2, 64).rotateY(-Math.PI / 2), 'primary', 'aluminum', { side: THREE.DoubleSide });
    lip.position.x = x - 0.09;
    // Merkezi bafıl: ikincil aynadan dönen ışık bunun içinden geçer
    const baffle = mesh(primaryGroup, cylinderX(hole - 0.03, hole, 1.0, 40, true), 'primary', 'absorber', { side: THREE.DoubleSide });
    baffle.position.x = x - 0.42;
    anchor('primary', primaryGroup, [x + 0.04, 0, 0]);
    hotspot('primary', primaryGroup, [x - 0.02, 0.8, 0.3]);
  }

  /* ------------------------------------------------------------------
     İKİNCİL AYNA ve onu taşıyan altı çubuk
     ------------------------------------------------------------------ */
  const secondaryGroup = group(root, 'secondary', [-1.5, 0, 0]);
  {
    const xs = DIMS.secondary.x;
    const r = DIMS.secondary.radius;
    const hub = mesh(secondaryGroup, cylinderX(r + 0.08, r + 0.05, 0.42, 40), 'secondary', 'mliDark');
    hub.position.x = xs - 0.22;
    const cap = mesh(secondaryGroup, cylinderX(0.12, r + 0.08, 0.14, 40), 'secondary', 'composite');
    cap.position.x = xs - 0.5;
    const sm = mesh(secondaryGroup, cylinderX(r, r, 0.05, 48), 'secondary', 'mirror');
    sm.position.x = xs + 0.01;
    // Altı ayaklı (hekzapod) odak ayar mekanizması
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      strut(secondaryGroup, [xs - 0.46, Math.cos(a) * 0.2, Math.sin(a) * 0.2], [xs - 0.3, Math.cos(a + 0.5) * 0.31, Math.sin(a + 0.5) * 0.31], 0.012, 'secondary', 'titanium');
    }
    // Ölçüm yapısı: 3 çift çubuk (görüntülerdeki 6 kollu kırınım izlerinin kaynağı)
    const xp = DIMS.primary.x - 0.06;
    const rr = DIMS.primary.radius + 0.13;
    for (let k = 0; k < 3; k++) {
      const a = Math.PI / 2 + (k * Math.PI * 2) / 3;
      const hubPoint = [xs - 0.1, Math.cos(a) * (r + 0.08), Math.sin(a) * (r + 0.08)];
      for (const d of [-0.42, 0.42]) {
        strut(secondaryGroup, hubPoint, [xp, Math.cos(a + d) * rr, Math.sin(a + d) * rr], 0.032, 'secondary', 'composite');
      }
    }
    anchor('secondary', secondaryGroup, [xs + 0.04, 0, 0]);
    hotspot('secondary', secondaryGroup, [xs - 0.25, r + 0.22, 0]);
  }

  /* ------------------------------------------------------------------
     ALET TAŞIYICI (Instrument Carrier), arka optik modül, yıldız izleyiciler
     ------------------------------------------------------------------ */
  const carrierGroup = group(root, 'carrier', [0.25, 0, 0]);
  {
    const x0 = DIMS.primary.x + DIMS.primary.thickness + 0.42;
    const x1 = DIMS.stilts.back;
    const pts = hexagon(1.45);
    const cut = { shell: true, edges: false };
    for (const x of [x0, x1 - 0.04]) {
      for (let i = 0; i < 6; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % 6];
        strut(carrierGroup, [x, a.y, a.x], [x, b.y, b.x], 0.05, 'carrier', 'composite', cut);
      }
    }
    for (let i = 0; i < 6; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % 6];
      strut(carrierGroup, [x0, a.y, a.x], [x1, a.y, a.x], 0.045, 'carrier', 'composite', cut);
      strut(carrierGroup, [x0, a.y, a.x], [x1, b.y, b.x], 0.03, 'carrier', 'titanium', cut);
    }
    // Teleskop arayüz plakası
    const plate = mesh(carrierGroup, cylinderX(1.32, 1.32, 0.06, 6), 'carrier', 'structure');
    plate.position.x = x0 - 0.02;
    hotspot('carrier', carrierGroup, [x1 - 0.2, 0.72, 1.2]);

    // Yıldız izleyiciler (3 adet, ESA katkısı)
    for (const [y, z, rx] of [[-1.1, -0.55, 0.5], [-1.15, 0.2, -0.2], [-0.85, -1.0, 0.9]]) {
      const tracker = new THREE.Group();
      tracker.position.set(x0 + 0.45, y, z);
      tracker.rotation.x = Math.PI + rx;
      carrierGroup.add(tracker);
      const body = mesh(tracker, new THREE.BoxGeometry(0.18, 0.16, 0.18), 'carrier', 'blackPaint');
      body.position.y = 0.08;
      const hood = mesh(tracker, new THREE.CylinderGeometry(0.12, 0.07, 0.28, 20, 1, true), 'carrier', 'aluminum', { side: THREE.DoubleSide });
      hood.position.y = 0.3;
    }

    // Arka Optik Modül: üçüncül ayna + katlama aynaları (üç aynalı anastigmat)
    const aom = new THREE.Group();
    aom.position.set(x0 + 0.3, 0, 0);
    carrierGroup.add(aom);
    const bench = mesh(aom, new THREE.BoxGeometry(0.7, 0.05, 0.9), 'aft_optics', 'aluminum');
    bench.position.y = -0.3;
    const tertiary = mesh(aom, new THREE.CylinderGeometry(0.22, 0.22, 0.06, 40), 'aft_optics', 'mirror');
    tertiary.rotation.set(0, 0, Math.PI / 2 - 0.35);
    tertiary.position.set(0.25, -0.05, 0);
    const tertiaryBack = mesh(aom, new THREE.CylinderGeometry(0.24, 0.24, 0.08, 40), 'aft_optics', 'composite');
    tertiaryBack.rotation.copy(tertiary.rotation);
    tertiaryBack.position.set(0.31, -0.07, 0);
    const fold1 = mesh(aom, new THREE.BoxGeometry(0.03, 0.2, 0.26), 'aft_optics', 'mirror');
    fold1.rotation.y = Math.PI / 4;
    fold1.position.set(-0.12, -0.12, 0.1);
    const pick = mesh(aom, new THREE.BoxGeometry(0.03, 0.14, 0.18), 'aft_optics', 'mirror');
    pick.rotation.y = -Math.PI / 4;
    pick.position.set(-0.12, 0.12, -0.18);
    for (const [px, pz] of [[0.25, 0], [-0.12, 0.1], [-0.12, -0.18]]) {
      const post = mesh(aom, new THREE.CylinderGeometry(0.018, 0.018, 0.26, 8), 'aft_optics', 'titanium');
      post.position.set(px, -0.17, pz);
    }
    anchor('focus', aom, [-0.3, 0, 0]);
    anchor('tertiary', aom, [0.22, -0.05, 0]);
    anchor('fold', aom, [-0.12, -0.12, 0.1]);
    anchor('cgiPickoff', aom, [-0.12, 0.12, -0.18]);
    hotspot('aft_optics', aom, [0.05, 0.25, 0.35]);
  }

  /* ------------------------------------------------------------------
     GENİŞ ALAN ALETİ (WFI)
     ------------------------------------------------------------------ */
  const wfiGroup = group(root, 'wfi', [0.3, -1.8, 2.5]);
  {
    const cx = 0.72;
    const cy = -0.25;
    const cz = 1.45;
    const box = mesh(wfiGroup, new THREE.BoxGeometry(1.42, 1.3, 1.0), 'wfi', 'mliDark', { shell: true });
    box.position.set(cx, cy, cz);
    // Büyük mavi radyatör: dedektörlerin ısısını uzaya atar (Güneş'ten uzağa eğik)
    const radiator = new THREE.Group();
    radiator.position.set(cx, cy - 0.05, cz + 0.62);
    radiator.rotation.x = 0.32;
    wfiGroup.add(radiator);
    mesh(radiator, new THREE.BoxGeometry(1.75, 1.7, 0.05), 'wfi', 'radiatorBlue', { shell: true });
    for (const y of [-0.87, 0.87]) {
      const rail = mesh(radiator, new THREE.BoxGeometry(1.8, 0.05, 0.08), 'wfi', 'aluminum', { shell: true });
      rail.position.y = y;
    }
    const port = mesh(wfiGroup, new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32), 'wfi', 'blackPaint');
    port.rotation.x = Math.PI / 2;
    port.position.set(cx - 0.35, 0.05, cz - 0.52);
    anchor('wfiEntry', wfiGroup, [cx - 0.35, 0.05, cz - 0.55]);
    hotspot('wfi', radiator, [0.25, 0.35, 0.05]);

    // Eleman tekerleği: 8 filtre, grizm, prizma ve karanlık konum
    const wheel = new THREE.Group();
    wheel.position.set(cx - 0.05, 0.05, cz - 0.1);
    wheel.rotation.z = Math.PI / 2;
    wfiGroup.add(wheel);
    mesh(wheel, new THREE.CylinderGeometry(0.36, 0.36, 0.035, 48), 'wfi_wheel', 'structure');
    const wheelHub = mesh(wheel, new THREE.CylinderGeometry(0.08, 0.08, 0.09, 24), 'wfi_wheel', 'titanium');
    wheelHub.position.y = 0.02;
    const slots = [0x5f7bff, 0x4aa6ff, 0x47d3d6, 0x6fda6a, 0xd9d256, 0xf0a14e, 0xe2654f, 0xb85ac8, 0xdfe7ff, 0x9ad6ff, 0x24272e, 0xc7cede];
    slots.forEach((color, i) => {
      const a = (i / slots.length) * Math.PI * 2;
      const f = mesh(wheel, new THREE.CylinderGeometry(0.072, 0.072, 0.045, 24), 'wfi_wheel', `filter${i}`);
      f.material.color.setHex(color);
      f.position.set(Math.cos(a) * 0.255, 0.008, Math.sin(a) * 0.255);
    });
    rig.wfiWheel = wheel;
    anchor('wfiWheel', wfiGroup, [cx - 0.05, 0.05 + 0.255, cz - 0.1]);
    hotspot('wfi_wheel', wfiGroup, [cx - 0.05, 0.47, cz - 0.1]);

    // Dedektör mozaiği: 18 adet H4RG-10, kavisli 6 x 3 düzen
    const fp = new THREE.Group();
    fp.position.set(cx + 0.42, 0.1, cz - 0.05);
    fp.rotation.y = -Math.PI / 2;
    wfiGroup.add(fp);
    const plate = mesh(fp, new THREE.BoxGeometry(0.74, 0.42, 0.05), 'wfi_detector', 'aluminum');
    plate.position.z = -0.035;
    const chip = 0.09;
    const colOffsets = [-0.03, 0.0, 0.02, 0.02, 0.0, -0.03];
    for (let c = 0; c < 6; c++) {
      for (let r = 0; r < 3; r++) {
        const d = mesh(fp, new THREE.BoxGeometry(chip, chip, 0.012), 'wfi_detector', 'detector', { cast: false });
        d.position.set((c - 2.5) * (chip + 0.016), (r - 1) * (chip + 0.016) + colOffsets[c], 0);
      }
    }
    anchor('detector', fp, [0, 0, 0.02]);
    hotspot('wfi_detector', fp, [0, 0.27, 0.02]);
  }

  /* ------------------------------------------------------------------
     KORONAGRAF ALETİ (CGI)
     ------------------------------------------------------------------ */
  const cgiGroup = group(root, 'cgi', [0.3, -1.8, -2.5]);
  {
    const cx = 0.72;
    const cy = -0.45;
    const cz = -1.45;
    const box = mesh(cgiGroup, new THREE.BoxGeometry(1.42, 0.72, 0.95), 'cgi', 'mli', { shell: true });
    box.position.set(cx, cy, cz);
    const lid = mesh(cgiGroup, new THREE.BoxGeometry(1.2, 0.035, 0.8), 'cgi', 'radiator', { shell: true });
    lid.position.set(cx, cy - 0.38, cz);
    const port = mesh(cgiGroup, new THREE.CylinderGeometry(0.11, 0.11, 0.1, 24), 'cgi', 'blackPaint');
    port.rotation.x = Math.PI / 2;
    port.position.set(cx - 0.45, cy + 0.15, cz + 0.5);
    anchor('cgiEntry', cgiGroup, [cx - 0.45, cy + 0.15, cz + 0.52]);
    hotspot('cgi', cgiGroup, [cx + 0.2, cy + 0.38, cz - 0.15]);

    const bench = mesh(cgiGroup, new THREE.BoxGeometry(1.25, 0.04, 0.78), 'cgi_bench', 'aluminum');
    bench.position.set(cx, cy - 0.28, cz);
    const lens = (x, z, r) => {
      const l = mesh(cgiGroup, cylinderX(r, r, 0.03, 24), 'cgi_bench', 'lens');
      l.position.set(x, cy - 0.1, z);
      const post = mesh(cgiGroup, new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8), 'cgi_bench', 'titanium');
      post.position.set(x, cy - 0.19, z);
      return l;
    };
    lens(cx + 0.05, cz + 0.05, 0.05);
    lens(cx + 0.25, cz - 0.05, 0.05);
    lens(cx + 0.42, cz + 0.1, 0.045);
    const cam = mesh(cgiGroup, new THREE.BoxGeometry(0.2, 0.2, 0.2), 'cgi_bench', 'emccd');
    cam.position.set(cx + 0.52, cy - 0.15, cz - 0.2);
    const camBarrel = mesh(cgiGroup, cylinderX(0.05, 0.05, 0.12, 16), 'cgi_bench', 'blackPaint');
    camBarrel.position.set(cx + 0.38, cy - 0.15, cz - 0.2);
    anchor('cgiMask', cgiGroup, [cx + 0.25, cy - 0.1, cz - 0.05]);
    anchor('cgiCamera', cgiGroup, [cx + 0.4, cy - 0.15, cz - 0.2]);
    hotspot('cgi_bench', cgiGroup, [cx + 0.35, cy - 0.02, cz + 0.22]);

    const dm = (x, z, rotY) => {
      const holder = new THREE.Group();
      holder.position.set(x, cy - 0.08, z);
      holder.rotation.y = rotY;
      cgiGroup.add(holder);
      const face = mesh(holder, new THREE.CylinderGeometry(0.075, 0.075, 0.025, 40), 'cgi_dms', 'deformable');
      face.rotation.z = Math.PI / 2;
      const body = mesh(holder, new THREE.BoxGeometry(0.06, 0.2, 0.2), 'cgi_dms', 'emccd');
      body.position.x = 0.045;
      const post = mesh(cgiGroup, new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8), 'cgi_dms', 'titanium');
      post.position.set(x, cy - 0.2, z);
      return holder;
    };
    dm(cx - 0.35, cz - 0.18, 0.6);
    dm(cx - 0.12, cz + 0.2, Math.PI + 0.6);
    anchor('dm1', cgiGroup, [cx - 0.36, cy - 0.08, cz - 0.18]);
    anchor('dm2', cgiGroup, [cx - 0.1, cy - 0.08, cz + 0.2]);
    hotspot('cgi_dms', cgiGroup, [cx - 0.24, cy + 0.08, cz]);
  }

  /* ------------------------------------------------------------------
     UZAY ARACI GÖVDESİ (Spacecraft Bus) — altıgen
     ------------------------------------------------------------------ */
  const busGroup = group(root, 'bus', [3.2, 0, 0]);
  const Sb = DIMS.bus.side;
  const busTop = (Sb * SQRT3) / 2;
  {
    const x0 = DIMS.bus.front;
    const x1 = DIMS.bus.back;
    const hex = hexagon(Sb);
    mesh(busGroup, prismGeometry(hex, x0, x1, { caps: true }), 'bus', 'mliDark', { shell: true });
    mesh(busGroup, prismGeometry(hexagon(Sb + 0.02), x0 - 0.01, x0 + 0.14), 'bus', 'mliGold', { shell: true });
    mesh(busGroup, prismGeometry(hexagon(Sb + 0.02), x1 - 0.12, x1 + 0.01), 'bus', 'aluminum', { shell: true });
    // Altı elektronik bölmesi: kapakları aynı zamanda radyatördür
    for (let k = 0; k < 6; k++) {
      const a = hex[k];
      const b = hex[(k + 1) % 6];
      const mid = new THREE.Vector2().addVectors(a, b).multiplyScalar(0.5);
      const normal = mid.clone().normalize();
      const panel = mesh(busGroup, new THREE.BoxGeometry(1.3, 0.012, Sb * 0.62), 'bus', 'radiator', { shell: true });
      panel.position.set((x0 + x1) / 2 + 0.05, mid.y + normal.y * 0.008, mid.x + normal.x * 0.008);
      panel.quaternion.setFromUnitVectors(UP, new THREE.Vector3(0, normal.y, normal.x));
      if (k === 1 || k === 4) continue;
      const small = mesh(busGroup, new THREE.BoxGeometry(0.32, 0.012, Sb * 0.2), 'bus', 'radiator', { shell: true });
      small.position.set(x1 - 0.32, mid.y + normal.y * 0.008, mid.x + normal.x * 0.008);
      small.quaternion.copy(panel.quaternion);
    }
    // İtici memeleri (köşelerde)
    for (let i = 0; i < 6; i++) {
      const p = hex[i];
      const th = mesh(busGroup, new THREE.ConeGeometry(0.06, 0.18, 14, 1, true).rotateZ(Math.PI / 2), 'bus', 'titanium', { side: THREE.DoubleSide });
      th.position.set(x1 - 0.2, p.y * 0.93, p.x * 0.93);
    }
    hotspot('bus', busGroup, [(x0 + x1) / 2, -busTop * 0.5 - 0.05, Sb * 0.75 + 0.03]);

    // İç düzen: merkezi silindir ve içinde 4 hidrazin tankı
    const core = mesh(busGroup, cylinderX(0.92, 0.92, 1.8, 48, true), 'bus_tanks', 'structure', { side: THREE.DoubleSide });
    core.position.x = (x0 + x1) / 2;
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2;
      const tank = mesh(busGroup, new THREE.SphereGeometry(0.38, 32, 20), 'bus_tanks', 'tank');
      tank.scale.set(1.25, 1, 1);
      tank.position.set((x0 + x1) / 2, Math.sin(a) * 0.46, Math.cos(a) * 0.46);
    }
    hotspot('bus_tanks', busGroup, [(x0 + x1) / 2, 0.98, 0.05]);
    // 6 tepki tekerleği, piramit düzeninde
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
      const holder = new THREE.Group();
      holder.position.set((x0 + x1) / 2 + (i % 2 ? 0.45 : -0.45), Math.sin(a) * 1.36, Math.cos(a) * 1.36);
      const axis = new THREE.Vector3(i % 2 ? 0.55 : -0.55, Math.sin(a), Math.cos(a)).normalize();
      holder.quaternion.setFromUnitVectors(UP, axis);
      busGroup.add(holder);
      mesh(holder, new THREE.CylinderGeometry(0.21, 0.21, 0.09, 32), 'bus_wheels', 'wheel');
      const rim = mesh(holder, new THREE.TorusGeometry(0.21, 0.025, 8, 32), 'bus_wheels', 'accent');
      rim.rotation.x = Math.PI / 2;
      const isolator = mesh(holder, new THREE.CylinderGeometry(0.06, 0.08, 0.2, 12), 'bus_wheels', 'blackPaint');
      isolator.position.y = -0.12;
    }
    hotspot('bus_wheels', busGroup, [(x0 + x1) / 2 + 0.45, Math.sin(Math.PI / 6 + Math.PI / 3) * 1.36 + 0.25, Math.cos(Math.PI / 6 + Math.PI / 3) * 1.36]);

    // İletişim modülü ve fırlatma adaptör halkası
    const comms = mesh(busGroup, cylinderX(1.25, 1.3, DIMS.comms.back - x1, 6), 'bus', 'mliGold', { shell: true });
    comms.position.x = (x1 + DIMS.comms.back) / 2;
    const adapter = mesh(busGroup, cylinderX(0.78, 0.82, 0.2, 48, true), 'bus', 'aluminum', { side: THREE.DoubleSide });
    adapter.position.x = DIMS.comms.back + 0.1;
    for (const z of [-0.95, 0.95]) {
      const omni = mesh(busGroup, cylinderX(0.05, 0.08, 0.3, 12), 'bus', 'radiator');
      omni.position.set(DIMS.comms.back + 0.15, -0.55, z);
    }
  }

  /* ------------------------------------------------------------------
     YÜKSEK KAZANÇLI ANTEN — iletişim modülünden açılan kol
     ------------------------------------------------------------------ */
  const antennaGroup = group(root, 'antenna', [4.4, 1.0, 0]);
  {
    const base = new THREE.Group();
    base.position.set(DIMS.comms.back + 0.05, 1.2, 0);
    antennaGroup.add(base);
    mesh(base, new THREE.BoxGeometry(0.22, 0.28, 0.28), 'antenna', 'blackPaint');
    const shoulder = new THREE.Group();
    shoulder.position.set(0.1, 0, 0);
    base.add(shoulder);
    rig.antennaShoulder = shoulder;
    const boomLen = DIMS.antenna.boom;
    const boom = mesh(shoulder, new THREE.CylinderGeometry(0.045, 0.055, boomLen, 16), 'antenna', 'aluminum');
    boom.position.y = boomLen / 2;
    const gimbal = new THREE.Group();
    gimbal.position.y = boomLen;
    shoulder.add(gimbal);
    rig.antennaGimbal = gimbal;
    mesh(gimbal, new THREE.SphereGeometry(0.09, 16, 12), 'antenna', 'blackPaint');
    const dishMount = new THREE.Group();
    dishMount.position.y = 0.12;
    gimbal.add(dishMount);
    const R = DIMS.antenna.dish / 2;
    const f = 0.62;
    const pts = [];
    for (let i = 0; i <= 18; i++) {
      const r = (R * i) / 18;
      pts.push(new THREE.Vector2(r, (r * r) / (4 * f)));
    }
    const dish = mesh(dishMount, new THREE.LatheGeometry(pts, 56), 'antenna', 'dish');
    dish.position.y = 0.05;
    const dishBack = mesh(dishMount, new THREE.CylinderGeometry(0.15, 0.2, 0.12, 20), 'antenna', 'blackPaint');
    dishBack.position.y = 0.0;
    const focusY = 0.05 + f;
    const feed = mesh(dishMount, new THREE.CylinderGeometry(0.035, 0.06, 0.16, 12), 'antenna', 'blackPaint');
    feed.position.y = focusY;
    const rimY = 0.05 + (R * R) / (4 * f);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      strut(dishMount, [Math.cos(a) * R * 0.94, rimY, Math.sin(a) * R * 0.94], [0, focusY, 0], 0.012, 'antenna', 'composite');
    }
    hotspot('antenna', dishMount, [0, rimY + 0.05, 0]);
  }

  /* ------------------------------------------------------------------
     GÜNEŞ PANELİ KALKANI (SASS) — 6 panel (3 x 2) ve gövde güneşlikleri (LISS)
     ------------------------------------------------------------------ */
  const sassGroup = group(root, 'sass', [0, 4.5, 0]);
  const lissGroup = group(root, 'liss', [3.2, 2.6, 0]);
  const ys = TOP + DIMS.sass.gap;
  {
    const { front, back, panelWidth: pw, thickness: t } = DIMS.sass;
    const pl = (back - front) / 2;
    const chamfer = 0.6;

    const panel = (parent, partId, x0, x1, z0, z1, cut, cells = true) => {
      // cut: ön kenarda (x0) pah kırılacak köşeler: {lo: z0 köşesi, hi: z1 köşesi}
      const shape = new THREE.Shape();
      shape.moveTo(x0 + (cut?.lo ? chamfer : 0), z0);
      shape.lineTo(x1, z0);
      shape.lineTo(x1, z1);
      shape.lineTo(x0 + (cut?.hi ? chamfer : 0), z1);
      if (cut?.hi) shape.lineTo(x0, z1 - chamfer);
      if (cut?.lo) shape.lineTo(x0, z0 + chamfer);
      shape.closePath();
      // Şekil (x, z) düzleminde çizilir: rotateX(+90°) ile y -> z, normal -Y
      const body = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false });
      body.rotateX(Math.PI / 2);
      const m = mesh(parent, body, partId, cells ? 'solarBack' : 'blanket');
      m.position.y = 0;
      if (!cells) return m;
      const top = new THREE.ShapeGeometry(shape);
      top.rotateX(Math.PI / 2);
      top.computeBoundingBox();
      const bb = top.boundingBox;
      const pos = top.attributes.position;
      const uv = top.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        uv.setXY(i, (pos.getZ(i) - bb.min.z) / (bb.max.z - bb.min.z), (pos.getX(i) - bb.min.x) / (bb.max.x - bb.min.x));
      }
      const face = mesh(parent, top, partId, 'solar', { cast: false, side: THREE.BackSide });
      face.position.y = 0.003;
      return m;
    };

    const center = new THREE.Group();
    center.position.y = ys + t;
    sassGroup.add(center);
    panel(center, 'sass', front, front + pl - 0.02, -pw / 2 + 0.02, pw / 2 - 0.02, { lo: true, hi: true });
    panel(center, 'sass', front + pl + 0.02, back, -pw / 2 + 0.02, pw / 2 - 0.02);

    rig.wings = [];
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(0, ys + t, side * pw / 2);
      sassGroup.add(pivot);
      const z0 = side > 0 ? 0.02 : -pw + 0.02;
      const z1 = side > 0 ? pw - 0.02 : -0.02;
      panel(pivot, 'sass', front, front + pl - 0.02, z0, z1, side > 0 ? { hi: true } : { lo: true });
      panel(pivot, 'sass', front + pl + 0.02, back, z0, z1);
      for (const x of [front + 0.7, back - 0.7]) {
        const h = mesh(pivot, cylinderX(0.035, 0.035, 0.32, 12), 'sass', 'titanium');
        h.position.set(x, -t / 2, 0);
      }
      rig.wings.push({ pivot, side, base: ys + t });
    }
    // Merkez paneller dış tüpün Güneş'e bakan yüzüne cıvatalıdır
    for (const x of [front + 0.5, front + pl, back - 0.5]) {
      for (const z of [-0.65, 0.65]) {
        strut(sassGroup, [x, TOP, z], [x, ys, z], 0.04, 'sass', 'composite');
      }
    }
    hotspot('sass', center, [-1.3, 0.06, 0.15]);

    // Alt Alet Güneşliği: gövdenin Güneş tarafında, dış sütunların hizasında iki kanat
    rig.lissWings = [];
    const { front: lf, back: lb } = DIMS.liss;
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(0, ys + t, side * pw / 2);
      lissGroup.add(pivot);
      const z0 = side > 0 ? 0.02 : -pw + 0.02;
      const z1 = side > 0 ? pw - 0.02 : -0.02;
      panel(pivot, 'liss', lf, lb, z0, z1, null, false);
      for (const x of [lf + 0.4, lb - 0.4]) {
        const h = mesh(pivot, cylinderX(0.035, 0.035, 0.3, 12), 'liss', 'titanium');
        h.position.set(x, -t / 2, 0);
      }
      rig.lissWings.push({ pivot, side, base: ys + t });
      const bracket = mesh(lissGroup, new THREE.BoxGeometry(0.2, ys + t - busTop, 0.2), 'liss', 'composite');
      bracket.position.set((lf + lb) / 2, (ys + t + busTop) / 2, side * (pw / 2 - 0.1));
      if (side > 0) hotspot('liss', pivot, [(lf + lb) / 2, 0.06, pw / 2]);
    }
  }

  /* ------------------------------------------------------------------
     Açılma (deploy) ve patlatma (explode) durumları
     ------------------------------------------------------------------ */
  const A = new THREE.Vector3();
  const B = new THREE.Vector3();
  const C = new THREE.Vector3();
  const tip = new THREE.Vector3();

  function updateFlaps() {
    dacGroup.updateMatrixWorld(true);
    tip.setFromMatrixPosition(rig.dacTip.matrixWorld);
    dacGroup.worldToLocal(tip);
    const W = DIMS.dac.width;
    for (const { geo, side } of rig.dacFlaps) {
      A.set(xf - 0.01, TOP + 0.05, side * W / 2);
      B.set(tip.x, tip.y, side * W / 2);
      C.set(xf - 0.01, 0, side * (S + 0.02));
      const p = geo.attributes.position;
      // İlk üçgen dış (gümüş) yüz, ikincisi ters sarımla iç (siyah) yüz
      const outer = side > 0 ? [A, B, C] : [A, C, B];
      const inner = side > 0 ? [A, C, B] : [A, B, C];
      [...outer, ...inner].forEach((v, i) => p.setXYZ(i, v.x, v.y, v.z));
      p.needsUpdate = true;
      geo.computeVertexNormals();
      geo.computeBoundingSphere();
      geo.computeBoundingBox();
    }
  }

  let deployState = 1;
  /** 0 = fırlatma (katlı) durumu, 1 = tamamen açılmış. */
  function setDeploy(t) {
    deployState = t;
    const solar = smooth(0.03, 0.38, t);
    const ant = smooth(0.38, 0.66, t);
    const dac = smooth(0.64, 0.99, t);
    // Dış paneller fırlatmada tüpün eğik yüzlerine katlanır (60°)
    const fold = (Math.PI / 3) * (1 - solar);
    for (const { pivot, side } of rig.wings) pivot.rotation.x = side * fold;
    for (const { pivot, side } of rig.lissWings) pivot.rotation.x = side * fold;
    // Anten kolu fırlatmada aşağı-geriye katlıdır; açılınca Dünya'ya (Güneş tarafına) döner
    rig.antennaShoulder.rotation.z = THREE.MathUtils.lerp(-Math.PI + 0.35, -0.62, ant);
    rig.antennaGimbal.rotation.z = THREE.MathUtils.lerp(Math.PI / 2 - 0.35, 0.85, ant);
    // Kapak: fırlatmada açıklığın önünde dik durur, sonra sayfa gibi kalkar
    rig.dacHinge.rotation.z = THREE.MathUtils.lerp(Math.PI / 2 - 0.015, 0, dac);
    updateFlaps();
  }

  function setExplode(t) {
    const e = t * t * (3 - 2 * t);
    for (const g of explodeGroups) g.position.copy(g.userData.base).addScaledVector(g.userData.offset, e);
    updateFlaps();
  }

  setDeploy(1);
  setExplode(0);
  root.updateMatrixWorld(true);

  return {
    root,
    parts,
    shells,
    anchors,
    rig,
    setDeploy,
    setExplode,
    get deployState() { return deployState; },
  };
}
