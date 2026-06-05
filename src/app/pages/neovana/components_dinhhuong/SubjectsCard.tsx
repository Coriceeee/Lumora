"use client";

import React from "react";
import { useTrail, animated } from "@react-spring/web";
import { BookOpen } from "lucide-react";
import { Box, Typography } from "@mui/material";
import { SubjectToFocus } from "@/types/CareerDashboard";

/* ===================== UTILS ===================== */

/** Ép số an toàn: string | number | undefined → number */
const toNumber = (value: unknown, fallback = 0): number => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

/**
 * Chuẩn hóa mức độ tập trung về thang 0 - 100.
 * Hỗ trợ cả hai dạng dữ liệu:
 * - 0.8  → 80
 * - 80   → 80
 */
const getFocusPercent = (priorityRatio?: unknown): number => {
  const ratio = toNumber(priorityRatio, 0);

  const percent = ratio <= 1 ? ratio * 100 : ratio;

  return Math.round(Math.max(0, Math.min(100, percent)));
};

/**
 * Nhãn mức độ ưu tiên dựa trên phần trăm cần tập trung.
 * Không dùng s.priority để tránh trường hợp nhãn bị ngược với %.
 */
const getPriorityLabel = (percent: number) => {
  if (percent >= 75) {
    return {
      text: "Rất ưu tiên",
      color: "#dc2626",
    };
  }

  if (percent >= 50) {
    return {
      text: "Ưu tiên",
      color: "#f59e0b",
    };
  }

  return {
    text: "Nền tảng",
    color: "#3b82f6",
  };
};

/* ===================== COMPONENT ===================== */

interface Props {
  subjects: SubjectToFocus[];
}

const SubjectsCard: React.FC<Props> = ({ subjects }) => {
  const trail = useTrail(subjects?.length || 0, {
    from: { opacity: 0, y: 14 },
    to: { opacity: 1, y: 0 },
    config: { tension: 240, friction: 22 },
  });

  /* ---------- EMPTY STATE ---------- */
  if (!subjects || subjects.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          borderRadius: 3,
          background: "#f8f9ff",
          textAlign: "center",
        }}
      >
        <Typography color="text.secondary" fontStyle="italic">
          🤖 AI đang tổng hợp dữ liệu môn học phù hợp.
        </Typography>
      </Box>
    );
  }

  /* ---------- MAIN RENDER ---------- */
  return (
    <Box
      sx={{
        p: 4,
        borderRadius: 4,
        background: "#fff",
        boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
      }}
    >
      <Typography variant="h6" fontWeight={800} mb={3}>
        📚 Môn học cần tập trung
      </Typography>

      <div className="grid gap-4 md:grid-cols-2">
        {trail.map((style, idx) => {
          const subject = subjects[idx];

          const percent = getFocusPercent(subject.priorityRatio);
          const label = getPriorityLabel(percent);

          return (
            <animated.div
              key={`${subject.name ?? "subject"}-${idx}`}
              style={{
                opacity: style.opacity,
                transform: style.y.to((y) => `translateY(${y}px)`),
              }}
            >
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid #e5e7eb",
                  background: "#fafafa",
                }}
              >
                {/* ===== TÊN MÔN HỌC ===== */}
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <BookOpen size={18} color="#4f46e5" />

                  <Typography fontWeight={700}>
                    {subject.name || "Môn học"}
                  </Typography>
                </Box>

                {/* ===== MỨC ĐỘ ƯU TIÊN ===== */}
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Ưu tiên:{" "}
                  <strong style={{ color: label.color }}>
                    {label.text} ({percent}%)
                  </strong>
                </Typography>

                {/* ===== LÝ DO ===== */}
                {subject.reason && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    ⚠ <strong>Lý do:</strong> {subject.reason}
                  </Typography>
                )}

                {/* ===== GỢI Ý ===== */}
                {subject.recommendation && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    💡 <strong>Gợi ý:</strong> {subject.recommendation}
                  </Typography>
                )}
              </Box>
            </animated.div>
          );
        })}
      </div>
    </Box>
  );
};

export default SubjectsCard;