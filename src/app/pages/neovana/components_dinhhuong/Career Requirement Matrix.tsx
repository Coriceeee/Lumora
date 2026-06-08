
export interface CareerRequirement {
  industryName: string;

  // Trọng số môn học (tổng = 1)
  subjectWeights: Record<string, number>;

  // Trọng số kỹ năng (tổng = 1)
  skillWeights: Record<string, number>;

  // Các môn quan trọng
  importantSubjects: string[];

  // Các kỹ năng quan trọng
  importantSkills: string[];

  // Chứng chỉ gợi ý (không dùng để tính điểm)
  recommendedCertificates: string[];
}

export const careerRequirements: Record<string, CareerRequirement> = {

  "Công nghệ thông tin": {
    industryName: "Công nghệ thông tin",

    subjectWeights: {
      "Toán": 0.40,
      "Tin học": 0.35,
      "Tiếng Anh": 0.25,
    },

    skillWeights: {
      logic: 0.30,
      problemSolving: 0.25,
      selfLearning: 0.20,
      teamwork: 0.15,
      communication: 0.10,
    },

    importantSubjects: [
      "Toán",
      "Tin học",
      "Tiếng Anh",
    ],

    importantSkills: [
      "Tư duy logic",
      "Giải quyết vấn đề",
      "Tự học",
    ],

    recommendedCertificates: [
      "IELTS",
      "MOS",
      "Python cơ bản",
    ],
  },

  "Trí tuệ nhân tạo": {
    industryName: "Trí tuệ nhân tạo",

    subjectWeights: {
      "Toán": 0.45,
      "Tin học": 0.35,
      "Tiếng Anh": 0.20,
    },

    skillWeights: {
      logic: 0.30,
      problemSolving: 0.25,
      research: 0.20,
      selfLearning: 0.15,
      creativity: 0.10,
    },

    importantSubjects: [
      "Toán",
      "Tin học",
      "Tiếng Anh",
    ],

    importantSkills: [
      "Logic",
      "Nghiên cứu",
      "Giải quyết vấn đề",
    ],

    recommendedCertificates: [
      "IELTS",
      "Python",
      "Machine Learning cơ bản",
    ],
  },

  "Marketing": {
    industryName: "Marketing",

    subjectWeights: {
      "Ngữ văn": 0.30,
      "Tiếng Anh": 0.25,
      "Toán": 0.20,
      "Tin học": 0.25,
    },

    skillWeights: {
      communication: 0.30,
      creativity: 0.25,
      teamwork: 0.20,
      leadership: 0.15,
      technology: 0.10,
    },

    importantSubjects: [
      "Ngữ văn",
      "Tiếng Anh",
      "Tin học",
    ],

    importantSkills: [
      "Giao tiếp",
      "Sáng tạo",
      "Làm việc nhóm",
    ],

    recommendedCertificates: [
      "MOS",
      "Digital Marketing",
      "IELTS",
    ],
  },

  "Y khoa": {
    industryName: "Y khoa",

    subjectWeights: {
      "Sinh học": 0.40,
      "Hóa học": 0.35,
      "Toán": 0.15,
      "Tiếng Anh": 0.10,
    },

    skillWeights: {
      empathy: 0.30,
      persistence: 0.25,
      communication: 0.20,
      research: 0.15,
      teamwork: 0.10,
    },

    importantSubjects: [
      "Sinh học",
      "Hóa học",
      "Toán",
    ],

    importantSkills: [
      "Đồng cảm",
      "Kiên trì",
      "Giao tiếp",
    ],

    recommendedCertificates: [
      "IELTS",
      "First Aid",
    ],
  },

  "Luật": {
    industryName: "Luật",

    subjectWeights: {
      "Ngữ văn": 0.35,
      "Tiếng Anh": 0.20,
      "Lịch sử": 0.25,
      "GDCD": 0.20,
    },

    skillWeights: {
      communication: 0.30,
      leadership: 0.20,
      problemSolving: 0.20,
      teamwork: 0.15,
      persistence: 0.15,
    },

    importantSubjects: [
      "Ngữ văn",
      "Lịch sử",
      "GDCD",
    ],

    importantSkills: [
      "Giao tiếp",
      "Lập luận",
      "Kiên trì",
    ],

    recommendedCertificates: [
      "IELTS",
      "Debate",
    ],
  }

};
