// Malzeme kütüphanesi. Her parça kendi malzeme kopyalarını alır; böylece bir parçayı
// vurgulamak (parlatmak) diğer parçaları etkilemez.
import * as THREE from 'three';
import {
  createActuatorTexture,
  createCrinkleNormalMap,
  createRadiatorTexture,
  createSolarTextures,
} from './textures.js';

export function createMaterialLibrary() {
  const crinkle = createCrinkleNormalMap();
  const crinkleFine = crinkle.clone();
  crinkleFine.repeat.set(3, 3);
  crinkleFine.needsUpdate = true;
  const solar = createSolarTextures();
  const radiator = createRadiatorTexture();
  const actuators = createActuatorTexture();

  const std = (params) => new THREE.MeshStandardMaterial(params);

  /** Şablonlar: anahtar -> üretici fonksiyon */
  const templates = {
    // Gümüş renkli buruşuk yalıtım folyosu (dış tüp, kapak)
    mli: () => std({ color: 0xaeb4be, metalness: 0.85, roughness: 0.44, envMapIntensity: 0.75, normalMap: crinkle, normalScale: new THREE.Vector2(0.55, 0.55) }),
    mliDark: () => std({ color: 0x3a3d45, metalness: 0.75, roughness: 0.42, normalMap: crinkle, normalScale: new THREE.Vector2(0.45, 0.45) }),
    mliGold: () => std({ color: 0xa8812f, metalness: 0.9, roughness: 0.4, normalMap: crinkleFine, normalScale: new THREE.Vector2(0.5, 0.5) }),
    // Tüpün iç yüzeyi: ışığı yutan mat siyah boya
    absorber: () => std({ color: 0x0b0c10, metalness: 0.05, roughness: 0.95 }),
    blackPaint: () => std({ color: 0x1b1d23, metalness: 0.3, roughness: 0.7 }),
    structure: () => std({ color: 0x8d949e, metalness: 0.7, roughness: 0.45 }),
    composite: () => std({ color: 0x2b2e35, metalness: 0.35, roughness: 0.55 }),
    titanium: () => std({ color: 0xa9aeb5, metalness: 0.85, roughness: 0.32 }),
    aluminum: () => std({ color: 0xd0d4da, metalness: 0.8, roughness: 0.38 }),
    radiator: () => std({ color: 0xdfe2e7, map: radiator, metalness: 0.05, roughness: 0.75, envMapIntensity: 0.6 }),
    // Gümüş renkli mat güneşlik battaniyesi
    blanket: () => std({ color: 0xaab0ba, metalness: 0.55, roughness: 0.64, envMapIntensity: 0.7, normalMap: crinkle, normalScale: new THREE.Vector2(0.4, 0.4) }),
    radiatorBlue: () => std({ color: 0x2a4fae, metalness: 0.45, roughness: 0.38, normalMap: crinkle, normalScale: new THREE.Vector2(0.12, 0.12) }),
    mirror: () => std({ color: 0xf3f5f8, metalness: 1, roughness: 0.035, envMapIntensity: 1.6 }),
    mirrorBack: () => std({ color: 0x5f6570, metalness: 0.6, roughness: 0.5 }),
    deformable: () => std({ color: 0xffffff, map: actuators, metalness: 1, roughness: 0.12 }),
    detector: () => new THREE.MeshPhysicalMaterial({
      color: 0x10324a,
      metalness: 0.55,
      roughness: 0.16,
      iridescence: 1,
      iridescenceIOR: 1.65,
      iridescenceThicknessRange: [180, 620],
      clearcoat: 0.6,
      clearcoatRoughness: 0.1,
    }),
    filterGlass: () => new THREE.MeshPhysicalMaterial({ color: 0x9fd8ff, metalness: 0, roughness: 0.08, transmission: 0, transparent: true, opacity: 0.85, iridescence: 0.6 }),
    solar: () => std({ color: 0xffffff, map: solar.map, roughnessMap: solar.roughnessMap, metalness: 0.45, roughness: 1 }),
    solarBack: () => std({ color: 0xd9dce2, metalness: 0.25, roughness: 0.6 }),
    dish: () => std({ color: 0xe1e4e9, metalness: 0.2, roughness: 0.55, side: THREE.DoubleSide }),
    tank: () => std({ color: 0xb6bcc6, metalness: 0.85, roughness: 0.28 }),
    wheel: () => std({ color: 0x23262d, metalness: 0.65, roughness: 0.35 }),
    accent: () => std({ color: 0xc8a032, metalness: 0.9, roughness: 0.3 }),
    lens: () => std({ color: 0x0c1220, metalness: 0.9, roughness: 0.08 }),
    emccd: () => std({ color: 0x2c2f37, metalness: 0.5, roughness: 0.4 }),
  };

  const cache = new Map();
  const all = new Set();

  /**
   * Bir parça için malzeme döndürür. Aynı parça + anahtar için aynı nesne paylaşılır.
   * @param {string} partId
   * @param {keyof typeof templates} key
   * @param {{shell?: boolean, side?: THREE.Side}} [opts] shell: kesit görünümünde kesilecek dış kabuk
   */
  function get(partId, key, opts = {}) {
    const id = `${partId}|${key}|${opts.shell ? 's' : ''}|${opts.side ?? ''}`;
    let material = cache.get(id);
    if (!material) {
      // filter0, filter1… anahtarları: her filtre camı kendi rengini alabilsin diye ayrı kopya
      const make = templates[key] ?? (key.startsWith('filter') ? templates.filterGlass : null);
      if (!make) throw new Error(`Bilinmeyen malzeme: ${key}`);
      material = make();
      if (opts.side !== undefined) material.side = opts.side;
      material.userData = {
        partId,
        shell: Boolean(opts.shell),
        baseEmissive: material.emissive.getHex(),
        baseEmissiveIntensity: material.emissiveIntensity,
        baseOpacity: material.opacity,
        baseTransparent: material.transparent,
      };
      cache.set(id, material);
      all.add(material);
    }
    return material;
  }

  function forEach(callback) {
    all.forEach(callback);
  }

  function dispose() {
    for (const material of all) material.dispose();
    for (const texture of [crinkle, crinkleFine, solar.map, solar.roughnessMap, radiator, actuators]) texture.dispose();
  }

  return { get, forEach, dispose };
}
