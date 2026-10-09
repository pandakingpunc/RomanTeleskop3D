// Kamera geçişleri: hedef etrafında yay çizerek (küresel ara değerleme) yumuşak uçuş.
import * as THREE from 'three';

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function createCameraRig({ camera, controls, reducedMotion }) {
  let tween = null;
  const dir0 = new THREE.Vector3();
  const dir1 = new THREE.Vector3();
  const dir = new THREE.Vector3();
  const target = new THREE.Vector3();
  const q0 = new THREE.Quaternion();
  const q = new THREE.Quaternion();
  const FORWARD = new THREE.Vector3(0, 0, 1);

  /**
   * Kamerayı yeni konuma ve bakış hedefine taşır.
   * @param {THREE.Vector3} position
   * @param {THREE.Vector3} lookAt
   * @param {number} [duration] milisaniye
   */
  function flyTo(position, lookAt, duration = 1300) {
    const c0 = controls.target.clone();
    dir0.subVectors(camera.position, c0);
    dir1.subVectors(position, lookAt);
    const len0 = dir0.length();
    const len1 = dir1.length();
    tween = {
      t0: performance.now(),
      dur: reducedMotion ? 0 : duration,
      c0,
      c1: lookAt.clone(),
      len0,
      len1,
      // yönler arası döndürmeyi dörtey (quaternion) ile ifade et
      qa: new THREE.Quaternion().setFromUnitVectors(FORWARD, dir0.clone().normalize()),
      qb: new THREE.Quaternion().setFromUnitVectors(FORWARD, dir1.clone().normalize()),
    };
    if (tween.dur === 0) {
      apply(1);
      tween = null;
    }
  }

  function apply(k) {
    const e = easeInOut(k);
    q0.copy(tween.qa);
    q.copy(q0).slerp(tween.qb, e);
    dir.copy(FORWARD).applyQuaternion(q);
    // Uzaklıkta hafif bir "geri çekilme" yayı: uzun geçişlerde sahne daha iyi okunur
    const swing = Math.sin(Math.PI * e) * Math.min(4, tween.qa.angleTo(tween.qb) * 2.2);
    const len = THREE.MathUtils.lerp(tween.len0, tween.len1, e) + swing;
    target.lerpVectors(tween.c0, tween.c1, e);
    controls.target.copy(target);
    camera.position.copy(target).addScaledVector(dir, len);
    camera.lookAt(target);
  }

  /** Her karede çağrılır; geçiş sürüyorsa true döner. */
  function update() {
    if (!tween) return false;
    const k = Math.min(1, (performance.now() - tween.t0) / Math.max(1, tween.dur));
    apply(k);
    if (k >= 1) tween = null;
    return true;
  }

  /** Bir kutuyu (Box3) ekrana sığdıracak uzaklığı hesaplar. */
  function distanceToFit(box, padding = 1.2) {
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
    const fov = Math.min(vFov, hFov);
    return { center: sphere.center, distance: (sphere.radius * padding) / Math.sin(fov / 2) };
  }

  /** Kutuyu verilen yönden (merkezden kameraya) çerçeveler. */
  function frame(box, direction, { padding = 1.2, duration, minDistance = 0 } = {}) {
    const { center, distance } = distanceToFit(box, padding);
    const d = Math.max(distance, minDistance);
    const position = center.clone().addScaledVector(direction.clone().normalize(), d);
    flyTo(position, center, duration);
  }

  controls.addEventListener('start', () => {
    tween = null;
  });

  return {
    flyTo,
    frame,
    distanceToFit,
    update,
    cancel() { tween = null; },
    get busy() { return tween !== null; },
  };
}
