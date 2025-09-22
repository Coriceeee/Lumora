// Tổng hợp/chuẩn hóa điểm + tạo dữ liệu cho dashboard
import type { LearningResult } from "../../../../types/LearningResult";
import type { UserSkill } from "../../../../types/UserSkill";
import type { UserCertificate } from "../../../../types/UserCertificate";
import type { Subject } from "../../../../types/Subject";
import { Skill } from "@/types/Skill";
import { Certificate } from "@/types/Certificate";


export type RadarDatum = { name: string; score: number };
export type SubjectStat = {
  subjectId: string;
  subjectName: string;        // ← tên lấy từ Subject catalog
  avg: number;                // 0..100
  latestTerm?: string;
  latestNote?: string;
};

export const normalizeScore100 = (n: number) => {
  if (Number.isNaN(n as number)) return 0;
  if (n <= 10) return Math.max(0, Math.min(100, Math.round(n * 10)));
  return Math.max(0, Math.min(100, Math.round(n)));
};

export const skillLevelToScore = (level: string) => {
  const l = (level || "").toLowerCase().trim();
  const map: Record<string, number> = {
    beginner: 25, novice: 25, basic: 30, "cơ bản": 30,
    intermediate: 55, "trung cấp": 55, "intermediate+": 60,
    advanced: 75, "nâng cao": 75, proficient: 80,
    expert: 90, "chuyên gia": 90, master: 95,
  };
  if (map[l] != null) return map[l];
  const m10 = l.match(/(\d+(?:\.\d+)?)\s*\/\s*10/);
  if (m10) return normalizeScore100(parseFloat(m10[1]));
  const m100 = l.match(/(\d+(?:\.\d+)?)\s*\/\s*100/);
  if (m100) return normalizeScore100(parseFloat(m100[1]));
  return 50;
};

/** Tổng hợp điểm theo môn dùng subjectCatalogMap (id->Subject) */
export const aggregateSubjects = (
  rows: LearningResult[],
  subjectCatalogMap?: Record<string, Subject>
): SubjectStat[] => {
  const bySubject: Record<
    string,
    { scores: number[]; latestTerm?: string; latestNote?: string; latestDate?: string }
  > = {};

  for (const r of rows) {
    const s100 = normalizeScore100(r.score);
    if (!bySubject[r.subjectId]) bySubject[r.subjectId] = { scores: [] };
    bySubject[r.subjectId].scores.push(s100);

    const cur = bySubject[r.subjectId];
    if (!cur.latestDate || new Date(r.date) > new Date(cur.latestDate)) {
      cur.latestDate = r.date;
      cur.latestTerm = r.termLabel;
      cur.latestNote = r.note;
    }
  }

  return Object.entries(bySubject)
    .map(([subjectId, v]) => {
      const avg = v.scores.length ? Math.round(v.scores.reduce((s, n) => s + n, 0) / v.scores.length) : 0;
      const subjectName = subjectCatalogMap?.[subjectId]?.name ?? subjectId; // ✅ lấy tên từ Subject
      return { subjectId, subjectName, avg, latestTerm: v.latestTerm, latestNote: v.latestNote };
    })
    .sort((a, b) => b.avg - a.avg);
};

/** Build Radar = top K môn + top K kỹ năng (map skillId -> Skill.name nếu có) */
export const buildRadarData = (
  subjects: SubjectStat[],
  skills: UserSkill[],
  topSubjects = 4,
  topSkills = 3,
  skillCatalogMap?: Record<string, Skill>
): RadarDatum[] => {
  const sTop = subjects.slice(0, topSubjects).map(s => ({ name: s.subjectName, score: s.avg }));

  // lấy bản ghi cuối cùng theo skillId
  const lastBySkill: Record<string, { name: string; level: string }> = {};
  for (const sk of skills) {
    const displayName = skillCatalogMap?.[sk.skillId]?.name ?? sk.skillId; // ✅ dùng tên từ catalog
    lastBySkill[sk.skillId] = { name: displayName, level: sk.level };
  }
  const allSkill = Object.values(lastBySkill).map(x => ({ name: x.name, score: skillLevelToScore(x.level) }));
  const kTop = allSkill.sort((a, b) => b.score - a.score).slice(0, topSkills);

  // gộp trùng tên nếu có
  const merged: Record<string, { name: string; vals: number[] }> = {};
  for (const e of [...sTop, ...kTop]) {
    if (!merged[e.name]) merged[e.name] = { name: e.name, vals: [] };
    merged[e.name].vals.push(e.score);
  }
  return Object.values(merged).map(m => ({
    name: m.name,
    score: Math.round(m.vals.reduce((s, n) => s + n, 0) / m.vals.length),
  }));
};

/** Gợi ý chứng chỉ (owns check dùng cả id lẫn tên từ catalog) */
export const buildCertificateSuggestions = (
  subjects: SubjectStat[],
  skills: UserSkill[],
  owned: UserCertificate[],
  certificateCatalogMap?: Record<string, Certificate>
): { id: string; name: string; provider?: string; estHours?: number; rationale: string; url?: string }[] => {
  const subjectAvg = (keyword: string) => {
    const hit = subjects.find(s => s.subjectName.toLowerCase().includes(keyword));
    return hit?.avg ?? 0;
  };
  const english = subjectAvg("anh") || subjectAvg("english");
  const it = subjectAvg("tin") || subjectAvg("informatics") || subjectAvg("it");

  const analysisSkill = skills.find(s => /data|phân tích|analysis/i.test(s.description ?? "") || /data|analysis/i.test(s.level ?? ""));
  const anaScore = analysisSkill ? skillLevelToScore(analysisSkill.level) : 0;

  const ownedTexts = owned.map(c => {
    const name = certificateCatalogMap?.[c.certificateId]?.name;
    return `${c.certificateId} ${name ?? ""} ${c.result ?? ""} ${c.description ?? ""}`.toLowerCase();
  });
  const owns = (re: RegExp) => ownedTexts.some(t => re.test(t));

  const out: { id: string; name: string; provider?: string; estHours?: number; rationale: string; url?: string }[] = [];

  if (english < 60 && !owns(/ielts|toeic|toefl/)) {
    out.push({
      id: "suggest-ielts",
      name: "IELTS Academic",
      provider: "British Council",
      estHours: 120,
      rationale: "Điểm Anh văn còn thấp — luyện IELTS để nâng năng lực ngoại ngữ học thuật.",
      url: "https://www.britishcouncil.vn/ielts",
    });
  }
  if (it < 60 && !owns(/mos|excel|word|powerpoint/)) {
    out.push({
      id: "suggest-mos",
      name: "MOS Excel Associate",
      provider: "Microsoft",
      estHours: 40,
      rationale: "Tin học cần củng cố — MOS giúp chuẩn hóa kỹ năng văn phòng.",
      url: "https://learn.microsoft.com/",
    });
  }
  if (anaScore < 60 && !owns(/python|data/)) {
    out.push({
      id: "suggest-python",
      name: "Python for Data Analysis",
      provider: "Coursera",
      estHours: 60,
      rationale: "Khoảng trống phân tích dữ liệu — học Python để tăng năng lực phân tích.",
      url: "https://www.coursera.org/",
    });
  }
  return out;
};
