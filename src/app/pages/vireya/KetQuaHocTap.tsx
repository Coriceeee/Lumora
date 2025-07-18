import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
  semester: 1 | 2;
  note?: string;
}

interface KetQuaHocTapFormProps {
  currentUserId: string;
}

export default function KetQuaHocTapForm({ currentUserId }: KetQuaHocTapFormProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scoreTypes, setScoreTypes] = useState<ScoreType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true); // Có thể toggle nếu muốn giống `DanhMucKhaoSat`

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      classLevel: 10,
      semester: 1,
      subjectId: "",
      scoreTypeId: "",
      score: undefined,
      date: "",
      note: "",
    },
  });

  useEffect(() => {
    getAllSubjects().then(setSubjects).catch(() => toast.error("Không thể tải môn học."));
    getAllScoreTypes().then(setScoreTypes).catch(() => toast.error("Không thể tải loại điểm."));
  }, []);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await addLearningResult({ userId: "id", ...data });
      toast.success("🎉 Đã lưu kết quả học tập!");
      reset();
    } catch (error) {
      debugger;
      toast.error("❌ Có lỗi xảy ra khi lưu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2
          className="fw-extrabold d-flex align-items-center"
          style={{ fontSize: "2.6rem", userSelect: "none" }}
        >
          <i className="bi bi-bar-chart-line-fill me-3" style={{ color: "#6366f1", fontSize: "2.6rem" }} />
          <span
            style={{
              background: "linear-gradient(90deg, #6366f1 0%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "900",
            }}
          >
            Nhập Kết Quả Học Tập
          </span>
        </h2>
      </div>

      {showForm && (
        <div
          className="card shadow-lg border-0 p-4 mb-5"
          style={{
            maxWidth: 700,
            backgroundColor: "#f4f5ff",
            borderRadius: 18,
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Học kỳ */}
            <div>
              <label className="form-label fw-semibold">Học kỳ</label>
              <select
                {...register("semester", { required: "Vui lòng chọn học kỳ." })}
                className="form-select form-select-lg"
              >
                <option value="">-- Chọn học kỳ --</option>
                <option value="1">Học kỳ 1</option>
                <option value="2">Học kỳ 2</option>
              </select>
              {errors.semester && (
                <small className="text-danger fst-italic">{errors.semester.message}</small>
              )}
            </div>
            {/* Lớp học */}
            <div>
              <label className="form-label fw-semibold">Lớp học</label>
              <select
                {...register("classLevel", { required: true, valueAsNumber: true })}
                className="form-select form-select-lg"
              >
                {[10, 11, 12].map((level) => (
                  <option key={level} value={level}>
                    Lớp {level}
                  </option>
                ))}
              </select>
              {errors.classLevel && (
                <small className="text-danger fst-italic">Vui lòng chọn lớp học.</small>
              )}
            </div>

            {/* Môn học */}
            <div>
              <label className="form-label fw-semibold">Môn học</label>
              <select
                {...register("subjectId", { required: "Vui lòng chọn môn học." })}
                className="form-select form-select-lg"
              >
                <option value="">-- Chọn môn học --</option>
                {subjects.map((subj) => (
                  <option key={subj.id} value={subj.id}>
                    {subj.name}
                  </option>
                ))}
              </select>
              {errors.subjectId && (
                <small className="text-danger fst-italic">{errors.subjectId.message}</small>
              )}
            </div>

            {/* Loại điểm */}
            <div>
              <label className="form-label fw-semibold">Loại điểm</label>
              <select
                {...register("scoreTypeId", { required: "Vui lòng chọn loại điểm." })}
                className="form-select form-select-lg"
              >
                <option value="">-- Chọn loại điểm --</option>
                {scoreTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              {errors.scoreTypeId && (
                <small className="text-danger fst-italic">{errors.scoreTypeId.message}</small>
              )}
            </div>

            {/* Điểm số */}
            <div>
              <label className="form-label fw-semibold">Điểm số</label>
              <input
                type="number"
                min={0}
                max={10}
                step={0.1}
                {...register("score", {
                  required: "Vui lòng nhập điểm.",
                  valueAsNumber: true,
                  min: { value: 0, message: "Không nhỏ hơn 0." },
                  max: { value: 10, message: "Không lớn hơn 10." },
                })}
                className="form-control form-control-lg"
              />
              {errors.score && (
                <small className="text-danger fst-italic">{errors.score.message}</small>
              )}
            </div>

            {/* Ngày kiểm tra */}
            <div>
              <label className="form-label fw-semibold">Ngày kiểm tra</label>
              <input
                type="date"
                {...register("date", { required: "Vui lòng chọn ngày kiểm tra." })}
                className="form-control form-control-lg"
              />
              {errors.date && (
                <small className="text-danger fst-italic">{errors.date.message}</small>
              )}
            </div>

            {/* Ghi chú */}
            <div>
              <label className="form-label fw-semibold">Ghi chú</label>
              <textarea
                rows={3}
                {...register("note")}
                className="form-control"
                placeholder="Ghi chú thêm nếu có..."
              />
            </div>

            {/* Nút thao tác */}
            <div className="d-flex justify-content-between pt-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => reset()}
              >
                Đặt lại
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-lg"
                style={{
                  background: "linear-gradient(45deg, #6366f1 0%, #ec4899 100%)",
                  color: "white",
                  fontWeight: 600,
                  borderRadius: 12,
                }}
              >
                {loading ? "Đang lưu..." : "💾 Lưu kết quả"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
