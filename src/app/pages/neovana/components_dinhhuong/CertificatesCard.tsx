"use client";

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Box,
} from "@mui/material";
import { CertificateToAdd } from "@/types/CareerDashboard";

/* ================== TYPES ================== */

interface Props {
  certificates: CertificateToAdd[];
}

/* ================== UTILS ================== */

/**
 * Normalize priority về 1–3
 * - undefined / null / NaN → 2 (mặc định: nên bổ sung)
 */
const normalizePriority = (v: any): number => {
  const n = Number(v);
  if (!Number.isFinite(n)) return 2;
  return Math.max(1, Math.min(3, Math.round(n)));
};

/**
 * Chứng chỉ KHÔNG dùng %
 * → dùng mức độ cần thiết
 */
const getCertLevel = (
  priority: number,
  relevance?: string
): { text: string; color: string } => {
  if (relevance === "Cao" || priority === 1) {
    return { text: "Rất cần thiết", color: "#dc2626" };
  }
  if (priority === 2) {
    return { text: "Nên bổ sung", color: "#f59e0b" };
  }
  return { text: "Tham khảo", color: "#3b82f6" };
};

/* ================== COMPONENT ================== */

export default function CertificatesCard({ certificates }: Props) {
  // DEBUG khi cần
  // console.log("[CertificatesCard] certificates =", certificates);

  /**
   * ❗ FIX QUAN TRỌNG
   * Chỉ cần có name là hiển thị
   * Không filter gắt theo reason / relevance
   */
  const validCertificates = (certificates || []).filter(
    (c) => !!c?.name
  );

  /* ---------- EMPTY STATE ---------- */
  if (!validCertificates || validCertificates.length === 0) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Chứng chỉ cần bổ sung
          </Typography>
          <Typography color="text.secondary" fontStyle="italic">
            🤖 AI chưa đề xuất chứng chỉ cụ thể cho ngành này.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  /* ---------- MAIN RENDER ---------- */
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Chứng chỉ cần bổ sung
        </Typography>

        <Stack spacing={2}>
          {validCertificates.map((c, i) => {
            // ✅ FIX: normalize priority
            const normalizedPriority = normalizePriority(c.priority);
            const level = getCertLevel(
              normalizedPriority,
              typeof c.relevance === "string" ? c.relevance : undefined
            );

            return (
              <Box
                key={i}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                }}
              >
                {/* ---------- TITLE ---------- */}
                <Typography fontWeight={600}>
                  {c.name || "Chứng chỉ"}
                </Typography>

                {/* ---------- LEVEL ---------- */}
                <Chip
                  label={level.text}
                  size="small"
                  sx={{
                    mt: 1,
                    backgroundColor: level.color,
                    color: "#fff",
                    fontWeight: 600,
                  }}
                />

                {/* Hint khi AI chưa trả priority */}
                {(c.priority === undefined || c.priority === null) && (
                  <Typography
                    variant="caption"
                    sx={{ display: "block", mt: 0.5, color: "#9ca3af" }}
                  >
                    (AI đang ước lượng mức độ cần thiết)
                  </Typography>
                )}

                {/* ---------- REASON ---------- */}
                {c.reason && (
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, color: "#374151" }}
                  >
                    <strong>Lý do:</strong> {c.reason}
                  </Typography>
                )}

                {/* ---------- SOURCE ---------- */}
                {c.source && (
                  <Typography
                    variant="caption"
                    sx={{ display: "block", mt: 0.5, color: "#6b7280" }}
                  >
                    Nguồn: {c.source}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}
;
