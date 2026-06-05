import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "../../../utils/fakeMotion";
import { Controller, useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { addLearningResult } from "../../../services/learningResultService";
import { getAllSubjects } from "../../../services/subjectService";
import { getAllScoreTypes } from "../../../services/scoreTypeService";
import { Subject } from "../../../types/Subject";
import { ScoreType } from "../../../types/ScoreType";
import { useFirebaseUser } from "../../hooks/useFirebaseUser";

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
  const { userId } = useFirebaseUser();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scoreTypes, setScoreTypes] = useState<ScoreType[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Tách giá trị điểm ra khỏi react-hook-form để đổi loại điểm
  // không làm mất điểm vừa nhập trước khi submit.
  const [scoreInputs, setScoreInputs] = useState<string[]>([]);
  const [scoreErrors, setScoreErrors] = useState<string[]>([]);

  const submittingRef = useRef(false);

  /* ================= FORM ================= */
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: DEFAULT_VALUES,
    shouldUnregister: false,
    mode: "onBlur",
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

  const isReady = !pageLoading;

  /* ================= SCORE TYPE / DYNAMIC INPUTS ================= */
  const selectedScoreTypeId = watch("scoreTypeId");

  const selectedScoreType = useMemo(() => {
    return scoreTypes.find((st) => st.id === selectedScoreTypeId) || null;
  }, [scoreTypes, selectedScoreTypeId]);

  const getScoreWeight = (scoreType: ScoreType | null) => {
    return Number(scoreType?.weight ?? 0);
  };

  const getScoreInputCount = (scoreType: ScoreType | null) => {
    return getScoreWeight(scoreType) === 1 ? MAX_SCORE_COUNT : 1;
  };

  const createEmptyScores = (scoreType: ScoreType | null): ScoreItem[] => {
    if (!scoreType) return [];

    return Array.from(
      { length: getScoreInputCount(scoreType) },
      () => ({ value: "" })
    );
  };

  useEffect(() => {
    if (!selectedScoreTypeId || !selectedScoreType) {
      setScoreInputs([]);
      setScoreErrors([]);
      clearErrors("scores");
      return;
    }

    const inputCount = getScoreInputCount(selectedScoreType);
    setScoreInputs(Array.from({ length: inputCount }, () => ""));
    setScoreErrors(Array.from({ length: inputCount }, () => ""));
    clearErrors("scores");
  }, [selectedScoreTypeId, selectedScoreType, clearErrors]);

  const scoreInputCount = scoreInputs.length;

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

    const numberValue = Number(normalized);

    if (Number.isNaN(numberValue)) {
      return "Điểm không hợp lệ";
    }

    if (numberValue < 0 || numberValue > 10) {
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

  const clearScoreInputsButKeepSelection = (
    data: FormData,
    scoreType: ScoreType
  ) => {
    const inputCount = getScoreInputCount(scoreType);

    reset({
      ...data,
      scores: [],
      note: "",
    });

    setScoreInputs(Array.from({ length: inputCount }, () => ""));
    setScoreErrors(Array.from({ length: inputCount }, () => ""));
    clearErrors("scores");
  };

  /* ================= SUBMIT ================= */
  const onSubmit = async (data: FormData) => {
    if (submittingRef.current) return;

    try {
      submittingRef.current = true;
      setSubmitting(true);

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

      const currentScoreType = scoreTypes.find(
        (st) => st.id === data.scoreTypeId
      );

      if (!currentScoreType) {
        toast.error("Loại điểm không hợp lệ.");
        return;
      }

      const subjectName = currentSubject.name || "Không rõ môn";
      const currentScoreWeight = Number(currentScoreType.weight);

      // Đọc điểm từ state riêng, không đọc từ field động của react-hook-form.
      // Sửa lỗi đã nhập Giữa kỳ/Cuối kỳ nhưng submit vẫn nhận mảng rỗng.
      const enteredScores = scoreInputs
        .map((value) => normalizeScoreString(value || ""))
        .filter((value) => value !== "");

      const invalidScoreIndex = scoreInputs.findIndex((value) => {
        const normalized = normalizeScoreString(value || "");
        return normalized !== "" && validateScore(normalized) !== true;
      });

      if (invalidScoreIndex !== -1) {
        const result = validateScore(scoreInputs[invalidScoreIndex]);
        const message = result === true ? "Điểm không hợp lệ" : String(result);

        setScoreErrors((previous) => {
          const next = [...previous];
          next[invalidScoreIndex] = message;
          return next;
        });

        toast.error(message);
        return;
      }

      const cleanedScores = enteredScores.map((value) => Number(value));

      /*
        Điểm thường xuyên:
        - Cho nhập nhiều điểm cùng lúc.
        - Không reset lại môn học / loại điểm sau khi lưu.
        - Chỉ làm trống các ô điểm để nhập tiếp.
      */
      if (currentScoreWeight === 1) {
        if (cleanedScores.length === 0) {
          toast.info("Bạn chưa nhập điểm hợp lệ.");
          return;
        }

        const results = await Promise.allSettled(
          cleanedScores.map((score) =>
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

          clearScoreInputsButKeepSelection(data, currentScoreType);
        }

        if (failCount > 0) {
          toast.warning(`Có ${failCount} điểm lưu thất bại.`);
        }

        if (successCount === 0 && failCount > 0) {
          toast.error("Không thể lưu điểm. Vui lòng thử lại.");
        }

        return;
      }

      /*
        Điểm giữa kỳ / cuối kỳ:
        - Chỉ lấy một điểm.
        - Vẫn giữ nguyên lựa chọn sau khi lưu để có thể nhập liên tục.
      */
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

      clearScoreInputsButKeepSelection(data, currentScoreType);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Có lỗi xảy ra khi lưu kết quả.");
    } finally {
      submittingRef.current = false;
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
                Ghi lại từng cột mốc học tập để EduCompass cùng bạn nuôi dưỡng
                hành trình phát triển trong khu rừng tri thức.
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
                            field.onChange(
                              Number(e.target.value) as 10 | 11 | 12
                            )
                          }
                        >
                          <option value={10}>Lớp 10</option>
                          <option value={11}>Lớp 11</option>
                          <option value={12}>Lớp 12</option>
                        </select>
                      )}
                    />
                  </div>

                  {/* Môn học */}
                  <div className="form-group">
                    <label>Môn học</label>

                    <Controller
                      control={control}
                      name="subjectId"
                      rules={{ required: "Vui lòng chọn môn học" }}
                      render={({ field }) => (
                        <select {...field}>
                          <option value="">-- Chọn môn --</option>

                          {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                              {subject.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />

                    {errors.subjectId && (
                      <span className="field-error">
                        {errors.subjectId.message}
                      </span>
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

                          {scoreTypes.map((scoreType) => (
                            <option key={scoreType.id} value={scoreType.id}>
                              {scoreType.name}
                            </option>
                          ))}
                        </select>
                      )}
                    />

                    {errors.scoreTypeId && (
                      <span className="field-error">
                        {errors.scoreTypeId.message}
                      </span>
                    )}
                  </div>
                </div>

                {/* Điểm */}
                {scoreInputCount > 0 && (
                  <div className="form-group">
                    <label>
                      Nhập điểm
                      {getScoreWeight(selectedScoreType) === 1
                        ? " (có thể nhập nhiều)"
                        : ""}
                    </label>

                    <div className="score-grid">
                      {Array.from({ length: scoreInputCount }).map((_, i) => (
                        <div
                          className="score-item"
                          key={`${selectedScoreTypeId}-${i}`}
                        >
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder={`Điểm ${i + 1}`}
                            value={scoreInputs[i] ?? ""}
                            onChange={(e) => {
                              const sanitized = (e.target.value ?? "").replace(
                                /[^\d.,]/g,
                                ""
                              );

                              setScoreInputs((previous) => {
                                const next = [...previous];
                                next[i] = sanitized;
                                return next;
                              });

                              setScoreErrors((previous) => {
                                const next = [...previous];
                                next[i] = "";
                                return next;
                              });
                            }}
                            onBlur={() => {
                              const result = validateScore(scoreInputs[i]);

                              setScoreErrors((previous) => {
                                const next = [...previous];
                                next[i] = result === true ? "" : String(result);
                                return next;
                              });
                            }}
                          />

                          {scoreErrors[i] && (
                            <span className="field-error">
                              {scoreErrors[i]}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="form-grid">
                  {/* Ngày kiểm tra */}
                  <div className="form-group">
                    <label>Ngày kiểm tra</label>

                    <Controller
                      control={control}
                      name="date"
                      rules={{
                        required: "Vui lòng chọn ngày kiểm tra",
                        validate: (value) => {
                          if (!value) {
                            return "Vui lòng chọn ngày kiểm tra";
                          }

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
                      <span className="field-error">
                        {errors.date.message}
                      </span>
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
                    onClick={() => {
                      reset(DEFAULT_VALUES);
                      setScoreInputs([]);
                      setScoreErrors([]);
                      clearErrors();
                    }}
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
        .kqht-page {
          position: relative;
          overflow: hidden;
          min-height: 100vh;
          padding: 46px 18px 64px;
          background:
            radial-gradient(
              900px 500px at 10% 10%,
              rgba(96, 165, 250, 0.08),
              transparent 60%
            ),
            radial-gradient(
              700px 420px at 90% 18%,
              rgba(34, 197, 94, 0.1),
              transparent 60%
            ),
            radial-gradient(
              1000px 520px at 50% 100%,
              rgba(16, 185, 129, 0.08),
              transparent 60%
            ),
            linear-gradient(180deg, #eef9f1 0%, #f6fbf7 35%, #edf7f0 100%);
        }

        .forest-blur {
          position: absolute;
          border-radius: 999px;
          filter: blur(70px);
          pointer-events: none;
          z-index: 0;
        }

        .forest-blur-1 {
          width: 260px;
          height: 260px;
          background: rgba(34, 197, 94, 0.16);
          top: 40px;
          left: -60px;
        }

        .forest-blur-2 {
          width: 320px;
          height: 320px;
          background: rgba(16, 185, 129, 0.12);
          top: 160px;
          right: -70px;
        }

        .forest-blur-3 {
          width: 280px;
          height: 280px;
          background: rgba(132, 204, 22, 0.1);
          bottom: 20px;
          left: 18%;
        }

        .kqht-header,
        .form-card,
        .skeleton-wrap {
          position: relative;
          z-index: 1;
        }

        .kqht-header {
          max-width: 980px;
          margin: 0 auto 20px;
          text-align: center;
        }

        .kqht-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 999px;
          font-weight: 800;
          font-size: 0.88rem;
          color: #1f5d45;
          background: rgba(255, 255, 255, 0.62);
          border: 1px solid rgba(52, 120, 87, 0.14);
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 24px rgba(34, 84, 61, 0.08);
          margin-bottom: 12px;
        }

        .kqht-title {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 14px;
          margin: 0;
          flex-wrap: wrap;
        }

        .kqht-icon {
          font-size: 2.5rem;
          filter: drop-shadow(0 8px 18px rgba(46, 125, 90, 0.16));
        }

        .kqht-text {
          font-size: 2.65rem;
          font-weight: 950;
          letter-spacing: -0.8px;
          line-height: 1.08;
          color: #173f31;
          text-shadow: 0 4px 18px rgba(255, 255, 255, 0.55);
        }

        .kqht-header p {
          max-width: 700px;
          margin: 14px auto 0;
          color: #4f6f5f;
          font-size: 1rem;
          line-height: 1.7;
        }

        .skeleton-wrap {
          max-width: 980px;
          margin: 24px auto 0;
          display: grid;
          gap: 14px;
          justify-items: center;
        }

        .skeleton-card {
          width: min(940px, 95vw);
          height: 220px;
          border-radius: 28px;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.7),
            rgba(232, 244, 236, 0.9),
            rgba(255, 255, 255, 0.7)
          );
          border: 1px solid rgba(42, 92, 68, 0.08);
          box-shadow: 0 20px 50px rgba(42, 92, 68, 0.1);
          animation: shimmer 1.2s infinite linear;
          background-size: 200% 100%;
        }

        .skeleton-card.small {
          height: 120px;
          opacity: 0.92;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }

        .form-card {
          width: min(940px, 95vw);
          margin: 22px auto 0;
          position: relative;
          overflow: hidden;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.78),
            rgba(245, 251, 246, 0.86)
          );
          border: 1px solid rgba(48, 97, 72, 0.1);
          border-radius: 30px;
          padding: 30px;
          backdrop-filter: blur(16px);
          box-shadow:
            0 28px 70px rgba(41, 78, 60, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.65);
        }

        .form-card-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(
              400px 120px at 10% 0%,
              rgba(255, 255, 255, 0.55),
              transparent 60%
            ),
            radial-gradient(
              420px 160px at 100% 10%,
              rgba(187, 247, 208, 0.22),
              transparent 60%
            );
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .form-group {
          margin-bottom: 18px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-weight: 800;
          color: #214a39;
          font-size: 0.97rem;
          letter-spacing: 0.1px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          border: 1px solid rgba(52, 94, 73, 0.12);
          border-radius: 16px;
          padding: 13px 15px;
          font-size: 1rem;
          color: #17392d;
          background: rgba(255, 255, 255, 0.8);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
          transition:
            transform 0.22s ease,
            box-shadow 0.22s ease,
            border-color 0.22s ease,
            background 0.22s ease;
          outline: none;
          width: 100%;
          box-sizing: border-box;
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: #7a9488;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          border-color: rgba(34, 139, 94, 0.5);
          box-shadow:
            0 0 0 4px rgba(74, 222, 128, 0.14),
            0 12px 24px rgba(62, 109, 84, 0.08);
          background: rgba(255, 255, 255, 0.95);
          transform: translateY(-1px);
        }

        .score-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .score-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-error {
          font-size: 0.84rem;
          font-weight: 700;
          color: #c2410c;
          margin-top: 1px;
        }

        .form-actions {
          display: flex;
          gap: 14px;
          margin-top: 12px;
          padding-top: 10px;
        }

        .btn-outline {
          flex: 1;
          padding: 14px 16px;
          border-radius: 16px;
          border: 1.5px solid rgba(58, 99, 77, 0.18);
          background: rgba(255, 255, 255, 0.74);
          color: #214a39;
          font-weight: 900;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .btn-outline:hover {
          border-color: rgba(34, 139, 94, 0.35);
          background: rgba(244, 252, 246, 0.95);
          box-shadow: 0 12px 26px rgba(41, 78, 60, 0.08);
          transform: translateY(-1px);
        }

        .btn-gradient {
          flex: 2;
          padding: 14px 16px;
          border-radius: 16px;
          border: none;
          color: #ffffff;
          font-weight: 950;
          cursor: pointer;
          background: linear-gradient(
            135deg,
            #2f855a 0%,
            #3aa76d 52%,
            #6dbb75 100%
          );
          box-shadow:
            0 16px 30px rgba(47, 133, 90, 0.24),
            inset 0 1px 0 rgba(255, 255, 255, 0.18);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            filter 0.2s ease;
        }

        .btn-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 38px rgba(47, 133, 90, 0.28);
          filter: brightness(1.02);
        }

        .btn-gradient:disabled,
        .btn-outline:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        @media (max-width: 860px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .kqht-page {
            padding: 28px 12px 40px;
          }

          .score-grid {
            grid-template-columns: 1fr;
          }

          .kqht-text {
            font-size: 2rem;
          }

          .kqht-icon {
            font-size: 2.1rem;
          }

          .form-card {
            width: 100%;
            padding: 20px;
            border-radius: 22px;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn-outline,
          .btn-gradient {
            width: 100%;
          }

          .kqht-header p {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
}