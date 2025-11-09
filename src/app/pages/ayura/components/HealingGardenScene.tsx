import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { useAyuraCore } from "../AyuraCoreProvider";
import { HealingSkyComponent } from "./HealingSkyComponent";
import { HealingGroundComponent } from "./HealingGroundComponent";
import { HealingHUDControls } from "./HealingHUDControls";
import { VoxelPhuongTree } from "./VoxelPhuongTree";
import { VoxelPetalSystem } from "./VoxelPetalSystem";

// 🌅 Hàm tính giờ mặt trời mọc/lặn cơ bản (ước lượng, không dùng API ngoài)
function getSunTimes(latitude: number, longitude: number) {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  // Xấp xỉ declination của mặt trời theo ngày trong năm
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
  const [timeOfDay, setTimeOfDay] = useState(0.5); // 0 = bình minh, 1 = hoàng hôn (tương đối)

  // 🕒 Cập nhật timeOfDay dựa trên vị trí thực của người dùng (múi giờ, mặt trời mọc/lặn)
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

  // 🎨 Tính các chỉ số cảm xúc (valence, calmness, arousal) từ timeOfDay để hiệu ứng cây/ánh sáng
  const valence = THREE.MathUtils.lerp(-0.3, 0.9, timeOfDay);
  const calmness = 1 - Math.abs(0.5 - timeOfDay) * 1.8;
  const arousal = 0.4 * Math.sin(timeOfDay * Math.PI);
  const emotions = { valence, calmness, arousal };

  // Màu cánh hoa thay đổi nhẹ theo thời gian (sáng sớm đỏ đậm, trưa đỏ cam)
  const petalColor = new THREE.Color().setHSL(
    THREE.MathUtils.lerp(0.0, 0.04, timeOfDay),
    0.8,
    0.6
  );

  return (
    <div className="relative h-full w-full bg-[#f8f6f3] rounded-2xl overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [5.5, 4.8, 7.5], fov: 45 }}
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
        {/* Nhóm cây và cánh hoa, đặt ở góc sân trường */}
        <group position={[-5, 0, -5]}>
          {/* Cây phượng voxel */}
          <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
            <VoxelPhuongTree emotions={emotions} />
          </Float>
          {/* Hệ thống cánh hoa voxel rơi (petals) */}
          <VoxelPetalSystem count={220} wind={emotions.arousal} color={petalColor} />
        </group>
        {/* Mặt đất */}
        <HealingGroundComponent />
        {/* Điều khiển camera (quay quanh cây, không cho pan) */}
        <OrbitControls target={[-5, 1.5, -5]} enablePan={false} />
      </Canvas>
      {/* Giao diện HUD cảm xúc (nếu có) */}
      <HealingHUDControls />
    </div>
  );
};
function useAyura(): { state: any; } {
  throw new Error("Function not implemented.");
}

