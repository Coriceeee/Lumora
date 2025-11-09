import React from "react";
import * as THREE from "three";

interface Emotions {
  valence: number;
  calmness: number;
  arousal: number;
}

interface VoxelPhuongTreeProps {
  size?: number;
  emotions?: Emotions;
}

export const VoxelPhuongTree: React.FC<VoxelPhuongTreeProps> = ({ size = 1, emotions }) => {
  const trunkHeight = 4;
  const trunkThickness = 0.8;
  const branchLength = 3;
  const branchThickness = 0.6;
  const leafSize = 0.5;
  const flowerSize = 0.4;

  const leafPositions: [number, number, number][] = [];
  const flowerPositions: [number, number, number][] = [];

  // 🍃 Sinh ngẫu nhiên cụm lá hình cầu tán
  for (let i = 0; i < 80; i++) {
    const r = 2.2 + Math.random() * 1.8;
    const theta = Math.random() * 2 * Math.PI;
    const phi = Math.random() * Math.PI;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = trunkHeight - 0.5 + Math.random() * 1.5;
    const z = r * Math.sin(phi) * Math.sin(theta);
    leafPositions.push([x, y, z]);
  }

  // 🌸 Hoa tập trung trên ngọn và đầu cành
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2 + Math.random();
    const height = trunkHeight + 0.5 + Math.random() * 0.5;
    const x = radius * Math.cos(angle);
    const z = radius * Math.sin(angle);
    flowerPositions.push([x, height, z]);
  }

  return (
    <group scale={[size, size, size]}>
      {/* 🌳 Thân chính */}
      <mesh position={[0, trunkHeight / 2, 0]} castShadow>
        <boxGeometry args={[trunkThickness, trunkHeight, trunkThickness]} />
        <meshStandardMaterial color="#7a4f2c" roughness={0.9} />
      </mesh>

      {/* 🌿 Các nhánh ngang (4 hướng) */}
      {[
        [branchLength / 2, trunkHeight - 0.3, 0],
        [-branchLength / 2, trunkHeight - 0.3, 0],
        [0, trunkHeight - 0.3, branchLength / 2],
        [0, trunkHeight - 0.3, -branchLength / 2],
      ].map((pos, idx) => (
        <mesh key={`branch-${idx}`} position={pos as [number, number, number]} castShadow>
          <boxGeometry
            args={
              idx < 2
                ? [branchLength, branchThickness, branchThickness]
                : [branchThickness, branchThickness, branchLength]
            }
          />
          <meshStandardMaterial color="#7a4f2c" roughness={0.9} />
        </mesh>
      ))}

      {/* 🍃 Lá */}
      {leafPositions.map((pos, idx) => (
        <mesh key={`leaf-${idx}`} position={pos} castShadow>
          <boxGeometry args={[leafSize, leafSize, leafSize]} />
          <meshStandardMaterial color="#2e7d32" roughness={0.7} />
        </mesh>
      ))}

      {/* 🌸 Hoa */}
      {flowerPositions.map((pos, idx) => (
        <mesh key={`flower-${idx}`} position={pos} castShadow>
          <boxGeometry args={[flowerSize, flowerSize, flowerSize]} />
          <meshStandardMaterial color="#ff4500" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
};
