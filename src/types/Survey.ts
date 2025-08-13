export interface SurveyQuestion {
  [x: string]: any;
  id: string;
  text: string;
  options?: string[];
  answer?: string; // câu trả lời của user
  otherText?: string; // thêm trường này để lưu text khi chọn "Khác"
}

export interface Survey {
  id?: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  createdAt: Date;
}
