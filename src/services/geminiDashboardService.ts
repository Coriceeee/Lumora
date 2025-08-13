// learningResultService.ts

import { db } from "../firebase/firebase"; // Sửa đường dẫn theo dự án bạn
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { LearningResult } from "../types/LearningResult";

/**
 * Collection Firestore lưu kết quả học tập
 */
const learningResultsCollection = collection(db, "learningResults");

// --- CRUD LearningResult ---

export async function getAllLearningResults(): Promise<LearningResult[]> {
  const snapshot = await getDocs(learningResultsCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as LearningResult));
}

export async function getLearningResultsByUser(userId: string): Promise<LearningResult[]> {
  if (!userId) throw new Error("userId không hợp lệ");
  const q = query(learningResultsCollection, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as LearningResult));
}

export async function addLearningResult(data: LearningResult): Promise<string> {
  if (!data.userId) throw new Error("userId là bắt buộc");
  const docRef = await addDoc(learningResultsCollection, {
    ...data,
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function updateLearningResult(id: string, data: Partial<LearningResult>): Promise<void> {
  const docRef = doc(db, "learningResults", id);
  await updateDoc(docRef, data);
}

export async function deleteLearningResult(id: string): Promise<void> {
  const docRef = doc(db, "learningResults", id);
  await deleteDoc(docRef);
}

// --- Gemini API ---

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

/**
 * ⚠️ Không để lộ API KEY trong production,
 * đây chỉ demo, bạn nên dùng env var hoặc server proxy bảo mật
 */
const API_KEY = "AIzaSyCkCmNGA5DcO_OJ66e4oswZgszlcpBazXE";

/**
 * Gọi API Gemini với prompt đầu vào
 * @param prompt chuỗi prompt gửi cho Gemini
 * @returns phản hồi dạng text raw
 */
export async function callGeminiForDashboard(prompt: string): Promise<string> {
  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Gemini API error:", data);
      throw new Error(data.error?.message || "Lỗi không xác định từ Gemini");
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "(Không có phản hồi)";
  } catch (error) {
    console.error("Gemini API exception:", error);
    throw error;
  }
}

/**
 * Tạo prompt phân tích năng lực học tập từ dữ liệu điểm thực tế
 * @param results mảng điểm học tập
 * @returns chuỗi prompt
 */
export function buildLearningAnalysisPrompt(results: LearningResult[]): string {
  const grouped: Record<string, Record<string, number>> = {};

  results.forEach((r) => {
    const subjectName = r.subjectName?.trim() || "Không rõ môn";
    if (!grouped[subjectName]) grouped[subjectName] = {};
    grouped[subjectName][r.termLabel] = r.score;
  });

  const termOrder = ["Giữa HK1", "Cuối HK1", "Giữa HK2", "Cuối HK2"];

  const lines = Object.entries(grouped).map(([subject, scores]) => {
    const scoreLine = termOrder
      .map((term) =>
        scores[term] !== undefined ? scores[term].toFixed(1) : "-"
      )
      .join(", ");
    return `- ${subject}: ${scoreLine}`;
  });

  return `
Đây là dữ liệu điểm của học sinh theo từng mốc thời gian:
${lines.join("\n")}

Yêu cầu:
- Phân tích xu hướng điểm từng môn: "Tăng", "Giảm", "Ổn định", hoặc "Dao động"
- Nêu điểm mạnh nổi bật
- Nêu điểm yếu cần cải thiện
- Đưa ra gợi ý cải thiện cho từng môn

Chỉ TRẢ VỀ duy nhất KẾT QUẢ dạng JSON thuần túy theo cấu trúc sau, KHÔNG giải thích, KHÔNG markdown, KHÔNG comment:

{
  "subjectInsights": [
    {
      "subjectName": "Toán",
      "trend": "Tăng / Giảm / Dao động / Ổn định",
      "strength": "Thế mạnh nổi bật",
      "weakness": "Điểm cần cải thiện",
      "suggestion": "Gợi ý cải thiện"
    }
  ],
  "radarChartData": [
    { "subject": "Toán", "score": 8.0 }
  ],
  "trendChartData": [
    { "name": "Giữa HK1", "Toán": 8, "Văn": 6, "Anh": 9 }
  ],
  "overallSummary": "Tóm tắt ngắn gọn toàn bộ kết quả học tập"
}

Nếu không có dữ liệu hoặc không thể phân tích, trả về JSON với các trường rỗng.
`;
}

/**
 * Gọi Gemini phân tích năng lực học tập
 * @param results mảng LearningResult
 * @returns Promise với JSON phân tích parsed
 */
export async function getGeminiAnalysisFromResults(results: LearningResult[]) {
  if (results.length === 0) throw new Error("Không có dữ liệu học tập");

  const prompt = buildLearningAnalysisPrompt(results);

  const responseText = await callGeminiForDashboard(prompt);

  // Loại bỏ markdown code block nếu có
  const cleanedText = responseText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("❌ Không thể parse JSON từ Gemini:\n", cleanedText);
    throw new Error("Kết quả từ Gemini không phải JSON hợp lệ");
  }
}
