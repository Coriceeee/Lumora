import React from "react";
import { extend } from "@react-three/fiber";
import { CircleGeometry } from "three";

// 🧩 Mở rộng để dùng thẻ <circleGeometry> trong JSX
extend({ CircleGeometry });

export function HealingGroundComponent() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[16, 64]} />
      <meshStandardMaterial color="#f0efe8" />
    </mesh>
  );
}
