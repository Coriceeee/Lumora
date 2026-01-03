// FILE: src/app/pages/vireya/components/SubjectsCard.tsx
"use client";

import React from "react";
import { useTrail, animated } from "@react-spring/web";
import { BookOpen } from "lucide-react";
import { Typography } from "@mui/material"; // ✅ FIX LỖI Ở ĐÂY
import { SubjectToFocus } from "@/types/CareerDashboard";


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
      <polyline
        fill="none"
        stroke="url(#subj-gradient)"
        strokeWidth="2"
        points={points}
      />
      <defs>
        <linearGradient id="subj-gradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#0ea5e9" />
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
  // Spring trail animation
  const trail = useTrail(subjects?.length || 0, {
    from: { opacity: 0, y: 18 },
    to: { opacity: 1, y: 0 },
    config: { tension: 220, friction: 20 },
  });

  if (!subjects || subjects.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-white shadow text-center text-gray-500">
        <Typography sx={{ color: "text.secondary", fontStyle: "italic" }}>
  🤖 AI đang tổng hợp dữ liệu môn học phù hợp.
  <br />
  Bạn có thể bắt đầu từ các môn cốt lõi liên quan đến ngành đã chọn.
</Typography>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 p-5 rounded-3xl bg-gradient-to-br from-indigo-50 to-white shadow-lg hover:shadow-xl transition-all duration-300">
      {trail.map((style, idx) => {
        const s = subjects[idx];
        const ratio = Number(s.priorityRatio) || 0;
        const ratioColor =
          ratio >= 80
            ? "#22c55e"
            : ratio >= 60
            ? "#3b82f6"
            : ratio >= 40
            ? "#f59e0b"
            : "#ef4444";

        return (
          <animated.div
            key={idx}
            style={{
              opacity: style.opacity,
              transform: style.y.to((y) => `translateY(${y}px)`),
            }}
            className="p-4 rounded-2xl bg-white/70 shadow-md hover:shadow-lg border border-indigo-100 transition cursor-pointer"
          >
            {/* Title */}
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="font-semibold text-gray-800">{s.name}</h3>
            </div>

            {/* Priority + Sparkline */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-600">
                Ưu tiên: {s.priority}{" "}
                <span className="font-semibold" style={{ color: ratioColor }}>
                  ({ratio}%)
                </span>
              </span>

              <Sparkline values={[ratio]} />
            </div>

            {/* Reasons + Recommendations */}
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
