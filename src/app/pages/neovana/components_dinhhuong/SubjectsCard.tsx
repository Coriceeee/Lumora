import React from "react";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { SubjectToFocus } from "../../../../types/CareerDashboard";


export interface SubjectsCardProps {
  subjects: SubjectToFocus[];
}

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
        stroke="url(#gradient)"
        strokeWidth="2"
        points={points}
      />
      <defs>
        <linearGradient id="gradient" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const SubjectsCard: React.FC<SubjectsCardProps> = ({ subjects }) => {
  if (!subjects || subjects.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-gray-50 text-gray-500 text-center">
        Chưa có dữ liệu môn học cần tập trung.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-white shadow-lg hover:shadow-xl transition-all ease-in-out duration-300">
      {subjects.map((s, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.1 }}
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
        </motion.div>
      ))}
    </div>
  );
};

export default SubjectsCard;
