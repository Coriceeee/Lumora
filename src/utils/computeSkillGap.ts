export function computeSkillGap(userSkills: any, selectedCareer: string) {
  const industryProfiles: Record<string, { skills: Record<string, number> }> = {
    "Công nghệ thông tin": {
      skills: {
        logic: 85,
        problemSolving: 80,
        selfLearning: 75,
        teamwork: 60,
        communication: 55,
      },
    },
    "Kinh tế": {
      skills: {
        communication: 80,
        analysis: 75,
        math: 70,
        teamwork: 65,
        planning: 60,
      },
    },
    "Marketing": {
      skills: {
        creativity: 85,
        communication: 80,
        social: 75,
        analysis: 60,
        planning: 55,
      },
    },
  };

  const industry = industryProfiles[selectedCareer];
  if (!industry) return null;

  const results = Object.entries(industry.skills).map(([skill, required]) => {
    const userValue = userSkills?.[skill] ?? 0;
    return {
      skill,
      required,
      userValue,
      gap: Math.max(0, required - userValue),
    };
  });

  return results;
}
