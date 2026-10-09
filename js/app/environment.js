// Uzay ortamı: Samanyolu arka planı, yıldızlar, Güneş parlaması, uzaktaki Dünya ve Ay, ışıklar.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createEarthTexture, createGlowTexture, createMilkyWayTexture, rng } from './textures.js';

// Güneş yönü: güneş paneli kalkanı (+Y) her zaman Güneş'e bakar.
export const SUN_DIRECTION = new THREE.Vector3(-0.32, 1, 0.42).normalize();

const SKY_RADIUS = 1500;

const starVertex = /* glsl */ `
  attribute float size;
  attribute vec3 color;
  uniform float uPixelRatio;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = size * uPixelRatio;
  }
`;

const starFragment = /* glsl */ `
  varying vec3 vColor;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float core = smoothstep(0.5, 0.0, d);
    float a = core * core * core;
    if (a < 0.003) discard;
    gl_FragColor = vec4(vColor * a, a);
  }
`;

function createStars(count, random) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const palette = [
    [0.66, 0.78, 1.0],
    [0.82, 0.88, 1.0],
    [1.0, 1.0, 1.0],
    [1.0, 0.95, 0.85],
    [1.0, 0.85, 0.66],
    [1.0, 0.72, 0.52],
  ];
  // Samanyolu düzlemi (yıldızların bir kısmı bu bantta yoğunlaşır)
  const galacticNormal = new THREE.Vector3(0.25, 0.55, -0.8).normalize();
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    v.set(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1);
    if (v.lengthSq() < 1e-6) v.set(0, 1, 0);
    v.normalize();
    if (i % 3 === 0) {
      // Bant içine çek
      const d = v.dot(galacticNormal);
      v.addScaledVector(galacticNormal, -d * (0.8 + random() * 0.18)).normalize();
    }
    v.multiplyScalar(SKY_RADIUS * 0.92);
    positions.set([v.x, v.y, v.z], i * 3);
    const tint = palette[Math.floor(random() ** 1.6 * palette.length)];
    const mag = random() ** 7;
    const brightness = 0.35 + mag * 1.3;
    colors.set([tint[0] * brightness, tint[1] * brightness, tint[2] * brightness], i * 3);
    sizes[i] = 1.1 + mag * 4.2 + random() * 0.6;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  const material = new THREE.ShaderMaterial({
    uniforms: { uPixelRatio: { value: 1 } },
    vertexShader: starVertex,
    fragmentShader: starFragment,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = -10;
  return points;
}

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const atmosphereFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uSunView;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float rim = 1.0 - max(dot(vNormal, vView), 0.0);
    float lit = smoothstep(-0.35, 0.6, dot(vNormal, uSunView));
    float a = pow(rim, 2.4) * lit;
    gl_FragColor = vec4(uColor * a * 2.2, a);
  }
`;

export function createEnvironment({ scene, renderer }) {
  const random = rng(42);

  // Metal yüzeylerin yansıması için yumuşak stüdyo ortamı (zayıf tutulur)
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  scene.environment = pmrem.fromScene(room, 0.04).texture;
  scene.environmentIntensity = 0.36;
  room.dispose?.();
  pmrem.dispose();

  // Gökyüzü: Samanyolu dokusu ilk kareden sonra (boşta) üretilir; açılış hızlansın diye
  scene.background = new THREE.Color(0x020309);
  scene.backgroundIntensity = 0.42;
  scene.backgroundRotation.set(0.5, 0.9, 0.35);
  function loadSky() {
    scene.background = createMilkyWayTexture();
  }

  const sky = new THREE.Group();
  sky.name = 'sky';
  scene.add(sky);

  const stars = createStars(7000, random);
  sky.add(stars);

  // Işıklar
  const sun = new THREE.DirectionalLight(0xfff4e2, 2.5);
  sun.position.copy(SUN_DIRECTION).multiplyScalar(30);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.025;
  sun.shadow.radius = 3;
  const s = sun.shadow.camera;
  s.left = -11;
  s.right = 11;
  s.top = 11;
  s.bottom = -11;
  s.near = 1;
  s.far = 70;
  scene.add(sun, sun.target);

  // Kamera tarafından gelen yumuşak dolgu ışığı (Dünya'dan yansıyan ışığı da temsil eder)
  const fill = new THREE.DirectionalLight(0x9fb8ff, 0.8);
  fill.position.set(14, -6, 18);
  const rim = new THREE.DirectionalLight(0xbfd6ff, 0.55);
  rim.position.set(10, 4, -16);
  const hemi = new THREE.HemisphereLight(0x8fa8d8, 0x101420, 0.4);
  scene.add(fill, rim, hemi);

  // Güneş parlaması (bloom ile ışık saçar)
  const bodies = new THREE.Group();
  sky.add(bodies);
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: createGlowTexture('rgba(255,250,235,1)', 'rgba(255,190,90,0)', 256),
    color: new THREE.Color(4, 3.6, 3.1),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  sunGlow.position.copy(SUN_DIRECTION).multiplyScalar(SKY_RADIUS * 0.8);
  sunGlow.scale.setScalar(150);
  const sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: createGlowTexture('rgba(255,220,160,0.5)', 'rgba(255,160,60,0)', 256),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.55,
  }));
  sunHalo.position.copy(sunGlow.position);
  sunHalo.scale.setScalar(560);
  bodies.add(sunHalo, sunGlow);

  // Dünya: L2'den bakınca Güneş'e yakın bir yönde, ince bir hilal olarak görünür.
  const earthDir = SUN_DIRECTION.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), 0.42).applyAxisAngle(new THREE.Vector3(1, 0, 0), -0.2);
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(26, 64, 32),
    new THREE.MeshStandardMaterial({ map: createEarthTexture(), roughness: 0.85, metalness: 0, envMapIntensity: 0 }),
  );
  earth.position.copy(earthDir).multiplyScalar(SKY_RADIUS * 0.7);
  earth.rotation.set(0.3, 2.2, 0.1);
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(28.5, 64, 32),
    new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(0x5fa8ff) }, uSunView: { value: new THREE.Vector3() } },
      vertexShader: atmosphereVertex,
      fragmentShader: atmosphereFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
    }),
  );
  atmosphere.position.copy(earth.position);
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(7, 32, 16),
    new THREE.MeshStandardMaterial({ color: 0x9b9a96, roughness: 0.95, envMapIntensity: 0 }),
  );
  moon.position.copy(earth.position).add(new THREE.Vector3(70, -26, 34));
  bodies.add(earth, atmosphere, moon);
  earth.name = 'earth';
  moon.name = 'moon';
  sunGlow.name = 'sun';

  const sunView = new THREE.Vector3();

  /** Gökyüzünü kameraya sabitler (sonsuz uzaklık hissi). */
  function update(camera, pixelRatio) {
    sky.position.copy(camera.position);
    stars.material.uniforms.uPixelRatio.value = pixelRatio;
    sunView.copy(SUN_DIRECTION).transformDirection(camera.matrixWorldInverse);
    atmosphere.material.uniforms.uSunView.value.copy(sunView);
  }

  function setBodiesVisible(visible) {
    bodies.visible = visible;
  }

  return { sun, fill, rim, hemi, sky, stars, bodies, earth, moon, update, setBodiesVisible, loadSky };
}
