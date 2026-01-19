// FILE: src/services/neovanaDashboardService.ts

import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { CareerDashboard } from "../types/CareerDashboard";
import { callGeminiServer } from "./gemini";

export { callGeminiServer as getGeminiResponse };

/* ================= UTILS ================= */

/** Clamp giá trị về 0–100 */
function clamp01_100(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

/**
 * Chuẩn hoá fitScore từ Gemini về 0–100 tuyệt đối
 * - 0..1   → *100
 * - 0..10  → *10
 * - >100   → clamp
 */
function normalizeFitScore(raw: any): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;

  if (n > 0 && n <= 1) return clamp01_100(n * 100);
  if (n > 1 && n <= 10) return clamp01_100(n * 10);

  return clamp01_100(n);
}

/* ================= MAIN ================= */

export const generateCareerDashboard = async (
  userId: string,
  formData?: {
    strengths: string;
    interests: string;
    personality: string;
    dreamJob: string;
  }
): Promise<CareerDashboard> => {
  /* ===== 1. LOAD DATA ===== */
  const skillsSnap = await getDocs(
    query(collection(db, "userSkills"), where("userId", "==", userId))
  );
  const certificatesSnap = await getDocs(
    query(collection(db, "userCertificates"), where("userId", "==", userId))
  );
  const resultsSnap = await getDocs(
    query(collection(db, "learningResults"), where("userId", "==", userId))
  );

  const skills = skillsSnap.docs.map((d) => d.data());
  const certificates = certificatesSnap.docs.map((d) => d.data());
  const results = resultsSnap.docs.map((d) => d.data());

  /* ===== 2. PROMPT ===== */
  const prompt = `
Bạn là cố vấn hướng nghiệp cho học sinh THPT.

Phân tích dữ liệu sau:
- Thế mạnh: ${formData?.strengths || ""}
- Sở thích: ${formData?.interests || ""}
- Tính cách: ${formData?.personality || ""}
- Nghề mơ ước: ${formData?.dreamJob || ""}
- Kỹ năng: ${JSON.stringify(skills)}
- Chứng chỉ: ${JSON.stringify(certificates)}
- Kết quả học tập: ${JSON.stringify(results)}

YÊU CẦU BẮT BUỘC:
- fitScore là MỨC ĐỘ PHÙ HỢP TUYỆT ĐỐI (0–100)
- Mỗi nghề đánh giá độc lập
- KHÔNG chia theo tổng
- KHÔNG dùng % tương đối

Trả JSON CareerDashboard gồm:
- careers: name, fitScore, reason, preparationSteps
- skillsToImprove
- certificatesToAdd
- subjectsToFocus
- title, summary, createdAt (ISO)

Chỉ trả JSON hợp lệ.
`;

  /* ===== 3. CALL GEMINI ===== */
  const responseText = await callGeminiServer(prompt);
  const cleanedText = responseText.replace(/```json|```/g, "").trim();

  try {
    const dashboard: CareerDashboard = JSON.parse(cleanedText);

    /* ===== 4. CLEAN CAREERS ===== */
    dashboard.careers = (dashboard.careers || [])
      .map((c: any) => ({
        ...c,
        fitScore: normalizeFitScore(c.fitScore),
      }))
      .sort((a: any, b: any) => b.fitScore - a.fitScore);

    /* ===== 5. CLEAN SKILLS TO IMPROVE ===== */
    dashboard.skillsToImprove = (dashboard.skillsToImprove || [])
      .map((s: any) => ({
        name: s.name || s.skill || "Kỹ năng cần cải thiện",
        priority: Number(s.priority ?? s.importance ?? 0),
        priorityRatio: Number(s.priorityRatio ?? s.ratio ?? 0),
        reason: s.reason || s.explanation || "",
      }))
      .filter((s: any) => s.name);

    /* ===== 6. CLEAN CERTIFICATES ===== */
    dashboard.certificatesToAdd = (dashboard.certificatesToAdd || [])
      .map((c: any) => ({
        name: c.name || c.certificate || "Chứng chỉ đề xuất",
        priority: Number(c.priority ?? 0),
        priorityRatio: Number(c.priorityRatio ?? 0),
        relevance: c.relevance || "",
        source: c.source || "",
        reason: c.reason || "",
      }));

    /* ===== 7. CLEAN SUBJECTS ===== */
    dashboard.subjectsToFocus = (dashboard.subjectsToFocus || [])
      .map((s: any) => ({
        name: s.name || s.subject || "Môn học",
        score: Number(s.score ?? 0),
        priority: Number(s.priority ?? 0),
        priorityRatio: Number(s.priorityRatio ?? 0),
        reason: s.reason || "",
        recommendation: s.recommendation || "",
      }));

    /* ===== 8. METADATA ===== */
    dashboard.userId = userId;
    dashboard.createdAt = new Date().toISOString();

    return dashboard;
  } catch (e) {
    console.error("❌ Không parse được JSON từ Gemini:\n", cleanedText);
    throw new Error("Kết quả từ Gemini không hợp lệ");
  }
};
