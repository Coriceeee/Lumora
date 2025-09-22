import * as React from "react";
import { useForm } from "react-hook-form";
import { addUserSkill } from "../../../services/userSkillService";
import { getAllSkills } from "../../../services/skillService";
import type { UserSkill } from "../../../types/UserSkill";
import type { Skill } from "../../../types/Skill";

type SkillLevel = "Chưa có" | "Cơ bản" | "Trung bình" | "Thành thạo" | "Chuyên nghiệp";

interface Props {
  userId: string;
  onSaved?: () => void;
}

export function UserSkillForm({ userId, onSaved }: Props) {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<UserSkill>({
    defaultValues: {
      level: "Chưa có" as any, // khớp với kiểu trong UserSkill của bạn
    }
  });
  const [catalog, setCatalog] = React.useState<Skill[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getAllSkills();
        if (mounted) setCatalog(data || []);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Không tải được danh mục kỹ năng.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onSubmit = async (data: UserSkill) => {
    await addUserSkill({ ...data, userId });
    reset({ level: "Chưa có" as any } as any);
    onSaved?.();
  };

  const LEVELS: SkillLevel[] = ["Chưa có", "Cơ bản", "Trung bình", "Thành thạo", "Chuyên nghiệp"];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-yellow-100 p-6 rounded-xl space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Kỹ năng</label>
        <select
          {...register("skillId", { required: "Vui lòng chọn kỹ năng" })}
          className="w-full p-2 rounded border"
          disabled={loading || isSubmitting}
        >
          <option value="">{loading ? "Đang tải..." : "Chọn kỹ năng"}</option>
          {!loading && catalog.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Ngày cập nhật</label>
          <input
            type="date"
            {...register("date", { required: "Vui lòng chọn ngày" })}
            className="w-full p-2 rounded border"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mức độ</label>
          <select
            {...register("level", { required: "Vui lòng chọn mức độ" })}
            className="w-full p-2 rounded border"
            disabled={isSubmitting}
          >
            {LEVELS.map((lv) => (
              <option key={lv} value={lv}>{lv}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Diễn giải</label>
        <textarea
          {...register("description")}
          placeholder="Ghi chú (ví dụ: đã làm dự án React 3 tháng, biết Git cơ bản...)"
          className="w-full p-2 rounded border"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <button type="submit" disabled={isSubmitting || loading} className="px-4 py-2 rounded bg-yellow-600 text-white">
        {isSubmitting ? "Đang lưu..." : "💾 Lưu kỹ năng"}
      </button>
    </form>
  );
}
