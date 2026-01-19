"use client";

import React from "react";
import { useTrail, animated } from "@react-spring/web";
import { BookOpen } from "lucide-react";
import { Box, Typography } from "@mui/material";
import { SubjectToFocus } from "@/types/CareerDashboard";

/* ===================== UTILS ===================== */

/** Ép số an toàn (string | number | undefined → number) */
const toNumber = (v: any, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

/** % cần tập trung từ priorityRatio (0–1 → 0–100) */
const getFocusPercent = (priorityRatio?: any): number => {
  const ratio = toNumber(priorityRatio, 0);
  return Math.round(Math.max(0, Math.min(1, ratio)) * 100);
};

/** Nhãn mức độ ưu tiên */
const getPriorityLabel = (priority?: any) => {
  const p = toNumber(priority, 1);

  if (p >= 3) return { text: "Rất ưu tiên", color: "#dc2626" };
  if (p === 2) return { text: "Ưu tiên", color: "#f59e0b" };
  return { text: "Nền tảng", color: "#3b82f6" };
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
          const s = subjects[idx];

          // ===== FIX CHUẨN 100% =====
          const percent = getFocusPercent(s.priorityRatio);
          const label = getPriorityLabel(s.priority);

          return (
            <animated.div
              key={`${s.name ?? "subject"}-${idx}`}
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
                    {s.name || "Môn học"}
                  </Typography>
                </Box>

                {/* ===== % CẦN TẬP TRUNG ===== */}
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Ưu tiên:{" "}
                  <strong style={{ color: label.color }}>
                    {label.text} ({percent}%)
                  </strong>
                </Typography>

                {/* ===== LÝ DO ===== */}
                {s.reason && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    ⚠ <strong>Lý do:</strong> {s.reason}
                  </Typography>
                )}

                {/* ===== GỢI Ý ===== */}
                {s.recommendation && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    💡 <strong>Gợi ý:</strong> {s.recommendation}
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
