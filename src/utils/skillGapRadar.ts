export interface SkillGap {
  skill: string;
  value: number;
}

export function computeSkillGap(
  userSkills: Record<string, number>,
  selectedCareer: string
): SkillGap[] {
  const careerSkillsMap: Record<string, Record<string, number>> = {
    "Công nghệ thông tin": {
      "Lập trình": 5,
      "Cơ sở dữ liệu": 4,
      "Mạng máy tính": 3,
      "Cloud Computing": 4,
      "Giải quyết vấn đề": 5,
      "Làm việc nhóm": 4,
      "AI/Machine Learning": 3,
      "Phân tích dữ liệu": 3,
      "Bảo mật thông tin": 3,
      "DevOps": 3,
    },
  };

  const ideal = careerSkillsMap[selectedCareer];
  if (!ideal) return [];

  return Object.entries(ideal).map(([skill, idealValue]) => ({
    skill,
    value: Math.max(0, idealValue - (userSkills[skill] || 0)),
  }));
}
