import * as THREE from "three";

export const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

export function mapEmotions({ valence, arousal, calmness }: { valence: number; arousal: number; calmness: number }) {
  return {
    blossomDensity: THREE.MathUtils.lerp(120, 1100, clamp((valence + 1) / 2)),
    leafDensity: THREE.MathUtils.lerp(500, 2000, clamp((valence + 1) / 2)),
    windStrength: THREE.MathUtils.lerp(0.05, 1.6, clamp((arousal + 1) / 2)),
    swaySpeed: THREE.MathUtils.lerp(0.05, 1.0, clamp((1 - calmness) * 0.9)),
    hue: THREE.MathUtils.lerp(0.0, 0.03, clamp((valence + 1) / 2)),
    petalRate: THREE.MathUtils.lerp(40, 420, clamp((arousal + valence + 2) / 4)),
    timeOfDay: clamp(0.2 + 0.65 * ((valence + 1) / 2), 0.15, 0.95),
  };
}

export function generateBranches({
  levels = 5,
  trunkHeight = 6.5,
  trunkRadius = 0.35,
  spread = 1.05,
  randomness = 0.35,
}: {
  levels?: number;
  trunkHeight?: number;
  trunkRadius?: number;
  spread?: number;
  randomness?: number;
}) {
  const branches: { start: THREE.Vector3; end: THREE.Vector3; radius: number }[] = [];
  const root = new THREE.Vector3(0, 0, 0);
  function addBranch(start: THREE.Vector3, dir: THREE.Vector3, length: number, radius: number, level: number) {
    const end = start.clone().add(dir.clone().multiplyScalar(length));
    branches.push({ start: start.clone(), end: end.clone(), radius });
    if (level <= 0) return;
    const nChildren = 2 + Math.round(Math.random() * 2);
    for (let i = 0; i < nChildren; i++) {
      const ndir = dir
        .clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), (Math.random() - 0.5) * Math.PI * 0.5)
        .applyAxisAngle(new THREE.Vector3(1, 0, 0), (Math.random() - 0.5) * Math.PI * 0.3)
        .applyAxisAngle(new THREE.Vector3(0, 0, 1), (Math.random() - 0.5) * Math.PI * 0.25)
        .multiplyScalar(spread + (Math.random() - 0.5) * randomness);
      addBranch(end, ndir.normalize(), length * 0.7, Math.max(0.06, radius * 0.7), level - 1);
    }
  }
  addBranch(root, new THREE.Vector3(0, 1, 0), trunkHeight, trunkRadius, levels);
  return branches;
}

export function pointsAroundEnds(branches: { start: THREE.Vector3; end: THREE.Vector3 }[], n: number, radius = 2.6) {
  const pts: THREE.Vector3[] = [];
  const ends = branches.map((b) => b.end.clone());
  for (let i = 0; i < n; i++) {
    const e = ends[Math.floor(Math.random() * ends.length)] || new THREE.Vector3(0, 4, 0);
    const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() * 0.9, Math.random() - 0.5).normalize();
    const r = Math.random() * radius;
    pts.push(e.clone().addScaledVector(dir, r));
  }
  return pts;
}
