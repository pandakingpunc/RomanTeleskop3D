// "İçini gör" modu: dış kabukları kameraya bakan yarıdan keser (kesit görünümü) ve
// kesilen kısmın hayalet kenar çizgilerini gösterir. Kesit düzlemi her zaman teleskobun
// optik ekseninden geçer ve kameraya doğru açılır; böylece hangi açıdan bakılırsa bakılsın
// iç parçalar görünür. Bu mod açıkken model birleşik (patlatılmamış) tutulur.
import * as THREE from 'three';

export function createCutaway({ model }) {
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  const toCamera = new THREE.Vector3();
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x8fd4ff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const materials = new Set();
  const edges = [];
  let enabled = false;
  let amount = 0; // 0..1 açılış animasyonu

  for (const mesh of model.shells) {
    for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) materials.add(material);
    if (!mesh.userData.edges) continue;
    const line = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 28), edgeMaterial);
    line.visible = false;
    line.raycast = () => {};
    mesh.add(line);
    edges.push(line);
  }

  function setEnabled(on) {
    if (on === enabled) return;
    enabled = on;
    if (on) {
      for (const material of materials) {
        material.clippingPlanes = [plane];
        material.clipShadows = true;
        material.needsUpdate = true;
      }
      for (const line of edges) line.visible = true;
    }
  }

  /** Kesit düzlemini kameraya göre günceller; animasyon sürerken true döner. */
  function update(camera, dt) {
    const target = enabled ? 1 : 0;
    if (amount === target && !enabled) return false;
    const animating = Math.abs(amount - target) > 0.002;
    amount = animating ? amount + (target - amount) * Math.min(1, dt * 5) : target;
    edgeMaterial.opacity = 0.3 * amount;

    toCamera.set(0, camera.position.y, camera.position.z);
    if (toCamera.lengthSq() > 1e-4) plane.normal.copy(toCamera).normalize().negate();
    // amount = 0 iken düzlem kameranın 7 m önünde (hiçbir şey kesilmez), 1 iken eksende
    plane.constant = (1 - amount) * 7;

    if (!enabled && amount === 0) {
      for (const material of materials) {
        material.clippingPlanes = null;
        material.clipShadows = false;
        material.needsUpdate = true;
      }
      for (const line of edges) line.visible = false;
    }
    return animating;
  }

  /** Bir ışın kesişiminin kesilen (görünmeyen) bölgede olup olmadığını söyler. */
  function isClipped(hit) {
    if (amount === 0 || !hit.object.userData.shell) return false;
    return plane.distanceToPoint(hit.point) < 0;
  }

  return {
    setEnabled,
    update,
    isClipped,
    get enabled() { return enabled; },
  };
}
