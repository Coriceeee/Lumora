// src/app/services/learningResultService.ts

import { db } from "../firebase/firebase";
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

export async function getAllLearningResults(userId?: string): Promise<LearningResult[]> {
  try {
    if (userId) {
      const q = query(learningResultsCollection, where("userId", "==", userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as LearningResult)
      );
    } else {
      console.warn("⚠️ getAllLearningResults: userId không có, trả về mảng rỗng.");
      return [];
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy tất cả LearningResults:", error);
    return [];
  }
}

export async function getLearningResultsByUser(userId?: string): Promise<LearningResult[]> {
  if (!userId) {
    console.warn("⚠️ getLearningResultsByUser: userId undefined, trả về mảng rỗng.");
    return [];
  }

  try {
    const q = query(learningResultsCollection, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as LearningResult)
    );
  } catch (error) {
    console.error("❌ Lỗi khi truy vấn getLearningResultsByUser:", error);
    return [];
  }
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
const API_KEY = "AIzaSyCkCmNGA5DcO_OJ66e4oswZgszlcpBazXE";

/**
 * Gọi API Gemini để phân tích dữ liệu học tập, trả về kết quả dạng text
 */
export const callGeminiForDashboard = async (prompt: string): Promise<string> => {
  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 512,
          candidateCount: 1,
          topP: 0.95,
          topK: 40,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Gemini API error:", data);
      throw new Error(data.error?.message || "Lỗi không xác định từ Gemini");
    }

    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "(Không có phản hồi)"
    );
  } catch (error) {
    console.error("Gemini API exception:", error);
    throw error;
  }
};

/**
 * Tạo prompt phân tích kết quả học tập để gọi AI Gemini
 */
function buildPromptFromResults(results: LearningResult[]): string {
  const grouped: Record<string, Record<string, number>> = {};

  results.forEach((r) => {
    const subject = r.subjectName ?? "Không rõ môn";
    const termLabel = r.termLabel || "Không rõ học kỳ";
    if (!grouped[subject]) grouped[subject] = {};
    grouped[subject][termLabel] = r.score;
  });

  // Thứ tự các mốc học kỳ
  const termOrder = ["Giữa HK1", "Cuối HK1", "Giữa HK2", "Cuối HK2"];

  const lines = Object.entries(grouped).map(([subject, scores]) => {
    const scoreLine = termOrder
      .map((term) => `${term}: ${scores[term] ?? "-"}`)
      .join(", ");
    return `- ${subject}: ${scoreLine}`;
  });

  return `
Đây là dữ liệu điểm của học sinh theo từng học kỳ:
${lines.join("\n")}

Hãy phân tích theo mẫu JSON dưới đây và chỉ TRẢ VỀ JSON THUẦN TÚY (KHÔNG giải thích, KHÔNG markdown, KHÔNG comment):

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
  "overallSummary": "Tổng kết ngắn gọn toàn bộ kết quả"
}`;
}

/**
 * Lấy phân tích JSON từ Gemini dựa trên dữ liệu học tập
 */
export const getGeminiAnalysis = async (results: LearningResult[]) => {
  if (results.length === 0) throw new Error("Không có dữ liệu học tập");

  const prompt = buildPromptFromResults(results);
  const responseText = await callGeminiForDashboard(prompt);

  // Xử lý loại bỏ ký tự markdown nếu có
  const cleanedText = responseText.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleanedText);
  } catch (e) {
    console.error("❌ Không thể parse JSON từ Gemini:\n", cleanedText);
    throw new Error("Kết quả từ Gemini không phải JSON hợp lệ");
  }
};

// --- XỬ LÝ DỮ LIỆU CHO BIỂU ĐỒ ---

export async function getLearningResultsBySubjects(userId?: string) {
  if (!userId) {
    console.warn("⚠️ getLearningResultsBySubjects: userId undefined, trả về mảng rỗng.");
    return [];
  }

  try {
    const q = query(collection(db, "learningResults"), where("userId", "==", userId));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => doc.data()) as LearningResult[];

    // Lọc 3 môn chính: Toán, Văn, Anh
    return data.filter((result) =>
      ["toan", "van", "anh"].includes(result.subjectCode)
    );
  } catch (error) {
    console.error("❌ Lỗi khi lấy getLearningResultsBySubjects:", error);
    return [];
  }
}

const convertCodeToName = (code: string): string => {
  switch (code) {
    case "toan":
      return "Toán";
    case "van":
      return "Văn";
    case "anh":
      return "Anh";
    default:
      return code;
  }
};

// Kiểu dữ liệu có index signature cho biểu đồ
type ChartDataItem = {
  name: string;
  [key: string]: any;
};

export function generateTrendChartData(results: LearningResult[]): ChartDataItem[] {
  const chartData: ChartDataItem[] = [
    { name: "KTTX" },
    { name: "Giữa kỳ" },
    { name: "Cuối kỳ" },
  ];

  results.forEach((result) => {
    const subject = convertCodeToName(result.subjectCode);
    result.assessments?.forEach((assessment: { type: string; score: any }) => {
      const index = chartData.findIndex((item) => item.name === assessment.type);
      if (index !== -1) {
        chartData[index][subject] = assessment.score;
      }
    });
  });

  return chartData;
}
