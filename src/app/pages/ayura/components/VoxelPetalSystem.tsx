import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, extend } from "@react-three/fiber";

extend({ InstancedMesh: THREE.InstancedMesh });

export const VoxelPetalSystem: React.FC<{ count: number; area?: number; wind: number; color?: THREE.Color }> = ({
  count,
  area = 10,
  wind,
  color,
}) => {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: color || new THREE.Color("#ff6b6b"), roughness: 0.6 }),
    [color]
  );
  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * area;
      positions[i * 3 + 1] = Math.random() * area * 0.8 + 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * area;
    }
  }, [count]);

  useFrame((_, dt) => {
    for (let i = 0; i < count; i++) {
      let x = positions[i * 3];
      let y = positions[i * 3 + 1];
      let z = positions[i * 3 + 2];
      x += wind * 0.015 * dt * 60;
      y -= 0.01 * dt * 60;
      if (y < -0.5) y = Math.random() * area * 0.8 + 1;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      dummy.position.set(x, y, z);
      dummy.scale.set(0.18, 0.18, 0.18);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[geo, mat, count]} castShadow />;
};
