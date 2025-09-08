// FILE: src/services/neovanaDashboardService.ts
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { CareerDashboard } from "../types/CareerDashboard";
import { callGeminiServer } from "./gemini";
import { callGeminiForDashboard } from "./geminiDashboardService";
export { callGeminiServer as getGeminiResponse };

export const generateCareerDashboard = async (userId: string, formData?: { strengths: string; interests: string; personality: string; dreamJob: string; }) => {
  // 1. Thu thập dữ liệu từ các collection
  const skillsSnap = await getDocs(query(collection(db, "userSkills"), where("userId", "==", userId)));
  const certificatesSnap = await getDocs(query(collection(db, "userCertificates"), where("userId", "==", userId)));
  const resultsSnap = await getDocs(query(collection(db, "learningResults"), where("userId", "==", userId)));

  const skills = skillsSnap.docs.map((d) => d.data());
  const certificates = certificatesSnap.docs.map((d) => d.data());
  const results = resultsSnap.docs.map((d) => d.data());

  // 2. Xây dựng prompt gửi sang Gemini
  const prompt = `
Bạn là cố vấn nghề nghiệp. Dữ liệu của học sinh:
- Thế mạnh: ${formData?.strengths || ""}
- Sở thích: ${formData?.interests || ""}
- Tính cách: ${formData?.personality || ""}
- Công việc mong muốn: ${formData?.dreamJob || ""}
- Kỹ năng hiện có: ${JSON.stringify(skills)}
- Chứng chỉ đã có: ${JSON.stringify(certificates)}
- Kết quả học tập: ${JSON.stringify(results)}

Hãy phân tích và trả về JSON theo cấu trúc CareerDashboard với:
- 5 nghề nghiệp (careers) kèm % phù hợp, lý do, bước chuẩn bị.
- skillsToImprove (tên, priority, priorityRatio, reason).
- certificatesToAdd (tên, priority, priorityRatio, relevance, source).
- subjectsToFocus (nếu học sinh chưa hoàn thành 12, priority, priorityRatio, reason, recommendation).
- title, summary, createdAt (ISO string).
Chỉ trả JSON hợp lệ.
  `;

  // 3. Gọi Gemini
  const responseText = await callGeminiForDashboard(prompt);

  const cleanedText = responseText.replace(/```json|```/g, "").trim();

  try {
    const dashboard: CareerDashboard = JSON.parse(cleanedText);
    return dashboard;
  } catch (e) {
    console.error("❌ Không thể parse JSON từ Gemini:\n", cleanedText);
    throw new Error("Kết quả từ Gemini không phải JSON hợp lệ");
  }

};

