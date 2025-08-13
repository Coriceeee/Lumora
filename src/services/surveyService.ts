import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { Survey, SurveyQuestion } from "../types/Survey";

const surveyCollection = collection(db, "surveys");

// Lấy toàn bộ khảo sát
export const getAllSurveys = async (): Promise<Survey[]> => {
  const snapshot = await getDocs(surveyCollection);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
    } as Survey;
  });
};

// Thêm khảo sát mới
export const addSurvey = async (survey: Survey) => {
  await addDoc(surveyCollection, {
    ...survey,
    createdAt: survey.createdAt || new Date(),
  });
};

// Xóa khảo sát theo id
export const deleteSurvey = async (id: string) => {
  await deleteDoc(doc(db, "surveys", id));
};

// Gọi Gemini AI để tạo 10 câu hỏi khảo sát trắc nghiệm, có tham số userDescription để cá nhân hóa câu hỏi
export const generateSurveyQuestions = async (
  existingTitles: string[],
  userDescription: string
): Promise<SurveyQuestion[]> => {
  const prompt = `
Bạn là chuyên gia tư vấn hướng nghiệp cho học sinh THPT.  
Hãy tạo danh sách 10 câu hỏi khảo sát cá nhân dạng TRẮC NGHIỆM.  
Mỗi câu có mảng "options" gồm 3-6 lựa chọn, trong đó có thể có tối đa 2 câu có lựa chọn cuối là "Khác (vui lòng ghi rõ)" để người trả lời tự điền.  
Các câu hỏi phải xoay quanh 6 nhóm chủ đề:  
1. Môn học yêu thích  
2. Tổ hợp môn học  
3. Sở thích nghề nghiệp  
4. Tính cách học tập  
5. Kỹ năng mềm mong muốn phát triển  
6. Mục tiêu nghề nghiệp và học tập dài hạn  

Ngoài ra, bạn cần dựa thêm vào mô tả khảo sát sau để cá nhân hóa câu hỏi:  
"${userDescription}"  

Yêu cầu:  
- Mỗi nhóm chủ đề có ít nhất 1 câu hỏi, tổng 10 câu hỏi.  
- Loại bỏ những câu hỏi có tiêu đề trùng với danh sách sau: ${JSON.stringify(existingTitles)}.  
- Trả về kết quả dạng JSON mảng, mỗi phần tử gồm:  
  {  
    "id": "q1",  
    "text": "Nội dung câu hỏi",  
    "options": ["Lựa chọn 1", "Lựa chọn 2", ...] // luôn có options, không để null hoặc bỏ qua  
  }  
- KHÔNG trả câu hỏi mở (options luôn có), nhưng được phép có tối đa 2 câu có lựa chọn cuối là "Khác (vui lòng ghi rõ)" để người dùng tự điền.  
- KHÔNG trả thêm bất cứ nội dung nào ngoài JSON.  
- Các câu hỏi trong khảo sát này không được trùng nhau (về text) và không trùng với các câu đã tồn tại trong danh sách.  
`;

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCkCmNGA5DcO_OJ66e4oswZgszlcpBazXE",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1024,
            topP: 0.95,
            topK: 40,
          },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Gemini API lỗi:", data);
      throw new Error(data.error?.message || "Lỗi từ Gemini API");
    }

    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Không tìm thấy JSON hợp lệ trong phản hồi AI");

    let questionsRaw = JSON.parse(jsonMatch[0]) as Array<{
      id?: string;
      text: string;
      options: string[];
    }>;

    // Loại bỏ câu hỏi trùng existingTitles và trùng text trong mảng (unique)
    const seen = new Set<string>();
    const filteredQuestions = questionsRaw.filter((q) => {
      if (existingTitles.includes(q.text)) return false;
      if (seen.has(q.text)) return false;
      seen.add(q.text);
      return true;
    });

    // Đảm bảo mỗi câu hỏi có options và options >= 3
    const questions: SurveyQuestion[] = filteredQuestions
      .filter((q) => Array.isArray(q.options) && q.options.length >= 3)
      .map((q, idx) => ({
        id: q.id || `q${idx + 1}`,
        text: q.text,
        options: q.options,
      }));

    return questions;
  } catch (error) {
    console.error("Lỗi khi gọi Gemini tạo câu hỏi khảo sát:", error);
    // fallback trả về 10 câu hỏi mẫu trắc nghiệm
    return Array.from({ length: 10 }, (_, i) => ({
      id: `q${i + 1}`,
      text: `Câu hỏi trắc nghiệm mẫu số ${i + 1}`,
      options: ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C"],
    }));
  }
};

// Tạo tên khảo sát từ câu trả lời
export const generateSurveyTitleFromAnswers = async (
  answers: Record<string, string>
): Promise<string> => {
  const prompt = `
Bạn là AI giúp đặt tên khảo sát dựa trên câu trả lời của học sinh.  
Dưới đây là câu trả lời với định dạng JSON:  
${JSON.stringify(answers, null, 2)}

Hãy tạo một tiêu đề khảo sát ngắn gọn, súc tích, phản ánh được nội dung câu trả lời.
Chỉ trả về 1 câu duy nhất, không giải thích, không ký tự ngoài văn bản thuần.
`;

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCkCmNGA5DcO_OJ66e4oswZgszlcpBazXE",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 50,
            topP: 0.95,
            topK: 20,
          },
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Gemini API lỗi:", data);
      throw new Error(data.error?.message || "Lỗi từ Gemini API");
    }

    const title = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    return title;
  } catch (error) {
    console.error("Lỗi khi tạo tên khảo sát:", error);
    return "Khảo sát tự động từ câu trả lời";
  }
};
