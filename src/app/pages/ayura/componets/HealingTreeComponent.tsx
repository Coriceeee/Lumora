import React, { useEffect, useRef } from "react";
import { useAyura } from "../AyuraCoreProvider";

export const HealingTreeComponent: React.FC = () => {
  const { state } = useAyura();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 300, 300);

    // Thân cây (phát triển theo level)
    const trunkHeight = 80 + state.tree.level * 4; // Tăng chiều cao thân cây theo level
    ctx.fillStyle = "#7b3f00";
    ctx.fillRect(145, 150, 10, trunkHeight); // Vẽ thân cây

    // Tán cây (phát triển theo số lá)
    const leaves = state.tree.leaves;
    const green = Math.min(255, 100 + leaves * 3);  // Màu lá thay đổi theo số lá
    ctx.fillStyle = `rgb(${green}, ${200 - leaves / 2}, ${100})`;
    ctx.beginPath();
    ctx.arc(150, 130, 50 + leaves / 5, 0, Math.PI * 2);  // Tán lá mở rộng
    ctx.fill();

    // Hoa phượng (vẽ hoa dựa trên số lượng hoa)
    for (let i = 0; i < state.tree.flowers; i++) {
      const x = 150 + Math.sin(i) * 40;  // Xác định vị trí hoa phượng
      const y = 130 - Math.cos(i) * 40;  // Y xác định vị trí hoa phượng
      ctx.fillStyle = "#ff4500";  // Màu hoa phượng
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);  // Vẽ hoa
      ctx.fill();
    }
  }, [state.tree]);  // Cập nhật lại khi trạng thái cây thay đổi

  return (
    <div className="p-4 border rounded-2xl bg-white/70 shadow-md">
      <h3 className="text-lg font-semibold mb-2">🌳 Cây chữa lành</h3>
      <canvas ref={canvasRef} width={300} height={300} className="border rounded-xl bg-sky-50" />
      <p className="text-sm text-center mt-2 text-gray-600">
        Level {state.tree.level} • Lá {state.tree.leaves} • Hoa {state.tree.flowers}
      </p>
    </div>
  );
};
