import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { useAyura } from "../AyuraCoreProvider";
import { HealingSkyComponent } from "./HealingSkyComponent";
import { HealingGroundComponent } from "./HealingGroundComponent";
import { HealingHUDControls } from "./HealingHUDControls";
import { VoxelPhuongTree } from "./VoxelPhuongTree";
import { VoxelPetalSystem } from "./VoxelPetalSystem";
import * as THREE from "three";

// 🌅 Hàm tính giờ mặt trời mọc/lặn cơ bản (không cần API ngoài)
function getSunTimes(latitude: number, longitude: number) {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Ước lượng đơn giản (sai số nhỏ, chỉ dùng mô phỏng)
  const declination = -23.44 * Math.cos(((360 / 365) * (dayOfYear + 10) * Math.PI) / 180);
  const hourAngle = Math.acos(
    -Math.tan(latitude * (Math.PI / 180)) * Math.tan(declination * (Math.PI / 180))
  );
  const daylightHours = (2 * hourAngle * 24) / (2 * Math.PI);

  const sunrise = new Date(now);
  const sunset = new Date(now);
  sunrise.setHours(12 - daylightHours / 2, 0, 0, 0);
  sunset.setHours(12 + daylightHours / 2, 0, 0, 0);

  return { sunrise, sunset };
}

export const HealingGardenScene: React.FC = () => {
  const { state } = useAyura();
  const [timeOfDay, setTimeOfDay] = useState(0.5);

  // 🕒 Cập nhật theo vị trí thật của người dùng
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const { sunrise, sunset } = getSunTimes(latitude, longitude);

      const update = () => {
        const now = new Date();
        const total = sunset.getTime() - sunrise.getTime();
        const elapsed = now.getTime() - sunrise.getTime();
        const ratio = Math.min(Math.max(elapsed / total, 0), 1);
        setTimeOfDay(ratio);
      };

      update();
      const id = setInterval(update, 60 * 1000);
      return () => clearInterval(id);
    });
  }, []);

  // 🎨 Tính cảm xúc và màu sắc theo thời điểm
  const valence = THREE.MathUtils.lerp(-0.3, 0.9, timeOfDay);
  const calmness = 1 - Math.abs(0.5 - timeOfDay) * 1.8;
  const arousal = 0.4 * Math.sin(timeOfDay * Math.PI);
  const emotions = { valence, calmness, arousal };

  const petalColor = new THREE.Color().setHSL(
    THREE.MathUtils.lerp(0.0, 0.04, timeOfDay),
    0.8,
    0.6
  );

  return (
    <div className="relative h-full w-full bg-[#f8f6f3] rounded-2xl overflow-hidden">
      <Canvas
        camera={{ position: [5.5, 4.8, 7.5], fov: 45 }}
        shadows
        onCreated={({ scene }) => {
          scene.background = new THREE.Color("#ffffff");
        }}
      >
        {/* Bầu trời và ánh sáng */}
        <HealingSkyComponent timeOfDay={timeOfDay} />

        <ambientLight intensity={0.5} color="#ffffff" />
        <directionalLight
          color={new THREE.Color().setHSL(0.1 + 0.4 * timeOfDay, 0.6, 0.6)}
          intensity={THREE.MathUtils.lerp(0.4, 1.2, timeOfDay)}
          position={[6, 10, 4]}
          castShadow
        />

        {/* Cây phượng voxel */}
        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
          <VoxelPhuongTree emotions={emotions} />
        </Float>

        {/* Cánh hoa voxel */}
        <VoxelPetalSystem
          count={220}
          wind={emotions.arousal}
          color={petalColor}
        />

        {/* Mặt đất */}
        <HealingGroundComponent />

        {/* Điều khiển camera */}
        <OrbitControls enablePan={false} />
      </Canvas>

      {/* Giao diện cảm xúc (HUD) */}
      <HealingHUDControls />
    </div>
  );
};
