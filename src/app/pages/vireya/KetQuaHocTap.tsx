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
  classLevel: 10 | 11 | 12;
  subjectId: string;
  scoreTypeId: string;
  scores: (number | undefined)[];
  date: string;
  semester: 1 | 2;
  note?: string;
}

export default function KetQuaHocTapForm() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scoreTypes, setScoreTypes] = useState<ScoreType[]>([]);
  const [loading, setLoading] = useState(false);

  // Tạm thời hardcode userId, sau có thể thay bằng user auth thật
  const userFakeId = "user_fake_id_123456";
  const maxScoreCount = 5;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      classLevel: 10,
      semester: 1,
      subjectId: "",
      scoreTypeId: "",
      scores: [],
      date: "",
      note: "",
    },
  });

  useEffect(() => {
    getAllSubjects()
      .then(setSubjects)
      .catch(() => toast.error("Không thể tải môn học."));
    getAllScoreTypes()
      .then(setScoreTypes)
      .catch(() => toast.error("Không thể tải loại điểm."));
  }, []);

  const selectedScoreTypeId = watch("scoreTypeId");
  const selectedScoreType = scoreTypes.find((st) => st.id === selectedScoreTypeId);

  // Xác định số lượng input điểm hiển thị theo hệ số weight của loại điểm
  let inputCount = 1;
  if (selectedScoreType?.weight === 1) {
    inputCount = maxScoreCount;
  }

  // Hàm validate điểm - cho phép trống hoặc giá trị từ 0 đến 10
  const validateScore = (v: number | undefined) => {
    if (v === undefined || v === null || isNaN(v)) return true;
    if (v >= 0 && v <= 10) return true;
    return "Điểm phải từ 0 đến 10";
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const userId = userFakeId;
      const validScores = (data.scores ?? [])
        .slice(0, inputCount)
        .filter(
          (score): score is number =>
            typeof score === "number" && !isNaN(score) && score >= 0 && score <= 10
        );

      if (validScores.length === 0) {
        toast.info("Bạn chưa nhập điểm nào hợp lệ.");
        setLoading(false);
        return;
      }

      for (const score of validScores) {
        await addLearningResult({
          userId,
          classLevel: data.classLevel,
          semester: data.semester,
          subjectId: data.subjectId,
          subjectName: subjects.find((s) => s.id === data.subjectId)?.name || "Không rõ môn",
          scoreTypeId: data.scoreTypeId,
          score,
          date: data.date,
          note: data.note,
          termLabel: "", // Bạn có thể xử lý termLabel tùy theo logic của dự án
        });
      }

      toast.success(`🎉 Đã lưu ${validScores.length} điểm thành công!`);
      reset();
    } catch (error) {
      toast.error("❌ Có lỗi xảy ra khi lưu.");
      console.error(error);
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
          <i
            className="bi bi-bar-chart-line-fill me-3"
            style={{ color: "#6366f1", fontSize: "2.6rem" }}
          />
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

      <div
        className="card shadow-lg border-0 p-4 mb-5"
        style={{ maxWidth: 700, backgroundColor: "#f4f5ff", borderRadius: 18 }}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Học kỳ */}
          <div>
            <label className="form-label fw-semibold">Học kỳ</label>
            <select
              {...register("semester", {
                required: "Vui lòng chọn học kỳ.",
                valueAsNumber: true,
                validate: (v) => v === 1 || v === 2 || "Học kỳ không hợp lệ.",
              })}
              className="form-select form-select-lg"
            >
              <option value="">-- Chọn học kỳ --</option>
              <option value={1}>Học kỳ 1</option>
              <option value={2}>Học kỳ 2</option>
            </select>
            {errors.semester && (
              <small className="text-danger fst-italic">{errors.semester.message}</small>
            )}
          </div>

          {/* Lớp học */}
          <div>
            <label className="form-label fw-semibold">Lớp học</label>
            <select
              {...register("classLevel", {
                required: "Vui lòng chọn lớp học.",
                valueAsNumber: true,
                validate: (v) => [10, 11, 12].includes(v) || "Lớp học không hợp lệ.",
              })}
              className="form-select form-select-lg"
            >
              <option value="">-- Chọn lớp học --</option>
              {[10, 11, 12].map((level) => (
                <option key={level} value={level}>
                  Lớp {level}
                </option>
              ))}
            </select>
            {errors.classLevel && (
              <small className="text-danger fst-italic">{errors.classLevel.message}</small>
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

          {/* Nhập điểm */}
          <div>
            <label className="form-label fw-semibold">
              Nhập điểm (tối đa {inputCount} điểm, không bắt buộc)
            </label>
            {Array.from({ length: inputCount }).map((_, idx) => (
              <div key={idx} className="mb-2">
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  max={10}
                  placeholder={`Điểm ${idx + 1}`}
                  {...register(`scores.${idx}` as const, {
                    valueAsNumber: true,
                    validate: validateScore,
                  })}
                  className="form-control"
                />
                {errors.scores?.[idx]?.message && (
                  <small className="text-danger fst-italic">{errors.scores[idx]?.message}</small>
                )}
              </div>
            ))}
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
              disabled={loading}
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
    </div>
  );
}
