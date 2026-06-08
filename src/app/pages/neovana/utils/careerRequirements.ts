export interface CareerRequirement {
  subjects: Record<string, number>;
  skills: Record<string, number>;
}

export const careerRequirements: Record<string, CareerRequirement> = {
  "Công nghệ thông tin": {
    subjects: {
      Toán: 0.4,
      "Tin học": 0.35,
      "Tiếng Anh": 0.25,
    },
    skills: {
      logic: 0.3,
      problemSolving: 0.25,
      selfLearning: 0.2,
      teamwork: 0.15,
      communication: 0.1,
    },
  },

  "Trí tuệ nhân tạo": {
    subjects: {
      Toán: 0.4,
      "Tin học": 0.35,
      "Tiếng Anh": 0.25,
    },
    skills: {
      logic: 0.3,
      problemSolving: 0.25,
      selfLearning: 0.2,
      research: 0.15,
      communication: 0.1,
    },
  },

  "Khoa học dữ liệu": {
    subjects: {
      Toán: 0.45,
      "Tin học": 0.3,
      "Tiếng Anh": 0.25,
    },
    skills: {
      dataAnalysis: 0.3,
      logic: 0.25,
      problemSolving: 0.2,
      selfLearning: 0.15,
      communication: 0.1,
    },
  },

  Marketing: {
    subjects: {
      "Ngữ văn": 0.35,
      "Tiếng Anh": 0.3,
      Toán: 0.35,
    },
    skills: {
      creativity: 0.3,
      communication: 0.3,
      teamwork: 0.2,
      selfLearning: 0.1,
      leadership: 0.1,
    },
  },

  "Quản trị kinh doanh": {
    subjects: {
      Toán: 0.3,
      "Ngữ văn": 0.2,
      "Tiếng Anh": 0.25,
      "Giáo dục kinh tế và pháp luật": 0.25,
    },
    skills: {
      leadership: 0.3,
      communication: 0.25,
      problemSolving: 0.2,
      teamwork: 0.15,
      creativity: 0.1,
    },
  },

  "Chủ chuỗi cửa hàng bán lẻ": {
    subjects: {
      Toán: 0.3,
      "Ngữ văn": 0.2,
      "Tiếng Anh": 0.2,
      "Tin học": 0.1,
      "Giáo dục kinh tế và pháp luật": 0.2,
    },
    skills: {
      leadership: 0.3,
      communication: 0.25,
      problemSolving: 0.2,
      teamwork: 0.15,
      creativity: 0.1,
    },
  },

  "Kinh doanh": {
    subjects: {
      Toán: 0.3,
      "Tiếng Anh": 0.25,
      "Ngữ văn": 0.2,
      "Giáo dục kinh tế và pháp luật": 0.25,
    },
    skills: {
      leadership: 0.25,
      communication: 0.25,
      problemSolving: 0.2,
      teamwork: 0.15,
      creativity: 0.15,
    },
  },

  "Tài chính - Ngân hàng": {
    subjects: {
      Toán: 0.4,
      "Tiếng Anh": 0.25,
      "Tin học": 0.15,
      "Giáo dục kinh tế và pháp luật": 0.2,
    },
    skills: {
      dataAnalysis: 0.3,
      logic: 0.25,
      problemSolving: 0.2,
      selfLearning: 0.15,
      communication: 0.1,
    },
  },

  "Kế toán": {
    subjects: {
      Toán: 0.45,
      "Tin học": 0.2,
      "Tiếng Anh": 0.15,
      "Giáo dục kinh tế và pháp luật": 0.2,
    },
    skills: {
      logic: 0.3,
      dataAnalysis: 0.25,
      problemSolving: 0.2,
      selfLearning: 0.15,
      communication: 0.1,
    },
  },

  "Thiết kế đồ họa": {
    subjects: {
      "Tin học": 0.3,
      "Ngữ văn": 0.25,
      "Tiếng Anh": 0.2,
      Toán: 0.25,
    },
    skills: {
      creativity: 0.4,
      problemSolving: 0.2,
      selfLearning: 0.15,
      communication: 0.15,
      teamwork: 0.1,
    },
  },

  "Luật": {
    subjects: {
      "Ngữ văn": 0.45,
      "Lịch sử": 0.3,
      "Tiếng Anh": 0.25,
    },
    skills: {
      communication: 0.3,
      logic: 0.25,
      leadership: 0.15,
      problemSolving: 0.15,
      selfLearning: 0.15,
    },
  },

  "Y khoa": {
    subjects: {
      "Sinh học": 0.4,
      "Hóa học": 0.35,
      Toán: 0.25,
    },
    skills: {
      perseverance: 0.25,
      empathy: 0.25,
      communication: 0.2,
      problemSolving: 0.15,
      selfLearning: 0.15,
    },
  },

  "Dược học": {
    subjects: {
      "Hóa học": 0.4,
      "Sinh học": 0.35,
      Toán: 0.25,
    },
    skills: {
      perseverance: 0.25,
      selfLearning: 0.25,
      problemSolving: 0.2,
      communication: 0.15,
      empathy: 0.15,
    },
  },

  "Sư phạm": {
    subjects: {
      "Ngữ văn": 0.35,
      Toán: 0.25,
      "Tiếng Anh": 0.4,
    },
    skills: {
      communication: 0.35,
      empathy: 0.25,
      leadership: 0.15,
      teamwork: 0.15,
      selfLearning: 0.1,
    },
  },
};