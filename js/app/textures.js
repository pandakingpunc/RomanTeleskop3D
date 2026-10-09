// Prosedürel dokular: dış kaynak dosyası gerektirmeden tuvalde (canvas) üretilir.
import * as THREE from 'three';

/** Tekrarlanabilir sözde rastgele sayı üreteci (aynı tohum = aynı doku). */
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Kenarları birbirine uyan (döşenebilir) değer gürültüsü. */
function tileableNoise(period, random) {
  const grid = new Float32Array(period * period);
  for (let i = 0; i < grid.length; i++) grid[i] = random();
  const at = (x, y) => grid[(((y % period) + period) % period) * period + (((x % period) + period) % period)];
  return (x, y) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);
    const a = at(xi, yi);
    const b = at(xi + 1, yi);
    const c = at(xi, yi + 1);
    const d = at(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

function canvas(width, height = width) {
  const el = document.createElement('canvas');
  el.width = width;
  el.height = height;
  return el;
}

function finish(texture, { srgb = false, repeat = 1, anisotropy = 4 } = {}) {
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.anisotropy = anisotropy;
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Buruşuk çok katmanlı yalıtım (MLI) folyosu için normal haritası.
 * "Sırtlı" gürültü katmanları folyonun kırışıklıklarını taklit eder.
 */
export function createCrinkleNormalMap(size = 384, seed = 7) {
  const random = rng(seed);
  const octaves = [
    { period: 6, amp: 1.0 },
    { period: 12, amp: 0.55 },
    { period: 24, amp: 0.3 },
    { period: 48, amp: 0.14 },
  ].map((o) => ({ ...o, noise: tileableNoise(o.period, random) }));

  const height = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let h = 0;
      for (const o of octaves) {
        const n = o.noise((x / size) * o.period, (y / size) * o.period);
        h += o.amp * (1 - Math.abs(2 * n - 1));
      }
      height[y * size + x] = h;
    }
  }

  const el = canvas(size);
  const ctx = el.getContext('2d');
  const img = ctx.createImageData(size, size);
  const strength = 2.6;
  const H = (x, y) => height[((y + size) % size) * size + ((x + size) % size)];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (H(x + 1, y) - H(x - 1, y)) * strength;
      const dy = (H(x, y + 1) - H(x, y - 1)) * strength;
      const inv = 1 / Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      img.data[i] = (-dx * inv * 0.5 + 0.5) * 255;
      img.data[i + 1] = (dy * inv * 0.5 + 0.5) * 255;
      img.data[i + 2] = (inv * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return finish(new THREE.CanvasTexture(el));
}

/**
 * Güneş paneli: koyu hücreler, aralarında kapton (kızıl-kahve) taban,
 * yer yer beyaz sensör plakaları. Gerçek panellerin fotoğraflarındaki düzene benzer.
 */
export function createSolarTextures(seed = 11) {
  const random = rng(seed);
  const W = 512;
  const H = 768;
  const color = canvas(W, H);
  const rough = canvas(W, H);
  const c = color.getContext('2d');
  const r = rough.getContext('2d');

  c.fillStyle = '#5b1f17';
  c.fillRect(0, 0, W, H);
  r.fillStyle = '#d0d0d0';
  r.fillRect(0, 0, W, H);

  const cols = 11;
  const rows = 17;
  const margin = 14;
  const gap = 3;
  const cw = (W - margin * 2) / cols;
  const ch = (H - margin * 2) / rows;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      // Hücre dizileri arasında daha geniş kızıl şeritler
      const extra = j % 4 === 3 ? 4 : 0;
      const x = margin + i * cw + gap / 2;
      const y = margin + j * ch + gap / 2;
      const w = cw - gap;
      const h = ch - gap - extra;
      const g = c.createLinearGradient(x, y, x + w, y + h);
      const tint = 14 + random() * 10;
      g.addColorStop(0, `rgb(${tint * 0.55}, ${tint * 0.7}, ${tint * 1.9 + 8})`);
      g.addColorStop(1, `rgb(${tint * 0.35}, ${tint * 0.45}, ${tint * 1.3 + 4})`);
      c.fillStyle = g;
      c.fillRect(x, y, w, h);
      r.fillStyle = '#383838';
      r.fillRect(x, y, w, h);
    }
  }
  // Sensör/etiket plakaları
  for (let k = 0; k < 3; k++) {
    const x = margin + Math.floor(random() * cols) * cw + 8;
    const y = margin + Math.floor(random() * rows) * ch + 6;
    c.fillStyle = '#aeb3bb';
    c.fillRect(x, y, cw * 0.7, ch * 0.55);
    r.fillStyle = '#e0e0e0';
    r.fillRect(x, y, cw * 0.7, ch * 0.55);
  }
  // Çerçeve
  c.strokeStyle = '#9aa1ab';
  c.lineWidth = 6;
  c.strokeRect(3, 3, W - 6, H - 6);

  return {
    map: finish(new THREE.CanvasTexture(color), { srgb: true }),
    roughnessMap: finish(new THREE.CanvasTexture(rough)),
  };
}

/** Beyaz boyalı radyatör panelleri: hafif panel çizgileri ve cıvata sıraları. */
export function createRadiatorTexture(seed = 5) {
  const random = rng(seed);
  const S = 256;
  const el = canvas(S);
  const c = el.getContext('2d');
  c.fillStyle = '#e8eaee';
  c.fillRect(0, 0, S, S);
  for (let i = 0; i < 900; i++) {
    const v = 225 + random() * 25;
    c.fillStyle = `rgba(${v},${v},${v + 3},0.35)`;
    c.fillRect(random() * S, random() * S, 2, 2);
  }
  c.strokeStyle = 'rgba(120,128,140,0.45)';
  c.lineWidth = 2;
  c.strokeRect(1, 1, S - 2, S - 2);
  c.fillStyle = 'rgba(110,118,130,0.6)';
  for (let i = 8; i < S; i += 24) {
    c.fillRect(i, 6, 3, 3);
    c.fillRect(i, S - 9, 3, 3);
  }
  return finish(new THREE.CanvasTexture(el), { srgb: true });
}

/** Deforme edilebilir ayna yüzeyi: 48 x 48 aktüatör ızgarası. */
export function createActuatorTexture() {
  const S = 256;
  const el = canvas(S);
  const c = el.getContext('2d');
  c.fillStyle = '#d9dde6';
  c.fillRect(0, 0, S, S);
  const n = 48;
  const step = S / n;
  c.fillStyle = 'rgba(80,90,110,0.55)';
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const dx = i - n / 2 + 0.5;
      const dy = j - n / 2 + 0.5;
      if (dx * dx + dy * dy > (n / 2) * (n / 2)) continue;
      c.beginPath();
      c.arc(i * step + step / 2, j * step + step / 2, step * 0.22, 0, Math.PI * 2);
      c.fill();
    }
  }
  return finish(new THREE.CanvasTexture(el), { srgb: true, anisotropy: 8 });
}

/** Yumuşak ışıma lekesi (güneş parlaması, foton noktaları). */
export function createGlowTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)', size = 128) {
  const el = canvas(size);
  const c = el.getContext('2d');
  const g = c.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  g.addColorStop(0.18, inner);
  g.addColorStop(0.45, outer.replace(/[\d.]+\)$/, '0.25)'));
  g.addColorStop(1, outer);
  c.fillStyle = g;
  c.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(el);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Samanyolu: eşdikdörtgen (equirectangular) gökyüzü dokusu.
 * Galaksi düzlemi boyunca yumuşak bir ışık bandı ve toz şeritleri çizer.
 */
export function createMilkyWayTexture(width = 768, height = 384, seed = 3) {
  const random = rng(seed);
  const n1 = tileableNoise(8, random);
  const n2 = tileableNoise(16, random);
  const n3 = tileableNoise(32, random);
  const n4 = tileableNoise(64, random);
  const el = canvas(width, height);
  const ctx = el.getContext('2d');
  const img = ctx.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    const lat = (y / height - 0.5) * Math.PI; // -pi/2..pi/2
    for (let x = 0; x < width; x++) {
      const u = x / width;
      const v = y / height;
      // Bant: enlem sıfıra yakın yerlerde parlak; merkez (u≈0.5) daha şişkin
      const bulge = Math.exp(-(((u - 0.5) * 3.2) ** 2));
      const widthBand = 0.16 + bulge * 0.12;
      const band = Math.exp(-((lat / widthBand) ** 2));
      const cloud = n1(u * 8, v * 8) * 0.5 + n2(u * 16, v * 16) * 0.3 + n3(u * 32, v * 32) * 0.2;
      const dust = Math.max(0, n2(u * 16 + 3.1, v * 16) * 0.6 + n4(u * 64, v * 64) * 0.4 - 0.45) * 2.2;
      let b = band * (0.35 + cloud * 0.9) * (1 - Math.min(0.85, dust * band * 1.6));
      b += bulge * band * 0.35;
      const haze = 0.018 + 0.02 * n1(u * 8 + 1.7, v * 8);
      const i = (y * width + x) * 4;
      img.data[i] = Math.min(255, (haze * 0.8 + b * 0.55) * 255);
      img.data[i + 1] = Math.min(255, (haze * 0.9 + b * 0.5) * 255);
      img.data[i + 2] = Math.min(255, (haze * 1.6 + b * 0.62) * 255);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const texture = new THREE.CanvasTexture(el);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  return texture;
}

/** Uzaktan görünen Dünya için basit kıtalı, bulutlu doku. */
export function createEarthTexture(seed = 21) {
  const random = rng(seed);
  const W = 512;
  const H = 256;
  const a = tileableNoise(6, random);
  const b = tileableNoise(12, random);
  const cN = tileableNoise(24, random);
  const cloudA = tileableNoise(10, random);
  const cloudB = tileableNoise(30, random);
  const el = canvas(W, H);
  const ctx = el.getContext('2d');
  const img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    const lat = Math.abs(y / H - 0.5) * 2;
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const v = y / H;
      const h = a(u * 6, v * 6) * 0.6 + b(u * 12, v * 12) * 0.3 + cN(u * 24, v * 24) * 0.1;
      const land = h > 0.56;
      const ice = lat > 0.86;
      let r;
      let g;
      let bl;
      if (ice) [r, g, bl] = [235, 240, 248];
      else if (land) {
        const dry = Math.min(1, Math.max(0, (h - 0.6) * 4 + (0.5 - lat) * 0.4));
        r = 60 + dry * 110;
        g = 95 + dry * 60;
        bl = 50 + dry * 30;
      } else {
        const depth = Math.min(1, (0.56 - h) * 3);
        r = 18;
        g = 60 - depth * 25;
        bl = 140 - depth * 40;
      }
      const cloud = Math.max(0, cloudA(u * 10, v * 10) * 0.65 + cloudB(u * 30, v * 30) * 0.35 - 0.48) * 2.6;
      const k = Math.min(1, cloud);
      const i = (y * W + x) * 4;
      img.data[i] = r + (250 - r) * k;
      img.data[i + 1] = g + (252 - g) * k;
      img.data[i + 2] = bl + (255 - bl) * k;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const texture = new THREE.CanvasTexture(el);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}
