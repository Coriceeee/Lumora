import * as React from "react";
import { useForm } from "react-hook-form";
import { addUserCertificate } from "../../../services/userCertificateService";
import { getAllCertificates } from "../../../services/certificateService";
import type { UserCertificate } from "../../../types/UserCertificate";
import type { Certificate } from "../../../types/Certificate";

interface Props {
  userId: string;
  onSaved?: () => void;
}

export function UserCertificateForm({ userId, onSaved }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<UserCertificate>();

  const [catalog, setCatalog] = React.useState<Certificate[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getAllCertificates();
        if (mounted) setCatalog(data || []);
      } catch (e: any) {
        if (mounted)
          setError(e?.message || "Không tải được danh mục chứng chỉ.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (data: UserCertificate) => {
    await addUserCertificate({ ...data, userId });
    reset();
    onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
      <div className="field">
        <label>Chứng chỉ</label>
        <select
          {...register("certificateId", { required: true })}
          disabled={loading || isSubmitting}
        >
          <option value="">
            {loading ? "Đang tải..." : "Chọn chứng chỉ"}
          </option>
          {!loading &&
            catalog.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="grid">
        <div className="field">
          <label>Ngày cấp</label>
          <input
            type="date"
            {...register("date", { required: true })}
          />
        </div>

        <div className="field">
          <label>Nơi cấp</label>
          <input
            type="text"
            {...register("issuer", { required: true })}
            placeholder="British Council, IDP..."
          />
        </div>

        <div className="field">
          <label>Kết quả</label>
          <input
            type="text"
            {...register("result", { required: true })}
            placeholder="6.5 / Merit / Pass"
          />
        </div>
      </div>

      <div className="field">
        <label>Diễn giải</label>
        <textarea
          {...register("description")}
          rows={3}
          placeholder="Ghi chú bổ sung (nếu có)"
        />
      </div>

      <button type="submit" disabled={isSubmitting || loading}>
        {isSubmitting ? "Đang lưu..." : "💾 Lưu chứng chỉ"}
      </button>

      {/* ===== STYLE – ĐỒNG BỘ USER SKILL FORM ===== */}
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
