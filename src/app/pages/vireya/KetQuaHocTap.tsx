import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { addLearningResult } from "../../../services/learningResultService";
import { getAllSubjects } from "../../../services/subjectService";
import { getAllScoreTypes } from "../../../services/scoreTypeService";
import { Subject } from "../../../types/Subject";
import { ScoreType } from "../../../types/ScoreType";

interface FormData {
  classLevel: number;
  subjectId: string;
  scoreTypeId: string;
  score: number;
  date: string;
  note?: string;
}

interface KetQuaHocTapFormProps {
  currentUserId: string;
}

export default function KetQuaHocTapForm({ currentUserId }: KetQuaHocTapFormProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scoreTypes, setScoreTypes] = useState<ScoreType[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      classLevel: 10,
      subjectId: "",
      scoreTypeId: "",
      score: undefined,
      date: "",
      note: "",
    },
  });

  useEffect(() => {
    getAllSubjects()
      .then(setSubjects)
      .catch(() => toast.error("Không thể tải danh sách môn học."));
    getAllScoreTypes()
      .then(setScoreTypes)
      .catch(() => toast.error("Không thể tải danh sách loại điểm."));
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await addLearningResult({
        userId: currentUserId,
        ...data,
      });
      toast.success("🎉 Đã lưu kết quả học tập!");
      reset();
    } catch (error) {
      console.error(error);
      toast.error("❌ Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const MotionForm = motion.form;

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="min-h-screen bg-gradient-to-br from-[#fdfcfb] via-[#e7efff] to-[#fef9f9] flex items-center justify-center px-4 py-10">
        <MotionForm
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-xl bg-white/90 rounded-3xl shadow-2xl backdrop-blur-md p-8 space-y-6 border border-gray-200"
          noValidate
        >
          <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent drop-shadow">
            Nhập Kết Quả Học Tập
          </h2>

          {/* Lớp học */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Lớp học</label>
            <select
              {...register("classLevel", { valueAsNumber: true, required: true })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white shadow-sm"
            >
              {[10, 11, 12].map((level) => (
                <option key={level} value={level}>
                  Lớp {level}
                </option>
              ))}
            </select>
            {errors.classLevel && (
              <p className="text-sm text-red-500 mt-1">Vui lòng chọn lớp học.</p>
            )}
          </div>

          {/* Môn học */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Môn học</label>
            <select
              {...register("subjectId", { required: "Vui lòng chọn môn học." })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm"
            >
              <option value="">-- Chọn môn học --</option>
              {subjects.map((subj) => (
                <option key={subj.id} value={subj.id}>
                  {subj.name}
                </option>
              ))}
            </select>
            {errors.subjectId && (
              <p className="text-sm text-red-500 mt-1">{errors.subjectId.message}</p>
            )}
          </div>

          {/* Loại điểm */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Loại điểm</label>
            <select
              {...register("scoreTypeId", { required: "Vui lòng chọn loại điểm." })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white shadow-sm"
            >
              <option value="">-- Chọn loại điểm --</option>
              {scoreTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
            {errors.scoreTypeId && (
              <p className="text-sm text-red-500 mt-1">{errors.scoreTypeId.message}</p>
            )}
          </div>

          {/* Điểm số */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Điểm số</label>
            <input
              type="number"
              {...register("score", {
                required: "Vui lòng nhập điểm.",
                min: { value: 0, message: "Điểm không được nhỏ hơn 0." },
                max: { value: 10, message: "Điểm không được lớn hơn 10." },
                valueAsNumber: true,
              })}
              min={0}
              max={10}
              step={0.1}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
            />
            {errors.score && (
              <p className="text-sm text-red-500 mt-1">{errors.score.message}</p>
            )}
          </div>

          {/* Ngày kiểm tra */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Ngày kiểm tra</label>
            <input
              type="date"
              {...register("date", { required: "Vui lòng chọn ngày kiểm tra." })}
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
            />
            {errors.date && (
              <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block mb-1 font-semibold text-gray-700">Ghi chú</label>
            <textarea
              {...register("note")}
              rows={3}
              placeholder="Ghi chú thêm (nếu có)..."
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-yellow-400 focus:outline-none shadow-sm"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => reset()}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-xl shadow"
            >
              Đặt lại
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`${
                loading
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-pink-500"
              } text-white font-semibold px-6 py-2 rounded-xl shadow-lg transition-all`}
            >
              {loading ? "Đang lưu..." : "💾 Lưu kết quả"}
            </button>
          </div>
        </MotionForm>
      </div>
    </>
  );
}
