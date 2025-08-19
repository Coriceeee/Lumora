import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
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
  const [isOpen, setIsOpen] = useState(true); // 👈 control hiển thị form

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

  let inputCount = 1;
  if (selectedScoreType?.weight === 1) {
    inputCount = maxScoreCount;
  }

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
          termLabel: "",
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
    <div className="form-wrapper">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="form-header">
        <h2 className="form-title">
          <i className="bi bi-bar-chart-line-fill icon" />
          Nhập Kết Quả Học Tập
        </h2>
      </div>

      {/* AnimatePresence cho form */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="form-card">
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Học kỳ */}
                <div className="form-group">
                  <label>Học kỳ</label>
                  <select {...register("semester", { required: "Vui lòng chọn học kỳ." })}>
                    <option value="">-- Chọn học kỳ --</option>
                    <option value={1}>Học kỳ 1</option>
                    <option value={2}>Học kỳ 2</option>
                  </select>
                  {errors.semester && <small className="error">{errors.semester.message}</small>}
                </div>

                {/* Lớp */}
                <div className="form-group">
                  <label>Lớp học</label>
                  <select {...register("classLevel", { required: "Vui lòng chọn lớp học." })}>
                    <option value="">-- Chọn lớp học --</option>
                    {[10, 11, 12].map((level) => (
                      <option key={level} value={level}>
                        Lớp {level}
                      </option>
                    ))}
                  </select>
                  {errors.classLevel && <small className="error">{errors.classLevel.message}</small>}
                </div>

                {/* Môn */}
                <div className="form-group">
                  <label>Môn học</label>
                  <select {...register("subjectId", { required: "Vui lòng chọn môn học." })}>
                    <option value="">-- Chọn môn học --</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {errors.subjectId && <small className="error">{errors.subjectId.message}</small>}
                </div>

                {/* Loại điểm */}
                <div className="form-group">
                  <label>Loại điểm</label>
                  <select {...register("scoreTypeId", { required: "Vui lòng chọn loại điểm." })}>
                    <option value="">-- Chọn loại điểm --</option>
                    {scoreTypes.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                  {errors.scoreTypeId && <small className="error">{errors.scoreTypeId.message}</small>}
                </div>

                {/* Điểm */}
                <div className="form-group">
                  <label>Nhập điểm (tối đa {inputCount} điểm, không bắt buộc)</label>
                  {Array.from({ length: inputCount }).map((_, i) => (
                    <input
                      key={i}
                      type="number"
                      placeholder={`Điểm ${i + 1}`}
                      {...register(`scores.${i}` as const, {
                        valueAsNumber: true,
                        validate: validateScore,
                      })}
                    />
                  ))}
                  {errors.scores && <small className="error">Điểm không hợp lệ</small>}
                </div>

                {/* Ngày */}
                <div className="form-group">
                  <label>Ngày kiểm tra</label>
                  <input type="date" {...register("date", { required: "Vui lòng chọn ngày kiểm tra." })} />
                  {errors.date && <small className="error">{errors.date.message}</small>}
                </div>

                {/* Note */}
                <div className="form-group">
                  <label>Ghi chú</label>
                  <textarea rows={3} {...register("note")} placeholder="Ghi chú thêm nếu có..." />
                </div>

                {/* Buttons */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => reset()}
                    disabled={loading}
                  >
                    Đặt lại
                  </button>
                  <button type="submit" disabled={loading} className="btn-gradient">
                    {loading ? "Đang lưu..." : "💾 Lưu kết quả"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS giữ nguyên */}
      <style>{`
        .form-wrapper {
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
        }
        .form-header {
          margin-bottom: 20px;
          text-align: center;
        }
        .form-title {
          font-size: 2.4rem;
          font-weight: 900;
          background: linear-gradient(90deg, #6366f1, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
        }
        .form-title .icon {
          font-size: 2.4rem;
          color: #6366f1;
        }
        .form-card {
          background: #ffffff;
          border-radius: 18px;
          padding: 30px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
        }
        .form-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 40px rgba(0,0,0,0.15);
        }
        .form-group {
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
        }
        .form-group label {
          font-weight: 600;
          margin-bottom: 6px;
          color: #374151;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 1rem;
          transition: border 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.2);
        }
        .form-group textarea {
          resize: none;
        }
        .error {
          color: #dc2626;
          font-size: 0.85rem;
          margin-top: 4px;
          font-style: italic;
        }
        .form-actions {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 20px;
        }
        .btn-outline {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: 2px solid #9ca3af;
          background: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-outline:hover {
          border-color: #6366f1;
          color: #6366f1;
        }
        .btn-gradient {
          flex: 2;
          padding: 12px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(45deg, #6366f1, #ec4899);
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-gradient:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
