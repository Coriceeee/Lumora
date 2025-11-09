// FILE: src/app/pages/vireya/components/SubjectsCard.tsx
// ✅ Version dùng React Spring (chuẩn ESLint, không còn Framer Motion)

import React from "react";
import { useTrail, animated } from "@react-spring/web";
import { BookOpen } from "lucide-react";
import { SubjectToFocus } from "../../../../types/CareerDashboard";

/* ------------------------- Mini Sparkline chart -------------------------- */
const Sparkline: React.FC<{ values?: number[] }> = ({ values = [] }) => {
  if (!values || values.length === 0) return null;

  const max = Math.max(...values);
  const min = Math.min(...values);
  const width = 100;
  const height = 28;
  const step = values.length > 1 ? width / (values.length - 1) : width;

  const points = values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / (max - min || 1)) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline fill="none" stroke="url(#gradient)" strokeWidth="2" points={points} />
      <defs>
        <linearGradient id="gradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/* -------------------------- Subjects Card list --------------------------- */
export interface SubjectsCardProps {
  subjects: SubjectToFocus[];
}

const SubjectsCard: React.FC<SubjectsCardProps> = ({ subjects }) => {
  // ✅ Hook phải được gọi luôn, không đặt sau early return
  const trail = useTrail(subjects?.length || 0, {
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    config: { tension: 210, friction: 18 },
  });

  // ✅ Kiểm tra rỗng ở phần render thay vì return sớm
  if (!subjects || subjects.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-gray-50 text-gray-500 text-center">
        Chưa có dữ liệu môn học cần tập trung.
        
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-white shadow-lg hover:shadow-xl transition-all ease-in-out duration-300">
      {trail.map((style, idx) => {
        const s = subjects[idx];
        return (
          <animated.div
            key={idx}
            style={{
              opacity: style.opacity,
              transform: style.y.to((y) => `translateY(${y}px)`),
            }}
            className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-white shadow hover:shadow-lg transition cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-800">{s.name}</h3>
            </div>

            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500 italic">
                Ưu tiên: {s.priority} ({s.priorityRatio}%)
              </span>
              <Sparkline values={[s.priorityRatio]} />
            </div>

            <ul className="text-sm text-gray-700 space-y-1">
              {s.reason && (
                <li>
                  <span className="font-medium text-red-500">⚠ Lý do:</span>{" "}
                  {s.reason}
                </li>
              )}
              {s.recommendation && (
                <li>
                  <span className="font-medium text-indigo-600">💡 Gợi ý:</span>{" "}
                  {s.recommendation}
                </li>
              )}
            </ul>
          </animated.div>
        );
      })}
    </div>
  );
};

export default SubjectsCard;
