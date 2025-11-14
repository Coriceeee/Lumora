// ✅ FILE: src/services/vireyaDashboardService.ts

import { db } from "../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { callGeminiForDashboard } from "./geminiDashboardService";
import { getAllScoreTypes } from "./scoreTypeService";
import { getAllSubjects } from "./subjectService";

// ✅ Hàm 1: Gọi Gemini để tạo dashboard
export const vireyaDashboardService = async (results: any[]) => {
  const subjects = await getAllSubjects();
  const scoreTypes = await getAllScoreTypes();
  const importantSubjects = ["Toán", "Ngữ Văn", "Tiếng Anh", "Tin Học"];
  const subjectData: Record<string, any> = {};

  results.forEach((item) => {
    const subject = subjects.find((sub) => sub.id === item.subjectId);
    const scoreType = scoreTypes.find((type) => type.id === item.scoreTypeId);
    if (subject && scoreType) {
      if (!subjectData[subject.name]) {
        subjectData[subject.name] = {};
      }
      subjectData[subject.name][scoreType.name] = item.score;
    }
  });

  const payload = {
    "Các môn quan trọng": importantSubjects.filter((m) => subjectData[m]),
    ...subjectData,
  };

  const prompt = `
Dưới đây là điểm học tập của học sinh này ở giữa học kỳ I lớp 10. Hãy:
1. Phân tích tổng quan học lực
2. Nhận diện ưu điểm và điểm cần cải thiện 
3. Gợi ý chiến lược học tập tổng thể 
4. Đánh giá và gợi ý chiến lược học tập cho các Môn Học Quan Trọng.
5. Phân tích từng môn theo các tiêu chí: xu hướng, điểm mạnh, điểm yếu, chiến lược cải thiện
6. Tóm gọn phân tích tổng quan lại thành 1 tiêu đề của bài phân tích ngày hôm đó

Dữ liệu điểm số:
${JSON.stringify(payload, null, 2)}

Trả kết quả chỉ trả về theo định dạng JSON chuẩn như sau:
{
  id: string;
  userId: string;
  createdAt: Timestamp;
  title: string;
  summary: string;

  importantSubjects: {
    subjects: {
      [subjectName: string]: {
        "Thường xuyên": number;
        "Giữa kỳ": number;
        "Cuối kỳ": number;
      };
    };
    overallStrengths: string;
    overallWeaknesses: string;
    learningAdvice: string;
  };

  subjectInsights: {
    subjectName: string;
    scores: {
      "Thường xuyên": number;
      "Giữa kỳ": number;
      "Cuối kỳ": number;
    };
    trend: string;
    strength: string;
    weakness: string;
    suggestion: string;    
  }[];
}`;

  const raw = await callGeminiForDashboard(prompt);

  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);

  if (!jsonMatch) {
    console.error("Không tìm thấy JSON hợp lệ trong phản hồi.");
    throw new Error("Kết quả từ AI không chứa JSON.");
  }

  let parsed: any;
  try {
    parsed = JSON.parse(jsonMatch[1]);
  } catch (err) {
    console.error("Lỗi khi parse JSON từ Gemini:", err);
    throw new Error("Kết quả từ AI không hợp lệ.");
  }

  return parsed;
};

// ✅ Hàm 2: Lấy danh sách dashboards từ Firestore cho mục "Định hướng phát triển"
export async function getVireyaDashboards(userId: string) {
  const q = query(collection(db, "dashboards"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}
