import React, { useEffect, useState } from "react";
import { getAllSurveys, addSurvey, deleteSurvey } from "../../services/surveyService";
import { Survey } from "../../types/Survey";

export default function DanhMucKhaoSat() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [newSurvey, setNewSurvey] = useState<Survey>({
    title: "",
    description: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const data = await getAllSurveys();
      setSurveys(data);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if ( !newSurvey.title.trim()) {
      alert("Mã khảo sát và Tiêu đề khảo sát không được để trống.");
      return;
    }
    try {
      await addSurvey(newSurvey);
      setNewSurvey({  title: "", description: "" });
      setShowForm(false);
      fetchSurveys();
    } catch (error) {
      alert("Lỗi khi thêm khảo sát.");
      console.error(error);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Bạn có chắc muốn xóa khảo sát này?")) return;
    try {
      await deleteSurvey(id);
      fetchSurveys();
    } catch (error) {
      alert("Lỗi khi xóa khảo sát.");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2
          className="fw-extrabold d-flex align-items-center"
          style={{ fontSize: "2.8rem", userSelect: "none" }}
        >
          <i
            className="bi bi-clipboard2-check me-3"
            style={{ color: "#2a9d8f", fontSize: "2.8rem", flexShrink: 0 }}
          />
          <span
            style={{
              background:
                "linear-gradient(90deg, #2a9d8f 0%, #3ac9b1 50%, #62d6c2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "900",
            }}
          >
            Danh Mục Khảo Sát
          </span>
        </h2>
        <button
          className="btn btn-lg btn-gradient"
          style={{
            background: "linear-gradient(45deg, #3ac9b1 0%, #62d6c2 100%)",
            color: "white",
            fontWeight: "600",
            boxShadow: "0 4px 15px rgba(58, 201, 177, 0.4)",
            border: "none",
          }}
          onClick={() => setShowForm((v) => !v)}
          aria-expanded={showForm}
          aria-controls="survey-form"
        >
          {showForm ? (
            <>
              <i className="bi bi-x-circle me-2"></i> Đóng form
            </>
          ) : (
            <>
              <i className="bi bi-journal-plus me-2"></i> Thêm khảo sát
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div
          id="survey-form"
          className="card shadow-lg border-0 p-4 mb-5"
          style={{
            maxWidth: 600,
            backgroundColor: "#e0f2f1",
            borderRadius: 16,
          }}
        >

          <div className="mb-3">
            <label className="form-label fw-semibold">Tiêu đề khảo sát *</label>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Nhập tiêu đề khảo sát"
              value={newSurvey.title}
              onChange={(e) =>
                setNewSurvey({ ...newSurvey, title: e.target.value })
              }
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Mô tả</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Mô tả ngắn gọn về khảo sát"
              value={newSurvey.description}
              onChange={(e) =>
                setNewSurvey({ ...newSurvey, description: e.target.value })
              }
            />
          </div>

          <button
            className="btn btn-gradient btn-lg w-100"
            onClick={handleAdd}
            style={{
              background: "linear-gradient(45deg, #3ac9b1 0%, #62d6c2 100%)",
              color: "white",
              fontWeight: "700",
              borderRadius: 12,
            }}
          >
            <i className="bi bi-save2 me-2"></i> Lưu khảo sát
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status" />
          <p className="mt-3 text-info">Đang tải danh sách khảo sát...</p>
        </div>
      ) : surveys.length === 0 ? (
        <p className="text-center text-muted fst-italic">
          Chưa có khảo sát nào. Hãy thêm mới nhé!
        </p>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {surveys.map((survey) => (
            <div
              key={survey.id}
              className="col"
              title={survey.description || "Không có mô tả"}
            >
              <div
                className="card h-100 shadow"
                style={{
                  borderRadius: 18,
                  border: "2px solid transparent",
                  transition: "all 0.3s ease",
                  cursor: "default",
                  backgroundColor: "#d0f0ec",
                  boxShadow:
                    "0 0 15px 2px rgba(58, 201, 177, 0.15), 0 4px 20px rgba(98, 214, 194, 0.15)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-6px)";
                  el.style.borderColor = "#3ac9b1";
                  el.style.boxShadow =
                    "0 0 20px 4px rgba(58, 201, 177, 0.3), 0 8px 30px rgba(98, 214, 194, 0.3)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "none";
                  el.style.borderColor = "transparent";
                  el.style.boxShadow =
                    "0 0 15px 2px rgba(58, 201, 177, 0.15), 0 4px 20px rgba(98, 214, 194, 0.15)";
                }}
              >
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5
                      className="card-title text-gradient fw-bold"
                      style={{
                        background:
                          "linear-gradient(90deg, #2a9d8f 0%, #3ac9b1 50%, #62d6c2 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: "900",
                        fontSize: "1.5rem",
                        marginBottom: 0,
                      }}
                    >
                      <i className="bi bi-journal-text me-2"></i>
                      {survey.title}
                    </h5>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      title="Xóa khảo sát"
                      onClick={() => handleDelete(survey.id)}
                      aria-label={`Xóa khảo sát ${survey.title}`}
                      style={{ transition: "all 0.3s ease" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#d6336c")
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                    >
                      <i className="bi bi-trash3"></i>
                    </button>
                  </div>
                  <p
                    className="text-muted fst-italic small mb-1"
                    style={{ userSelect: "none" }}
                  >
                  
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
