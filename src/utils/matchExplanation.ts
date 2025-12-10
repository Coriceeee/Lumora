const selected: any = undefined; // Placeholder for selected data

const topCareer = selected?.careers?.[0];
const selectedCareer = topCareer?.name ?? "Công nghệ thông tin";

const userSkills = selected?.userSkills ?? {};
const industryProfiles: Record<string, any> = {}; // Placeholder, replace with actual data source or import
const industry = industryProfiles[selectedCareer];
const matchReasons = explainMatch(topCareer, selected);
export function explainMatch(topCareer: any, selected: any): string[] {
    const reasons: string[] = [];

    if (!topCareer) {
        reasons.push("Không tìm thấy thông tin sự nghiệp cụ thể để phân tích.");
        return reasons;
    }

    reasons.push(`Sự nghiệp "${topCareer.name ?? "được đề xuất"}" phù hợp với hồ sơ của bạn.`);

    const userSkills = selected?.userSkills ?? {};
    const topCareerSkills = topCareer?.skills ?? [];

    const matchingSkills = Object.keys(userSkills).filter(
        (skill: string) => userSkills[skill] > 0 && topCareerSkills.includes(skill)
    );

    if (matchingSkills.length > 0) {
        reasons.push(`Bạn có các kỹ năng như ${matchingSkills.slice(0, 3).join(', ')}${matchingSkills.length > 3 ? ' và nhiều hơn nữa' : ''} rất phù hợp với yêu cầu của sự nghiệp này.`);
    } else {
        reasons.push("Tiềm năng phát triển kỹ năng của bạn rất cao trong lĩnh vực này.");
    }

    if (topCareer.description) {
        reasons.push("Mô tả về sự nghiệp này có nhiều điểm chung với sở thích và mục tiêu của bạn.");
    }

    reasons.push("Đây là một lựa chọn tiềm năng tốt để bạn khám phá và phát triển.");

    return reasons;
}

