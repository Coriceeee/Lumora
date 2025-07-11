export interface Skill {
  id?: string;
  code: string;
  name: string;
  level: "Cơ bản" | "Trung bình" | "Nâng cao";
  description: string;
}
