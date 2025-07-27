import { useForm } from "react-hook-form";
import { addUserCertificate } from "../../../services/userCertificateService";
import { UserCertificate } from "../../../types/UserCertificate";

interface Props {
  userId: string;
  onSaved?: () => void;
}

export function UserCertificateForm({ userId, onSaved }: Props) {
  const { register, handleSubmit, reset } = useForm<UserCertificate>();

  const onSubmit = async (data: UserCertificate) => {
    await addUserCertificate({ ...data, userId });
    reset();
    onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-blue-100 p-6 rounded-xl space-y-4">
      <select {...register("certificateId")} className="w-full p-2 rounded border">
        <option value="">Chọn chứng chỉ</option>
        <option value="ielts">IELTS</option>
        <option value="ic3">IC3</option>
      </select>
      <input type="date" {...register("date")} className="w-full p-2 rounded border" />
      <input type="text" {...register("issuer")} placeholder="Nơi cấp" className="w-full p-2 rounded border" />
      <input type="text" {...register("result")} placeholder="Kết quả" className="w-full p-2 rounded border" />
      <textarea {...register("description")} placeholder="Diễn giải..." className="w-full p-2 rounded border" />
      <button type="submit">💾 Lưu chứng chỉ</button>
    </form>
  );
}
