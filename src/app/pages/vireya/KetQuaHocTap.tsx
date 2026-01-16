import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "../../../utils/fakeMotion";
import {
  Controller,
  useForm,
  useFieldArray,
} from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { addLearningResult } from "../../../services/learningResultService";
import { getAllSubjects } from "../../../services/subjectService";
import { getAllScoreTypes } from "../../../services/scoreTypeService";
import { Subject } from "../../../types/Subject";
import { ScoreType } from "../../../types/ScoreType";
import { getAuth } from "firebase/auth";

/* ================= TYPES ================= */
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

  /* ================= FORM ================= */
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
  } = useForm<FormData>({
    defaultValues: DEFAULT_VALUES,
    shouldUnregister: false, // 🔥 FIX mất date / animation
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "scores",
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    Promise.all([getAllSubjects(), getAllScoreTypes()])
      .then(([subs, types]) => {
        setSubjects(subs || []);
        setScoreTypes(types || []);
      })
      .catch(() => toast.error("Không thể tải dữ liệu."));
  }, []);

  const isReady = subjects.length > 0 && scoreTypes.length > 0;

  /* ================= SCORE LOGIC ================= */
  const selectedScoreTypeId = watch("scoreTypeId");

  const selectedScoreType = useMemo(
    () => scoreTypes.find((st) => st.id === selectedScoreTypeId),
    [scoreTypes, selectedScoreTypeId]
  );

  const inputCount = selectedScoreType?.weight === 1 ? maxScoreCount : 1;

  /**
   * 🔥 FIX CHÍNH
   * Chỉ thay đổi số ô khi ĐỔI scoreTypeId
   * KHÔNG chạy khi user đang nhập
   */
  const prevScoreTypeRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedScoreTypeId) return;
    if (prevScoreTypeRef.current === selectedScoreTypeId) return;

    prevScoreTypeRef.current = selectedScoreTypeId;

    // Reset mảng scores theo inputCount
    // (làm 1 lần, có chủ đích)
    if (inputCount > fields.length) {
      for (let i = fields.length; i < inputCount; i++) {
        append({ value: "" });
      }
    } else if (inputCount < fields.length) {
      for (let i = fields.length - 1; i >= inputCount; i--) {
        remove(i);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScoreTypeId, inputCount]);

  /* ================= VALIDATION ================= */
  const validateScore = (v?: string) => {
    if (!v) return true;
    const n = Number(v);
    if (Number.isNaN(n)) return "Điểm không hợp lệ";
    if (n < 0 || n > 10) return "Điểm phải từ 0 đến 10";
    return true;
  };

  /* ================= SUBMIT ================= */
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

    if (!data.date) {
      toast.error("Vui lòng chọn ngày kiểm tra.");
      return;
    }

    const validScores = data.scores
      .map((s) => Number(s.value))
      .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 10);

    if (validScores.length === 0) {
      toast.info("Bạn chưa nhập điểm hợp lệ.");
      return;
    }

    setLoading(true);

    try {
      const subjectName =
        subjects.find((s) => s.id === data.subjectId)?.name || "Không rõ môn";

      await Promise.all(
        validScores.map((score) =>
          addLearningResult({
            userId,
            classLevel: data.classLevel,
            semester: data.semester,
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
      reset(DEFAULT_VALUES);
    } catch (err) {
      console.error(err);
      toast.error("❌ Có lỗi xảy ra khi lưu");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */
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
              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* Học kỳ */}
                <div className="form-group">
                  <label>Học kỳ</label>
                  <Controller
                    control={control}
                    name="semester"
                    render={({ field }) => (
                      <select {...field}>
                        <option value={1}>Học kỳ 1</option>
                        <option value={2}>Học kỳ 2</option>
                      </select>
                    )}
                  />
                </div>

                {/* Lớp */}
                <div className="form-group">
                  <label>Lớp</label>
                  <Controller
                    control={control}
                    name="classLevel"
                    render={({ field }) => (
                      <select {...field}>
                        <option value={10}>Lớp 10</option>
                        <option value={11}>Lớp 11</option>
                        <option value={12}>Lớp 12</option>
                      </select>
                    )}
                  />
                </div>

                {/* Môn */}
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

                {/* Loại điểm */}
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

                {/* Điểm */}
                <div className="form-group">
                  <label>Nhập điểm</label>
                  <div className="score-grid">
                    {fields.map((field, i) => (
                      <input
                        key={field.id}
                        type="text"
                        inputMode="decimal"
                        placeholder={`Điểm ${i + 1}`}
                        {...register(`scores.${i}.value`, {
                          validate: validateScore,
                        })}
                      />
                    ))}
                  </div>
                </div>

                {/* Ngày */}
                <div className="form-group">
                  <label>Ngày kiểm tra</label>
                  <Controller
                    control={control}
                    name="date"
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input type="date" {...field} />
                    )}
                  />
                </div>

                {/* Ghi chú */}
                <div className="form-group">
                  <label>Ghi chú</label>
                  <textarea rows={3} {...register("note")} />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => reset(DEFAULT_VALUES)}
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


      {/* ================= CSS GIỮ NGUYÊN ================= */}
      {/* ===== CSS HOÀNH TRÁNG ===== */}
      <style>{`
        .kqht-page{
          min-height:100vh;
          padding:40px 18px;
          background:
            radial-gradient(1200px 600px at 20% 10%, rgba(99,102,241,.18), transparent 60%),
            radial-gradient(900px 500px at 80% 20%, rgba(236,72,153,.16), transparent 60%),
            linear-gradient(135deg, #f7f8ff, #fff7fb);
        }
        .kqht-header{
          max-width: 920px;
          margin: 0 auto 18px;
          text-align:center;
        }
        .kqht-badge{
          display:inline-block;
          padding:8px 12px;
          border-radius:999px;
          font-weight:800;
          font-size:.85rem;
          color:#4338ca;
          background: rgba(99,102,241,.12);
          border: 1px solid rgba(99,102,241,.18);
          backdrop-filter: blur(8px);
          margin-bottom: 10px;
        }
        .kqht-title{
          display:flex;
          justify-content:center;
          align-items:center;
          gap:14px;
          margin: 0;
        }
        .kqht-icon{
          font-size:2.6rem;
          color:#6366f1;
          -webkit-text-fill-color: initial;
        }
        .kqht-text{
          font-size:2.7rem;
          font-weight: 950;
          letter-spacing: -0.5px;
          background: linear-gradient(90deg, #4f46e5, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .kqht-header p{
          margin: 10px 0 0;
          color:#6b7280;
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
        @media (max-width: 700px){
          .score-grid{ grid-template-columns: 1fr; }
          .kqht-text{ font-size: 2.1rem; }
          .kqht-icon{ font-size: 2.2rem; }
        }
        .score-item{
          position:relative;
        }
        .score-pill{
          position:absolute;
          top: -10px;
          left: 10px;
          font-size: .75rem;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(236,72,153,.12);
          border: 1px solid rgba(236,72,153,.18);
          color:#9d174d;
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
      `}</style>
    </div>
  );
}
