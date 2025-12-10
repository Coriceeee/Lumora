import { industrySkillProfiles } from "../app/pages/neovana/data/industrySkills";

interface UserSkills {
    [skillName: string]: number;
}

interface RequiredSkills {
    [skillName: string]: number;
}

interface IndustrySkillProfile {
    skills: RequiredSkills;
}

interface SkillGapResult {
    skill: string;
    required: number;
    userValue: number;
    gap: number;
}

export function computeSkillGap(userSkills: UserSkills, careerName: string): SkillGapResult[] | null {
    const industry: IndustrySkillProfile | undefined = industrySkillProfiles[careerName];
    if (!industry) return null;

    const results: SkillGapResult[] = [];

    Object.keys(industry.skills).forEach((skill: string) => {
        const required: number = industry.skills[skill];
        const userValue: number = userSkills?.[skill] ?? 0;

        results.push({
            skill,
            required,
            userValue,
            gap: required - userValue
        });
    });

    return results;
}