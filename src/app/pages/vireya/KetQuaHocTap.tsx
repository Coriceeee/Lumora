import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "../../../utils/fakeMotion";
import {
  Controller,
  useForm,
  useFieldArray,
  FieldErrors,
} from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { addLearningResult } from "../../../services/learningResultService";
import { getAllSubjects } from "../../../services/subjectService";
import { getAllScoreTypes } from "../../../services/scoreTypeService";
import { Subject } from "../../../types/Subject";
import { ScoreType } from "../../../types/ScoreType";
import { getAuth } from "firebase/auth";

interface ScoreItem {
  value: string;
}

interface FormData {
  classLevel: 10 | 11 | 12;
  semester: 1 | 2;
  subjectId: string;
  scoreTypeId: string;
  scores: ScoreItem[];
  date: string;
  note?: string;
}

const DEFAULT_VALUES: FormData = {
  classLevel: 10,
  semester: 1,
  subjectId: "",
  scoreTypeId: "",
  scores: [],
  date: "",
  note: "",
};

export default function KetQuaHocTapForm() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scoreTypes, setScoreTypes] = useState<ScoreType[]>([]);
  const [loading, setLoading] = useState(false);

  const maxScoreCount = 5;

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: DEFAULT_VALUES,
    shouldUnregister: false,
    mode: "onSubmit",
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "scores",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [subs, types] = await Promise.all([
          getAllSubjects(),
          getAllScoreTypes(),
        ]);
        setSubjects(subs || []);
        setScoreTypes(types || []);
      } catch (error) {
        toast.error("Không thể tải dữ liệu.");
      }
    };

    loadData();
  }, []);

  const isReady = subjects.length > 0 && scoreTypes.length > 0;

  const selectedScoreTypeId = watch("scoreTypeId");

  const selectedScoreType = useMemo(
    () => scoreTypes.find((st) => st.id === selectedScoreTypeId),
    [scoreTypes, selectedScoreTypeId]
  );

  const inputCount = selectedScoreType?.weight === 1 ? maxScoreCount : 1;

  useEffect(() => {
    if (!selectedScoreTypeId) {
      replace([]);
      return;
    }

    replace(Array.from({ length: inputCount }, () => ({ value: "" })));
  }, [selectedScoreTypeId, inputCount, replace]);

  const validateScore = React.useCallback((v?: string) => {
    if (!v || v.trim() === "") return true;
    if (!/^\d+(\.\d+)?$/.test(v)) return "Chỉ được nhập số hoặc số thập phân";
    const n = Number(v);
    if (Number.isNaN(n)) return "Điểm không hợp lệ";
    if (n < 0 || n > 10) return "Điểm phải từ 0 đến 10";
    return true;
  }, []);

  const sanitizeScoreInput = (value: string) => {
    let v = value.replace(",", ".").replace(/[^\d.]/g, "");

    const parts = v.split(".");
    if (parts.length > 2) {
      v = `${parts[0]}.${parts.slice(1).join("")}`;
    }

    if (v === "") return "";

    const n = Number(v);
    if (!Number.isNaN(n) && n > 10) return "10";

    return v;
  };

  const handleReset = () => {
    reset(DEFAULT_VALUES);
    replace([]);
  };

  const onSubmit = async (data: FormData) => {
    const userId = getAuth().currentUser?.uid;

    if (!userId) {
      toast.error("Bạn chưa đăng nhập.");
      return;
    }

    if (!data.subjectId || !data.scoreTypeId) {
      toast.error("Vui lòng chọn môn và loại điểm.");
      return;
    }

    if (!selectedScoreType) {
      toast.error("Không tìm thấy loại điểm hợp lệ.");
      return;
    }

    if (!data.date) {
      toast.error("Vui lòng chọn ngày kiểm tra.");
      return;
    }

    const subjectName =
      subjects.find((s) => s.id === data.subjectId)?.name || "Không rõ môn";

    const rawScores = (data.scores || []).map((s) => s.value?.trim() || "");

    try {
      setLoading(true);

      if (selectedScoreType.weight === 1) {
        const validScores = rawScores
          .filter((v) => v !== "")
          .map((v) => Number(v))
          .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 10);

        if (validScores.length === 0) {
          toast.info("Bạn chưa nhập điểm hợp lệ.");
          return;
        }

        await Promise.all(
          validScores.map((score) =>
            addLearningResult({
              userId,
              classLevel: Number(data.classLevel) as 10 | 11 | 12,
              semester: Number(data.semester) as 1 | 2,
              subjectId: data.subjectId,
              subjectName,
              scoreTypeId: data.scoreTypeId,
              score,
              date: data.date,
              note: data.note?.trim() || "",
              termLabel: "",
            })
          )
        );

        toast.success(`🎉 Đã lưu ${validScores.length} điểm`);
        handleReset();
        return;
      }

      const firstScore = rawScores[0];

      if (!firstScore) {
        toast.error("Loại điểm này bắt buộc phải nhập điểm.");
        return;
      }

      const n = Number(firstScore);
      if (Number.isNaN(n) || n < 0 || n > 10) {
        toast.error("Điểm không hợp lệ (0–10).");
        return;
      }

      await addLearningResult({
        userId,
        classLevel: Number(data.classLevel) as 10 | 11 | 12,
        semester: Number(data.semester) as 1 | 2,
        subjectId: data.subjectId,
        subjectName,
        scoreTypeId: data.scoreTypeId,
        score: n,
        date: data.date,
        note: data.note?.trim() || "",
        termLabel: "",
      });

      toast.success("🎉 Đã lưu điểm");
      handleReset();
    } catch (error) {
      console.error("Lỗi lưu kết quả học tập:", error);
      toast.error("Lưu kết quả thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const onError = (formErrors: FieldErrors<FormData>) => {
    console.error("Form errors:", formErrors);
    toast.error("Biểu mẫu còn dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
  };

  return (
    <div className="kqht-page">
      <ToastContainer position="top-right" autoClose={3000} />

      {!isReady ? (
        <div className="skeleton-wrap">
          <div className="skeleton-card" />
          <div className="skeleton-card small" />
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4 }}
          >
            <div className="form-card">
              <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
                <div className="form-group">
                  <label>Học kỳ</label>
                  <Controller
                    control={control}
                    name="semester"
                    render={({ field }) => (
                      <select
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        <option value={1}>Học kỳ 1</option>
                        <option value={2}>Học kỳ 2</option>
                      </select>
                    )}
                  />
                </div>

                <div className="form-group">
                  <label>Lớp</label>
                  <Controller
                    control={control}
                    name="classLevel"
                    render={({ field }) => (
                      <select
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      >
                        <option value={10}>Lớp 10</option>
                        <option value={11}>Lớp 11</option>
                        <option value={12}>Lớp 12</option>
                      </select>
                    )}
                  />
                </div>

                <div className="form-group">
                  <label>Môn học</label>
                  <Controller
                    control={control}
                    name="subjectId"
                    render={({ field }) => (
                      <select {...field}>
                        <option value="">-- Chọn môn --</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                <div className="form-group">
                  <label>Loại điểm</label>
                  <Controller
                    control={control}
                    name="scoreTypeId"
                    render={({ field }) => (
                      <select {...field}>
                        <option value="">-- Chọn loại điểm --</option>
                        {scoreTypes.map((st) => (
                          <option key={st.id} value={st.id}>
                            {st.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                </div>

                <div className="form-group">
                  <label>Nhập điểm</label>
                  <div className="score-grid">
                    {fields.length === 0 ? (
                      <div className="hint-box">
                        Vui lòng chọn loại điểm để hiển thị ô nhập điểm.
                      </div>
                    ) : (
                      fields.map((field, i) => (
                        <div key={field.id} className="score-item">
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder={`Điểm ${i + 1}`}
                            {...register(`scores.${i}.value`, {
                              validate: validateScore,
                            })}
                            onChange={(e) => {
                              const sanitized = sanitizeScoreInput(
                                e.target.value
                              );
                              setValue(`scores.${i}.value`, sanitized, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            }}
                          />
                          {errors.scores?.[i]?.value && (
                            <span className="field-error">
                              {errors.scores[i]?.value?.message}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Ngày kiểm tra</label>
                  <Controller
                    control={control}
                    name="date"
                    rules={{ required: "Vui lòng chọn ngày kiểm tra." }}
                    render={({ field }) => <input type="date" {...field} />}
                  />
                  {errors.date && (
                    <span className="field-error">{errors.date.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Ghi chú</label>
                  <textarea rows={3} {...register("note")} />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    Đặt lại
                  </button>
                  <button
                    type="submit"
                    className="btn-gradient"
                    disabled={loading}
                  >
                    {loading ? "Đang lưu..." : "💾 Lưu kết quả"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <style>{`
        .kqht-page{
          min-height:100vh;
          padding:40px 18px;
          background:
            radial-gradient(1200px 600px at 20% 10%, rgba(99,102,241,.18), transparent 60%),
            radial-gradient(900px 500px at 80% 20%, rgba(236,72,153,.16), transparent 60%),
            linear-gradient(135deg, #f7f8ff, #fff7fb);
        }

        .skeleton-wrap{
          max-width: 920px;
          margin: 22px auto 0;
          display:grid;
          gap: 14px;
          justify-items:center;
        }

        .skeleton-card{
          width: min(900px, 95vw);
          height: 220px;
          border-radius: 22px;
          background: linear-gradient(90deg, rgba(255,255,255,.7), rgba(255,255,255,.35), rgba(255,255,255,.7));
          border: 1px solid rgba(0,0,0,.06);
          box-shadow: 0 18px 45px rgba(0,0,0,.10);
          animation: shimmer 1.2s infinite linear;
          background-size: 200% 100%;
        }

        .skeleton-card.small{ height: 120px; opacity:.9 }

        @keyframes shimmer{
          0%{ background-position: 200% 0; }
          100%{ background-position: -200% 0; }
        }

        .form-card{
          width: min(900px, 95vw);
          margin: 20px auto 0;
          background: rgba(255,255,255,.78);
          border: 1px solid rgba(0,0,0,.06);
          border-radius: 24px;
          padding: 28px;
          backdrop-filter: blur(14px);
          box-shadow:
            0 30px 70px rgba(0,0,0,.12),
            0 8px 22px rgba(99,102,241,.10);
        }

        .form-group{
          margin-bottom: 16px;
          display:flex;
          flex-direction:column;
          gap: 6px;
        }

        .form-group label{
          font-weight: 800;
          color:#374151;
        }

        .form-group input,
        .form-group select,
        .form-group textarea{
          border: 1px solid rgba(0,0,0,.12);
          border-radius: 14px;
          padding: 12px 14px;
          font-size: 1rem;
          background: rgba(255,255,255,.9);
          transition: transform .2s, box-shadow .2s, border-color .2s;
          outline: none;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus{
          border-color: rgba(99,102,241,.75);
          box-shadow: 0 0 0 4px rgba(99,102,241,.18);
          transform: translateY(-1px);
        }

        .score-grid{
          display:grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .score-item{
          display:flex;
          flex-direction:column;
          gap:6px;
        }

        .hint-box{
          grid-column: 1 / -1;
          padding: 12px 14px;
          border-radius: 14px;
          background: rgba(99,102,241,.08);
          color: #4338ca;
          font-weight: 600;
          border: 1px dashed rgba(99,102,241,.28);
        }

        .field-error{
          font-size: .85rem;
          color: #dc2626;
          font-weight: 600;
          margin-left: 4px;
        }

        .form-actions{
          display:flex;
          gap: 12px;
          margin-top: 18px;
        }

        .btn-outline{
          flex: 1;
          padding: 13px 14px;
          border-radius: 14px;
          border: 2px solid rgba(107,114,128,.45);
          background: rgba(255,255,255,.9);
          font-weight: 900;
          cursor:pointer;
          transition: transform .2s, box-shadow .2s, border-color .2s, color .2s;
        }

        .btn-outline:hover{
          border-color: rgba(79,70,229,.8);
          color:#4f46e5;
          box-shadow: 0 10px 24px rgba(79,70,229,.15);
          transform: translateY(-1px);
        }

        .btn-gradient{
          flex: 2;
          padding: 13px 14px;
          border-radius: 14px;
          border: none;
          color: #fff;
          font-weight: 950;
          cursor:pointer;
          background: linear-gradient(45deg, #4f46e5, #ec4899);
          box-shadow: 0 14px 30px rgba(79,70,229,.25);
          transition: transform .2s, box-shadow .2s, filter .2s;
        }

        .btn-gradient:hover{
          transform: translateY(-2px);
          box-shadow: 0 18px 40px rgba(79,70,229,.30);
          filter: brightness(1.02);
        }

        .btn-gradient:disabled,
        .btn-outline:disabled{
          opacity: .65;
          cursor:not-allowed;
          transform:none;
          box-shadow:none;
        }

        @media (max-width: 700px){
          .score-grid{ grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}