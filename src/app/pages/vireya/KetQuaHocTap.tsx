import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "../../../utils/fakeMotion";
import {
  Controller,
  useForm,
  useFieldArray,
<<<<<<< Updated upstream
  FieldErrors,
=======
>>>>>>> Stashed changes
} from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { addLearningResult } from "../../../services/learningResultService";
import { getAllSubjects } from "../../../services/subjectService";
import { getAllScoreTypes } from "../../../services/scoreTypeService";
import { Subject } from "../../../types/Subject";
import { ScoreType } from "../../../types/ScoreType";
import { getAuth } from "firebase/auth";

<<<<<<< Updated upstream
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
=======
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
  note: string;
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

const MAX_SCORE_COUNT = 5;

export default function KetQuaHocTapForm() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scoreTypes, setScoreTypes] = useState<ScoreType[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  /* ================= FORM ================= */
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
    shouldUnregister: true,
    mode: "onBlur",
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "scores",
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setPageLoading(true);
        const [subs, types] = await Promise.all([
          getAllSubjects(),
          getAllScoreTypes(),
        ]);

        if (!isMounted) return;

        setSubjects(Array.isArray(subs) ? subs : []);
        setScoreTypes(Array.isArray(types) ? types : []);
      } catch (error) {
        console.error("Load data error:", error);
        if (isMounted) {
          toast.error("Không thể tải dữ liệu.");
        }
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const isReady = !pageLoading && subjects.length > 0 && scoreTypes.length > 0;

  /* ================= SCORE TYPE / DYNAMIC INPUTS ================= */
  const selectedScoreTypeId = watch("scoreTypeId");

  const selectedScoreType = useMemo(() => {
    return scoreTypes.find((st) => st.id === selectedScoreTypeId) || null;
  }, [scoreTypes, selectedScoreTypeId]);

  useEffect(() => {
    if (!selectedScoreTypeId) {
      replace([]);
      return;
    }

    const nextCount = selectedScoreType?.weight === 1 ? MAX_SCORE_COUNT : 1;
    replace(Array.from({ length: nextCount }, () => ({ value: "" })));
  }, [selectedScoreTypeId, selectedScoreType, replace]);

  /* ================= HELPERS ================= */
  const normalizeScoreString = (value: string) => {
    return value.replace(",", ".").trim();
  };

  const validateScore = (value?: string) => {
    if (!value || value.trim() === "") return true;

    const normalized = normalizeScoreString(value);

    if (!/^\d+(\.\d+)?$/.test(normalized)) {
      return "Chỉ được nhập số hoặc số thập phân";
    }

    const n = Number(normalized);
    if (Number.isNaN(n)) {
      return "Điểm không hợp lệ";
    }

    if (n < 0 || n > 10) {
      return "Điểm phải từ 0 đến 10";
    }

    return true;
  };

  const getTodayString = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  /* ================= SUBMIT ================= */
  const onSubmit = async (data: FormData) => {
    if (submitting) return;

    try {
      setSubmitting(true);

      const userId = getAuth().currentUser?.uid;
      if (!userId) {
        toast.error("Bạn chưa đăng nhập.");
        return;
      }

      if (!data.subjectId) {
        toast.error("Vui lòng chọn môn học.");
        return;
      }

      if (!data.scoreTypeId) {
        toast.error("Vui lòng chọn loại điểm.");
        return;
      }

      if (!data.date) {
        toast.error("Vui lòng chọn ngày kiểm tra.");
        return;
      }

      const today = getTodayString();
      if (data.date > today) {
        toast.error("Ngày kiểm tra không được lớn hơn hôm nay.");
        return;
      }

      const currentSubject = subjects.find((s) => s.id === data.subjectId);
      if (!currentSubject) {
        toast.error("Môn học không hợp lệ.");
        return;
      }

      const currentScoreType = scoreTypes.find((st) => st.id === data.scoreTypeId);
      if (!currentScoreType) {
        toast.error("Loại điểm không hợp lệ.");
        return;
      }

      const subjectName = currentSubject.name || "Không rõ môn";

      const cleanedScores = (data.scores || [])
        .map((item) => normalizeScoreString(item?.value || ""))
        .filter((value) => value !== "")
        .map((value) => Number(value))
        .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 10);

      if (currentScoreType.weight === 1) {
        if (cleanedScores.length === 0) {
          toast.info("Bạn chưa nhập điểm hợp lệ.");
          return;
        }

        const uniqueScores = cleanedScores.filter(
          (score, index, arr) => arr.indexOf(score) === index
        );

        const results = await Promise.allSettled(
          uniqueScores.map((score) =>
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

        const successCount = results.filter(
          (result) => result.status === "fulfilled"
        ).length;
        const failCount = results.filter(
          (result) => result.status === "rejected"
        ).length;

        if (successCount > 0) {
          toast.success(`🌿 Đã lưu ${successCount} điểm`);
          reset(DEFAULT_VALUES);
        }

        if (failCount > 0) {
          toast.warning(`Có ${failCount} điểm lưu thất bại.`);
        }

        if (successCount === 0 && failCount > 0) {
          toast.error("Không thể lưu điểm. Vui lòng thử lại.");
        }

        return;
      }

      if (cleanedScores.length === 0) {
        toast.error("Loại điểm này bắt buộc phải nhập điểm.");
        return;
      }

      const score = cleanedScores[0];

      await addLearningResult({
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
      });

      toast.success("🌿 Đã lưu điểm");
      reset(DEFAULT_VALUES);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Có lỗi xảy ra khi lưu kết quả.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="kqht-page">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="forest-blur forest-blur-1" />
      <div className="forest-blur forest-blur-2" />
      <div className="forest-blur forest-blur-3" />

      {!isReady ? (
        <div className="skeleton-wrap">
          <div className="skeleton-card" />
          <div className="skeleton-card small" />
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 34 }}
            transition={{ duration: 0.45 }}
          >
            <div className="kqht-header">
              <div className="kqht-badge">🌿 Khu rừng tri thức</div>

              <h1 className="kqht-title">
                <span className="kqht-icon">📗</span>
                <span className="kqht-text">Nhập kết quả học tập</span>
              </h1>

              <p>
                Ghi lại từng cột mốc học tập để EduCompass cùng bạn nuôi dưỡng hành
                trình phát triển trong khu rừng tri thức.
              </p>
            </div>

            <div className="form-card">
              <div className="form-card-glow" />

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="form-grid">
                  {/* Học kỳ */}
                  <div className="form-group">
                    <label>Học kỳ</label>
                    <Controller
                      control={control}
                      name="semester"
                      render={({ field }) => (
                        <select
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) as 1 | 2)
                          }
                        >
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
                        <select
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) as 10 | 11 | 12)
                          }
                        >
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
                      rules={{ required: "Vui lòng chọn môn học" }}
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
                    {errors.subjectId && (
                      <span className="field-error">{errors.subjectId.message}</span>
                    )}
                  </div>

                  {/* Loại điểm */}
                  <div className="form-group">
                    <label>Loại điểm</label>
                    <Controller
                      control={control}
                      name="scoreTypeId"
                      rules={{ required: "Vui lòng chọn loại điểm" }}
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
                    {errors.scoreTypeId && (
                      <span className="field-error">{errors.scoreTypeId.message}</span>
                    )}
                  </div>
                </div>

                {/* Điểm */}
                {fields.length > 0 && (
                  <div className="form-group">
                    <label>
                      Nhập điểm
                      {selectedScoreType?.weight === 1 ? " (có thể nhập nhiều)" : ""}
                    </label>

                    <div className="score-grid">
                      {fields.map((field, i) => (
                        <div className="score-item" key={field.id}>
>>>>>>> Stashed changes
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder={`Điểm ${i + 1}`}
                            {...register(`scores.${i}.value`, {
                              validate: validateScore,
<<<<<<< Updated upstream
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
=======
                              onChange: (e) => {
                                const raw = e.target.value ?? "";
                                const sanitized = raw.replace(/[^\d.,]/g, "");

                                if (sanitized !== raw) {
                                  setValue(`scores.${i}.value`, sanitized, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                  });
                                }
                              },
                            })}
                          />
                          {errors.scores?.[i]?.value && (
                            <span className="field-error">
                              {errors.scores[i]?.value?.message}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-grid">
                  {/* Ngày */}
                  <div className="form-group">
                    <label>Ngày kiểm tra</label>
                    <Controller
                      control={control}
                      name="date"
                      rules={{
                        required: "Vui lòng chọn ngày kiểm tra",
                        validate: (value) => {
                          if (!value) return "Vui lòng chọn ngày kiểm tra";
                          if (value > getTodayString()) {
                            return "Ngày kiểm tra không được lớn hơn hôm nay";
                          }
                          return true;
                        },
                      }}
                      render={({ field }) => (
                        <input
                          type="date"
                          max={getTodayString()}
                          {...field}
                        />
                      )}
                    />
                    {errors.date && (
                      <span className="field-error">{errors.date.message}</span>
                    )}
                  </div>

                  {/* Ghi chú */}
                  <div className="form-group full-width">
                    <label>Ghi chú</label>
                    <textarea
                      rows={4}
                      placeholder="Thêm ghi chú nhỏ về bài kiểm tra, cảm nhận hoặc mục tiêu tiếp theo..."
                      {...register("note")}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => reset(DEFAULT_VALUES)}
                    disabled={submitting}
                  >
                    Đặt lại
                  </button>

                  <button
                    type="submit"
                    className="btn-gradient"
                    disabled={submitting}
                  >
                    {submitting ? "Đang lưu..." : "🌱 Lưu kết quả"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <style>{`
        .kqht-page{
          position: relative;
          overflow: hidden;
          min-height: 100vh;
          padding: 46px 18px 64px;
          background:
            radial-gradient(900px 500px at 10% 10%, rgba(96, 165, 250, 0.08), transparent 60%),
            radial-gradient(700px 420px at 90% 18%, rgba(34, 197, 94, 0.10), transparent 60%),
            radial-gradient(1000px 520px at 50% 100%, rgba(16, 185, 129, 0.08), transparent 60%),
            linear-gradient(180deg, #eef9f1 0%, #f6fbf7 35%, #edf7f0 100%);
        }

        .forest-blur{
          position:absolute;
          border-radius:999px;
          filter: blur(70px);
          pointer-events:none;
          z-index:0;
        }

        .forest-blur-1{
          width:260px;
          height:260px;
          background: rgba(34,197,94,.16);
          top: 40px;
          left: -60px;
        }

        .forest-blur-2{
          width:320px;
          height:320px;
          background: rgba(16,185,129,.12);
          top: 160px;
          right: -70px;
        }

        .forest-blur-3{
          width:280px;
          height:280px;
          background: rgba(132,204,22,.10);
          bottom: 20px;
          left: 18%;
        }

        .kqht-header,
        .form-card,
        .skeleton-wrap{
          position: relative;
          z-index: 1;
        }

        .kqht-header{
          max-width: 980px;
          margin: 0 auto 20px;
          text-align:center;
        }

        .kqht-badge{
          display:inline-flex;
          align-items:center;
          gap:8px;
          padding:10px 16px;
          border-radius:999px;
          font-weight:800;
          font-size:.88rem;
          color:#1f5d45;
          background: rgba(255,255,255,.62);
          border: 1px solid rgba(52, 120, 87, .14);
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 24px rgba(34, 84, 61, .08);
          margin-bottom: 12px;
        }

        .kqht-title{
          display:flex;
          justify-content:center;
          align-items:center;
          gap:14px;
          margin: 0;
          flex-wrap: wrap;
        }

        .kqht-icon{
          font-size:2.5rem;
          filter: drop-shadow(0 8px 18px rgba(46, 125, 90, .16));
        }

        .kqht-text{
          font-size: 2.65rem;
          font-weight: 950;
          letter-spacing: -0.8px;
          line-height: 1.08;
          color: #173f31;
          text-shadow: 0 4px 18px rgba(255,255,255,.55);
        }

        .kqht-header p{
          max-width: 700px;
          margin: 14px auto 0;
          color:#4f6f5f;
          font-size: 1rem;
          line-height: 1.7;
        }

        .skeleton-wrap{
          max-width: 980px;
          margin: 24px auto 0;
          display:grid;
          gap: 14px;
          justify-items:center;
        }

        .skeleton-card{
          width: min(940px, 95vw);
          height: 220px;
          border-radius: 28px;
          background:
            linear-gradient(90deg, rgba(255,255,255,.70), rgba(232,244,236,.9), rgba(255,255,255,.70));
          border: 1px solid rgba(42, 92, 68, .08);
          box-shadow: 0 20px 50px rgba(42, 92, 68, .10);
          animation: shimmer 1.2s infinite linear;
          background-size: 200% 100%;
        }

        .skeleton-card.small{
          height: 120px;
          opacity:.92;
        }

        @keyframes shimmer{
          0%{ background-position: 200% 0; }
          100%{ background-position: -200% 0; }
        }

        .form-card{
          width: min(940px, 95vw);
          margin: 22px auto 0;
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(180deg, rgba(255,255,255,.78), rgba(245,251,246,.86));
          border: 1px solid rgba(48, 97, 72, .10);
          border-radius: 30px;
          padding: 30px;
          backdrop-filter: blur(16px);
          box-shadow:
            0 28px 70px rgba(41, 78, 60, .12),
            inset 0 1px 0 rgba(255,255,255,.65);
        }

        .form-card-glow{
          position:absolute;
          inset:0;
          pointer-events:none;
          background:
            radial-gradient(400px 120px at 10% 0%, rgba(255,255,255,.55), transparent 60%),
            radial-gradient(420px 160px at 100% 10%, rgba(187,247,208,.22), transparent 60%);
        }

        .form-grid{
          display:grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .form-group{
          margin-bottom: 18px;
          display:flex;
          flex-direction:column;
          gap: 8px;
        }

        .full-width{
          grid-column: 1 / -1;
        }

        .form-group label{
          font-weight: 800;
          color:#214a39;
          font-size: .97rem;
          letter-spacing: .1px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea{
          border: 1px solid rgba(52, 94, 73, .12);
          border-radius: 16px;
          padding: 13px 15px;
          font-size: 1rem;
          color: #17392d;
          background: rgba(255,255,255,.80);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.6);
          transition:
            transform .22s ease,
            box-shadow .22s ease,
            border-color .22s ease,
            background .22s ease;
          outline: none;
          width: 100%;
          box-sizing: border-box;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder{
          color:#7a9488;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus{
          border-color: rgba(34, 139, 94, .50);
          box-shadow:
            0 0 0 4px rgba(74, 222, 128, .14),
            0 12px 24px rgba(62, 109, 84, .08);
          background: rgba(255,255,255,.95);
          transform: translateY(-1px);
        }

        .score-grid{
          display:grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .score-item{
          display:flex;
          flex-direction:column;
          gap: 6px;
        }

        .field-error{
          font-size: .84rem;
          font-weight: 700;
          color: #c2410c;
          margin-top: 1px;
        }

        .form-actions{
          display:flex;
          gap: 14px;
          margin-top: 12px;
          padding-top: 10px;
        }

        .btn-outline{
          flex: 1;
          padding: 14px 16px;
          border-radius: 16px;
          border: 1.5px solid rgba(58, 99, 77, .18);
          background: rgba(255,255,255,.74);
          color: #214a39;
          font-weight: 900;
          cursor:pointer;
          transition:
            transform .2s ease,
            box-shadow .2s ease,
            border-color .2s ease,
            background .2s ease;
        }

        .btn-outline:hover{
          border-color: rgba(34, 139, 94, .35);
          background: rgba(244, 252, 246, .95);
          box-shadow: 0 12px 26px rgba(41, 78, 60, .08);
          transform: translateY(-1px);
        }

        .btn-gradient{
          flex: 2;
          padding: 14px 16px;
          border-radius: 16px;
          border: none;
          color: #fff;
          font-weight: 950;
          cursor:pointer;
          background: linear-gradient(135deg, #2f855a 0%, #3aa76d 52%, #6dbb75 100%);
          box-shadow:
            0 16px 30px rgba(47, 133, 90, .24),
            inset 0 1px 0 rgba(255,255,255,.18);
          transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
        }

        .btn-gradient:hover{
          transform: translateY(-2px);
          box-shadow: 0 20px 38px rgba(47, 133, 90, .28);
          filter: brightness(1.02);
        }

        .btn-gradient:disabled,
        .btn-outline:disabled{
          opacity: .65;
          cursor:not-allowed;
          transform:none;
          box-shadow:none;
        }

        @media (max-width: 860px){
          .form-grid{
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px){
          .score-grid{
            grid-template-columns: 1fr;
          }

          .kqht-text{
            font-size: 2rem;
          }

          .kqht-icon{
            font-size: 2.1rem;
          }

          .form-card{
            padding: 20px;
            border-radius: 22px;
          }

          .form-actions{
            flex-direction: column;
          }

          .btn-outline,
          .btn-gradient{
            width: 100%;
          }

          .kqht-header p{
            font-size: .95rem;
          }
>>>>>>> Stashed changes
        }
      `}</style>
    </div>
  );
}