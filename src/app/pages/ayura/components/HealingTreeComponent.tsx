import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, Sky } from '@react-three/drei';

export interface HealingTreeProps {
  size?: number;
  density?: number;
}

export const HealingTreeComponent: React.FC<HealingTreeProps> = ({ size = 1, density = 5 }) => {
  const trunkHeight = 2 * size;
  const leafPositions = [
    { x: 0, y: trunkHeight, z: 0 },
    { x: 1, y: trunkHeight, z: 0 },
    { x: -1, y: trunkHeight, z: 0 },
    { x: 0, y: trunkHeight, z: 1 },
    { x: 0, y: trunkHeight, z: -1 },
    { x: 0, y: trunkHeight + 0.5, z: 0 }
  ];
  const flowerPositions = [
    { x: 1.5, y: trunkHeight + 0.5, z: 0 },
    { x: -1.5, y: trunkHeight + 0.5, z: 0 },
    { x: 0, y: trunkHeight + 0.5, z: 1.5 },
    { x: 0, y: trunkHeight + 0.5, z: -1.5 }
  ];

  return (
    <div className="w-full h-96 bg-blue-100 rounded shadow overflow-hidden">
      <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />
        <Sky />
        <Float speed={1} floatIntensity={0.5}>
          <group castShadow>
            {/* Trunk */}
            <mesh position={[0, trunkHeight / 2, 0]} castShadow>
              <boxGeometry args={[0.5 * size, trunkHeight, 0.5 * size]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Leaves */}
            {leafPositions.map((pos, idx) => (
              <mesh key={idx} position={[pos.x * size, pos.y, pos.z * size]} castShadow>
                <boxGeometry args={[0.5 * size, 0.5 * size, 0.5 * size]} />
                <meshStandardMaterial color="green" />
              </mesh>
            ))}
            {/* Flowers */}
            {flowerPositions.map((pos, idx) => (
              <mesh key={idx} position={[pos.x * size, pos.y, pos.z * size]} castShadow>
                <boxGeometry args={[0.4 * size, 0.4 * size, 0.4 * size]} />
                <meshStandardMaterial color="pink" />
              </mesh>
            ))}
          </group>
        </Float>
        {/* Ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#7CFC00" />
        </mesh>
      </Canvas>
    </div>
  );
};
