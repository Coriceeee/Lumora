import React, { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";
import { useFrame, extend } from "@react-three/fiber";
import { mapEmotions, generateBranches, pointsAroundEnds } from "./voxel-utils";

extend({ InstancedMesh: THREE.InstancedMesh, Group: THREE.Group });

interface EmotionProps {
  valence: number;
  arousal: number;
  calmness: number;
}

interface Branch {
  start: THREE.Vector3;
  end: THREE.Vector3;
  radius: number;
}

export const VoxelPhuongTree: React.FC<{ emotions: EmotionProps }> = ({ emotions }) => {
  const params = useMemo(() => mapEmotions(emotions), [emotions]);
  const branches = useMemo<Branch[]>(() => generateBranches({}), []);
  const swayRef = useRef<THREE.Group>(null!);

  // 🌲 Thân cây
  const trunkVoxels = useMemo(() => {
    const cubes: THREE.Vector3[] = [];
    branches.forEach((b: Branch) => {
      const dir = b.end.clone().sub(b.start);
      const len = dir.length();
      const n = Math.max(1, Math.floor(len / 0.35));
      for (let i = 0; i <= n; i++) cubes.push(b.start.clone().addScaledVector(dir, i / n));
    });
    return cubes;
  }, [branches]);

  // 🍃 Lá và hoa
  const leafVoxels = useMemo(
    () => pointsAroundEnds(branches, Math.floor(params.leafDensity), 3.0),
    [branches, params.leafDensity]
  );
  const blossomVoxels = useMemo(
    () => pointsAroundEnds(branches, Math.floor(params.blossomDensity), 2.4),
    [branches, params.blossomDensity]
  );

  // 🌬 Hiệu ứng gió (lung lay)
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (swayRef.current) {
      swayRef.current.rotation.z = Math.sin(t * params.swaySpeed) * params.windStrength * 0.03;
      swayRef.current.rotation.x = Math.cos(t * params.swaySpeed * 0.7) * params.windStrength * 0.02;
    }
  });

  return (
    <group ref={swayRef}>
      <InstancedVoxels
        positions={trunkVoxels}
        color={new THREE.Color("#8B5A2B")}
        size={[0.35, 0.35, 0.35]}
      />
      <InstancedVoxels
        positions={leafVoxels}
        color={new THREE.Color("#3ba454")}
        size={[0.26, 0.26, 0.26]}
        jitter
      />
      <InstancedVoxels
        positions={blossomVoxels}
        color={new THREE.Color().setHSL(params.hue, 0.8, 0.55)}
        size={[0.22, 0.22, 0.22]}
        jitter
      />
    </group>
  );
};

// 📦 Component voxel khối lập phương
const InstancedVoxels: React.FC<{
  positions: THREE.Vector3[];
  color: THREE.Color;
  size: [number, number, number];
  jitter?: boolean;
}> = ({ positions, color, size, jitter = false }) => {
  const ref = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const geo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const mat = useMemo(
    () => new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0 }),
    [color]
  );

  useLayoutEffect(() => {
    positions.forEach((p, i) => {
      dummy.position.set(
        p.x + (jitter ? (Math.random() - 0.5) * 0.06 : 0),
        p.y + (jitter ? (Math.random() - 0.5) * 0.06 : 0),
        p.z + (jitter ? (Math.random() - 0.5) * 0.06 : 0)
      );
      dummy.scale.set(size[0], size[1], size[2]);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;

    return () => {
      geo.dispose();
      mat.dispose();
    };
  }, [positions, size, jitter, geo, mat, dummy]);

  return (
    <instancedMesh
      ref={ref}
      args={[geo, mat, positions.length]}
      castShadow
      receiveShadow
    />
  );
};
