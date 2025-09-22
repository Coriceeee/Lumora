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
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<UserCertificate>();
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
        if (mounted) setError(e?.message || "Không tải được danh mục chứng chỉ.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onSubmit = async (data: UserCertificate) => {
    await addUserCertificate({ ...data, userId });
    reset();
    onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-blue-100 p-6 rounded-xl space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Chứng chỉ</label>
        <select
          {...register("certificateId", { required: "Vui lòng chọn chứng chỉ" })}
          className="w-full p-2 rounded border"
          disabled={loading || isSubmitting}
        >
          <option value="">{loading ? "Đang tải..." : "Chọn chứng chỉ"}</option>
          {!loading && catalog.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Ngày cấp</label>
          <input
            type="date"
            {...register("date", { required: "Vui lòng chọn ngày cấp" })}
            className="w-full p-2 rounded border"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nơi cấp</label>
          <input
            type="text"
            {...register("issuer", { required: "Vui lòng nhập nơi cấp" })}
            placeholder="British Council, IDP..."
            className="w-full p-2 rounded border"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Kết quả</label>
          <input
            type="text"
            {...register("result", { required: "Vui lòng nhập kết quả" })}
            placeholder="Ví dụ: 6.5 / Merit / Pass"
            className="w-full p-2 rounded border"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Diễn giải</label>
        <textarea
          {...register("description")}
          placeholder="Ghi chú bổ sung (nếu có)"
          className="w-full p-2 rounded border"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <button type="submit" disabled={isSubmitting || loading} className="px-4 py-2 rounded bg-blue-600 text-white">
        {isSubmitting ? "Đang lưu..." : "💾 Lưu chứng chỉ"}
      </button>
    </form>
  );
}
