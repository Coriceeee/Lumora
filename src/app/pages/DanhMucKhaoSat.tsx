import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  getAllSurveys,
  addSurvey,
  deleteSurvey,
  generateSurveyQuestions,
  generateSurveyTitleFromAnswers,
} from "../../services/surveyService";
import { Survey, SurveyQuestion } from "../../types/Survey";
import { PlusCircle, Trash2, ClipboardList } from "lucide-react";

export default function DanhMucKhaoSat() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "answering">("form");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [otherTexts, setOtherTexts] = useState<Record<string, string>>({});

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const data = await getAllSurveys();
      setSurveys(data);
    } catch (error) {
      toast.error("Lỗi tải danh sách khảo sát");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleStartSurvey = async () => {
    if (!descriptionInput.trim()) {
      toast.warning("Vui lòng nhập mô tả khảo sát");
      return;
    }
    setLoading(true);
    try {
      const questions = await generateSurveyQuestions(
        surveys.map((s) => s.title),
        descriptionInput.trim()  // nhớ truyền mô tả khảo sát
      );
      setSurveyQuestions(questions);
      setAnswers({});
      setOtherTexts({});
      setStep("answering");
    } catch {
      toast.error("Lỗi khi tạo câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, optionIndex: number) => {
    const optionLetter = String.fromCharCode(65 + optionIndex);
    setAnswers((prev) => ({ ...prev, [questionId]: optionLetter }));
    // Nếu đổi câu trả lời, reset phần otherText tương ứng
    setOtherTexts((prev) => ({ ...prev, [questionId]: "" }));
  };

  const handleOtherTextChange = (questionId: string, value: string) => {
    setOtherTexts((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleFinishSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    // Kiểm tra tất cả câu hỏi đã trả lời
    if (surveyQuestions.some((q) => !answers[q.id]?.trim())) {
      toast.warning("Vui lòng trả lời đầy đủ");
      return;
    }
    // Kiểm tra các câu chọn "Khác" đã nhập text chưa
    for (const q of surveyQuestions) {
      const options = q.options ?? [];
      const otherOptionIndex = options.findIndex((opt) =>
        opt.toLowerCase().includes("khác (vui lòng ghi rõ)")
      );
      if (
        otherOptionIndex !== -1 &&
        answers[q.id] === String.fromCharCode(65 + otherOptionIndex) &&
        (!otherTexts[q.id] || !otherTexts[q.id].trim())
      ) {
        toast.warning(`Vui lòng ghi rõ ở câu hỏi: "${q.text}"`);
        return;
      }
    }

    setLoading(true);
    try {
      const surveyTitle = await generateSurveyTitleFromAnswers(answers);
      const newSurvey: Survey = {
        title: surveyTitle,
        description: descriptionInput.trim(),
        questions: surveyQuestions.map((q) => ({
          ...q,
          answer: answers[q.id],
          otherText: otherTexts[q.id] || "",
        })),
        createdAt: new Date(),
      };
      await addSurvey(newSurvey);
      toast.success("Thêm khảo sát thành công");
      fetchSurveys();
      handleCancel();
    } catch {
      toast.error("Lỗi khi lưu khảo sát");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setStep("form");
    setSurveyQuestions([]);
    setAnswers({});
    setOtherTexts({});
    setDescriptionInput("");
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Bạn chắc chắn muốn xóa?")) return;
    setLoading(true);
    try {
      await deleteSurvey(id);
      toast.success("Đã xóa khảo sát");
      fetchSurveys();
    } catch {
      toast.error("Lỗi khi xóa khảo sát");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  return (
    <div className="container py-5">
      {/* Tiêu đề */}
      <h2 className="fw-bold mb-4 d-flex align-items-center gap-2">
        <ClipboardList color="#3ac9b1" size={36} />
        <span
          style={{
            background:
              "linear-gradient(90deg, #2a9d8f 0%, #3ac9b1 50%, #62d6c2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 900,
            fontSize: "2.4rem",
          }}
        >
          Danh Mục Khảo Sát
        </span>
      </h2>

      <AnimatePresence {...({ mode: "wait" } as any)}>
        {step === "form" && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <label className="fw-semibold mb-2">Mô tả khảo sát</label>
            <textarea
              className="form-control mb-3"
              rows={3}
              placeholder="Nhập mô tả ngắn gọn..."
              value={descriptionInput}
              onChange={(e) => setDescriptionInput(e.target.value)}
              disabled={loading}
            />
            <button
              className="btn btn-lg"
              style={{
                background: "linear-gradient(45deg, #3ac9b1, #62d6c2)",
                color: "white",
                borderRadius: 12,
                fontWeight: 700,
              }}
              onClick={handleStartSurvey}
              disabled={loading}
            >
              <PlusCircle className="me-2" /> Tạo khảo sát mới
            </button>
          </motion.div>
        )}

        {step === "answering" && (
          <motion.form
            key="answering"
            onSubmit={handleFinishSurvey}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
          >
            <h4 className="mb-3">Trả lời {surveyQuestions.length} câu hỏi</h4>
            <div className="progress mb-3">
              <div
                className="progress-bar bg-info"
                style={{
                  width: `${
                    (Object.keys(answers).length / surveyQuestions.length) * 100
                  }%`,
                }}
              />
            </div>
            {surveyQuestions.map((q, idx) => {
              const options = q.options ?? [];
              const otherOptionIndex = options.findIndex((opt) =>
                opt.toLowerCase().includes("khác (vui lòng ghi rõ)")
              );
              const isOtherSelected =
                answers[q.id] === String.fromCharCode(65 + otherOptionIndex);

              return (
                <div key={q.id} className="mb-3 p-3 border rounded">
                  <strong>
                    Câu {idx + 1}: {q.text}
                  </strong>
                  {options.map((opt, i) => (
                    <div key={i} className="form-check mt-1">
                      <input
                        className="form-check-input"
                        type="radio"
                        name={q.id}
                        id={`${q.id}-option-${i}`}
                        checked={answers[q.id] === String.fromCharCode(65 + i)}
                        onChange={() => handleAnswerChange(q.id, i)}
                        disabled={loading}
                      />
                      <label
                        className="form-check-label"
                        htmlFor={`${q.id}-option-${i}`}
                      >
                        {opt}
                      </label>
                    </div>
                  ))}
                  {otherOptionIndex !== -1 && isOtherSelected && (
                    <input
                      type="text"
                      className="form-control mt-2"
                      placeholder="Vui lòng ghi rõ..."
                      value={otherTexts[q.id] || ""}
                      onChange={(e) =>
                        handleOtherTextChange(q.id, e.target.value)
                      }
                      disabled={loading}
                    />
                  )}
                </div>
              );
            })}
            <button
              type="submit"
              className="btn btn-info me-2"
              disabled={loading}
            >
              Hoàn tất
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Hủy
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <hr className="my-4" />

      {loading ? (
        <p className="text-center text-info">Đang tải...</p>
      ) : surveys.length === 0 ? (
        <p className="text-center text-muted fst-italic">
          Chưa có khảo sát nào.
        </p>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {surveys.map((survey) => (
            <motion.div
              key={survey.id}
              className="col"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="card h-100 shadow-sm p-3 rounded-4">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="fw-bold">{survey.title}</h5>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDelete(survey.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="text-muted small">{survey.description}</p>
                <details>
                  <summary>Chi tiết kết quả khảo sát</summary>
                  <ol className="mt-2">
                    {survey.questions?.map((q) => (
                      <li key={q.id}>
                        {q.text} —{" "}
                        <strong>
                          {q.answer}
                          {q.otherText ? `: ${q.otherText}` : ""}
                        </strong>
                      </li>
                    ))}
                  </ol>
                </details>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
