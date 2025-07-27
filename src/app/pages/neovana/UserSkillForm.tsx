import { useForm } from "react-hook-form";
import { addUserSkill } from "../../../services/userSkillService";
import { UserSkill } from "../../../types/UserSkill";

interface Props {
  userId: string;
  onSaved?: () => void;
}

export function UserSkillForm({ userId, onSaved }: Props) {
  const { register, handleSubmit, reset } = useForm<UserSkill>();

  const onSubmit = async (data: UserSkill) => {
    await addUserSkill({ ...data, userId });
    reset();
    onSaved?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-yellow-100 p-6 rounded-xl space-y-4">
      <select {...register("skillId")} className="w-full p-2 rounded border">
        <option value="">Chọn kỹ năng</option>
        <option value="frontend">Frontend</option>
        <option value="ai">Trí tuệ nhân tạo</option>
      </select>
      <input type="date" {...register("date")} className="w-full p-2 rounded border" />
      <select {...register("level")} className="w-full p-2 rounded border">
        <option>Chưa có</option>
        <option>Cơ bản</option>
        <option>Trung bình</option>
        <option>Thành thạo</option>
        <option>Chuyên nghiệp</option>
      </select>
      <textarea {...register("description")} placeholder="Diễn giải..." className="w-full p-2 rounded border" />
      <button type="submit">💾 Lưu kỹ năng</button>
    </form>
  );
}
