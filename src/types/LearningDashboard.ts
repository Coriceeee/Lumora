// FILE: src/types/LearningDashboard.ts
import { Timestamp } from "firebase/firestore";

/**
 * Thang đo mức độ ưu tiên
 * - "percent" => giá trị 0..100
 * - "five" => giá trị 1..5
 */
export type SuggestionScale = "percent" | "five";

/**
 * Map linh hoạt cho các kiểu điểm/score mà dashboard hoặc AI có thể trả về.
 * Cho phép key tùy ý (ví dụ: "Thường xuyên", "TX", "thuongxuyen", "continuous", "midterm", "final"...)
 */
export type ScoreMap = Record<string, number | undefined>;

/**
 * Kiểu chuẩn hoá thông tin điểm cho từng môn trong importantSubjects
 * - Có các field đặt tên phổ biến nhưng cũng cho phép key tùy ý (ScoreMap)
 */
export interface SubjectScores extends ScoreMap {
  // các tên thường gặp (optional)
  "Thường xuyên"?: number;
  TX?: number;
  thuongxuyen?: number;
  "Giữa kỳ"?: number;
  GK?: number;
  giua_ky?: number;
  midterm?: number;
  "Cuối kỳ"?: number;
  CK?: number;
  cuoi_ky?: number;
  final?: number;

  // fallback / raw
  [x: string]: number | undefined;
}

/**
 * Một bản tóm tắt/insight cho từng môn (AI hoặc hệ thống sinh ra).
 * Rất nhiều trường optional để tương thích với output khác nhau.
 */
export interface SubjectInsight {
  id?: string;
  subjectName: string;

  // mô tả / phân tích
  trend?: string;
  strength?: string;
  weakness?: string;
  suggestion?: string;
  notes?: string;

  // các nguồn điểm raw (AI có thể trả scores, marks, examScores, results, score riêng)
  scores?: ScoreMap;
  marks?: ScoreMap;
  examScores?: ScoreMap;
  results?: any;
  // nếu có single numeric score
  score?: number;

  // metric tăng trưởng hay thống kê khác
  growthMetric?: number;

  // ưu tiên đề xuất (có thể 0..100 hoặc 1..5)
  suggestionPriority?: number;
  suggestionPriorityScale?: SuggestionScale;
  // chuẩn hoá luôn về 0..100 để hiển thị nhanh
  suggestionPriorityNormalized?: number;

  // metadata / nguồn / timestamp
  lastUpdated?: Timestamp | Date | string;
  source?: string;

  // Lưu bất kỳ trường lạ nào AI trả về — tránh lỗi khi parse
  raw?: Record<string, any>;

  // index signature: cho phép các trường bổ sung nếu cần
  [x: string]: any;
}

/**
 * Lưu tiến bộ cho từng môn (do UI ghi lại hoặc AI tính)
 */
export interface SubjectProgressItem {
  delta?: number; // last - prev
  percent?: number; // percent change OR normalized percent fallback (0..100)
  trendLabel?: string;
  last?: number;
  prev?: number;
  updatedAt?: Timestamp | Date | string;
  [x: string]: any;
}

/**
 * Cấu trúc chính LearningDashboard
 */
export interface LearningDashboard {
  // cho phép fields mở rộng (dễ tương thích khi lưu thêm meta từ AI)
  [x: string]: any;

  id: string;
  userId?: string;

  // Firestore Timestamp, Date, hoặc string (nếu từ API)
  createdAt?: Timestamp | Date | string;

  title?: string;
  summary?: string;

  // danh sách môn chủ chốt được chọn (chuỗi tên hoặc mã môn)
  selectedKeySubjects?: string[];

  // importantSubjects chứa bản đồ subjectName -> SubjectScores
  importantSubjects?: {
    subjects?: Record<string, SubjectScores>;
    overallStrengths?: string;
    overallWeaknesses?: string;
    learningAdvice?: string;
    [x: string]: any;
  };

  // Mảng insights do AI hoặc hệ thống sinh ra
  subjectInsights?: SubjectInsight[];

  // Lưu tiến bộ từng môn (UI có thể cập nhật)
  subjectProgress?: Record<string, SubjectProgressItem>;

  // Trường lưu lựa chọn cuối cùng (UI)
  lastSelected?: string;

  // Một số trường meta / raw để tương thích dữ liệu
  meta?: Record<string, any>;
  raw?: Record<string, any>;
}

/* ---------- Utility types (không bắt buộc) ---------- */

/**
 * Helper: normalized percent (0..100) và normalized score (0..10)
 */
export type NormalizedPercent = number; // expect 0..100
export type NormalizedScore = number; // expect 0..10
