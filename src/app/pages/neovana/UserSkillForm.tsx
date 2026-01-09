  import * as React from "react";
import { useForm } from "react-hook-form";
import { addUserSkill } from "../../../services/userSkillService";
import { getAllSkills } from "../../../services/skillService";
import type { UserSkill } from "../../../types/UserSkill";
import type { Skill } from "../../../types/Skill";

type SkillLevel =
  | "Chưa có"
  | "Cơ bản"
  | "Trung bình"
  | "Thành thạo"
  | "Chuyên nghiệp";

interface Props {
  userId: string;
  onSaved?: () => void;
}

export function UserSkillForm({ userId, onSaved }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<UserSkill>({
    defaultValues: {
      level: "Chưa có" as any,
    },
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
        if (mounted)
          setError(e?.message || "Không tải được danh mục kỹ năng.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (data: UserSkill) => {
    await addUserSkill({ ...data, userId });
    reset({ level: "Chưa có" as any } as any);
    onSaved?.();
  };

  const LEVELS: SkillLevel[] = [
    "Chưa có",
    "Cơ bản",
    "Trung bình",
    "Thành thạo",
    "Chuyên nghiệp",
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
      <div className="field">
        <label>Kỹ năng</label>
        <select
          {...register("skillId", { required: true })}
          disabled={loading || isSubmitting}
        >
          <option value="">
            {loading ? "Đang tải..." : "Chọn kỹ năng"}
          </option>
          {!loading &&
            catalog.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
        </select>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="grid">
        <div className="field">
          <label>Ngày cập nhật</label>
          <input
            type="date"
            {...register("date", { required: true })}
          />
        </div>

        <div className="field">
          <label>Mức độ</label>
          <select {...register("level", { required: true })}>
            {LEVELS.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <label>Diễn giải</label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="Ví dụ: đã làm dự án React, biết Git cơ bản..."
        />
      </div>

      <button type="submit" disabled={isSubmitting || loading}>
        {isSubmitting ? "Đang lưu..." : "💾 Lưu kỹ năng"}
      </button>

      {/* ===== STYLE CHUẨN REACT ===== */}
      <style>{`
        .profile-form {
          background: rgba(255,255,255,0.97);
          padding: 28px;
          border-radius: 26px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .field label {
          font-weight: 700;
          font-size: 0.95rem;
          color: #374151;
          margin-bottom: 6px;
          display: block;
        }

        .profile-form input,
        .profile-form select,
        .profile-form textarea {
          width: 100%;
          height: 48px;
          padding: 0 14px;
          border-radius: 14px;
          border: 1.5px solid #d1d5db;
          font-size: 0.95rem;
          transition: all 0.25s ease;
        }

        .profile-form textarea {
          height: auto;
          padding: 12px 14px;
          resize: none;
          line-height: 1.5;
        }

        .profile-form select {
          appearance: none;
          background-image:
            linear-gradient(45deg, transparent 50%, #6b7280 50%),
            linear-gradient(135deg, #6b7280 50%, transparent 50%);
          background-position:
            calc(100% - 18px) 50%,
            calc(100% - 12px) 50%;
          background-size: 6px 6px;
          background-repeat: no-repeat;
          padding-right: 36px;
        }

        .profile-form input:focus,
        .profile-form select:focus,
        .profile-form textarea:focus {
          outline: none;
          border-color: #a855f7;
          box-shadow: 0 0 0 4px rgba(168,85,247,0.25);
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
        }

        .error {
          color: #dc2626;
          font-size: 0.85rem;
          margin-top: 4px;
        }

        .profile-form button {
          margin-top: 6px;
          height: 52px;
          border-radius: 18px;
          border: none;
          font-weight: 900;
          font-size: 1rem;
          color: white;
          background: linear-gradient(45deg, #6366f1, #ec4899);
          box-shadow: 0 14px 30px rgba(99,102,241,0.35);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .profile-form button:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 40px rgba(236,72,153,0.45);
        }

        .profile-form button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      `}</style>
    </form>
  );
}
