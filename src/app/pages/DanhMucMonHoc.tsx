import React, { useEffect, useState } from "react";
import {
  getAllSubjects,
  addSubject,
  deleteSubject,
} from "../../services/subjectService";
import { Subject } from "../../types/Subject";

export default function DanhMucMonHoc() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState<Subject>({
    code: "",
    name: "",
    description: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const data = await getAllSubjects();
      setSubjects(data);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newSubject.code.trim() || !newSubject.name.trim()) {
      alert("Mã môn học và Tên môn học không được để trống.");
      return;
    }
    try {
      await addSubject(newSubject);
      setNewSubject({ code: "", name: "", description: "" });
      setShowForm(false);
      fetchSubjects();
    } catch (error) {
      alert("Lỗi khi thêm môn học.");
      console.error(error);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Bạn có chắc muốn xóa môn học này?")) return;
    try {
      await deleteSubject(id);
      fetchSubjects();
    } catch (error) {
      alert("Lỗi khi xóa môn học.");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2
          className="fw-extrabold d-flex align-items-center"
          style={{ fontSize: "2.8rem", userSelect: "none" }}
        >
          <i
            className="bi bi-journal-bookmark me-3"
            style={{ color: "#1e3c72", fontSize: "2.8rem", flexShrink: 0 }}
          />
          <span
            style={{
              background:
                "linear-gradient(90deg, #1e3c72 0%, #2a5298 50%, #4a90e2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "900",
            }}
          >
            Danh Mục Môn Học
          </span>
        </h2>
        <button
          className="btn btn-lg btn-gradient"
          style={{
            background: "linear-gradient(45deg, #4a90e2 0%, #82b1ff 100%)",
            color: "white",
            fontWeight: "600",
            boxShadow: "0 4px 15px rgba(74, 144, 226, 0.4)",
            border: "none",
          }}
          onClick={() => setShowForm((v) => !v)}
          aria-expanded={showForm}
          aria-controls="subject-form"
        >
          {showForm ? (
            <>
              <i className="bi bi-x-circle me-2"></i> Đóng form
            </>
          ) : (
            <>
              <i className="bi bi-journal-plus me-2"></i> Thêm môn học
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div
          id="subject-form"
          className="card shadow-lg border-0 p-4 mb-5"
          style={{
            maxWidth: 600,
            backgroundColor: "#e8f0fe",
            borderRadius: 16,
          }}
        >
          <div className="mb-3">
            <label className="form-label fw-semibold">Mã môn học *</label>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Nhập mã môn học"
              value={newSubject.code}
              onChange={(e) =>
                setNewSubject({ ...newSubject, code: e.target.value })
              }
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Tên môn học *</label>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Nhập tên môn học"
              value={newSubject.name}
              onChange={(e) =>
                setNewSubject({ ...newSubject, name: e.target.value })
              }
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Diễn giải</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Mô tả ngắn gọn về môn học"
              value={newSubject.description}
              onChange={(e) =>
                setNewSubject({ ...newSubject, description: e.target.value })
              }
            />
          </div>

          <button
            className="btn btn-gradient btn-lg w-100"
            onClick={handleAdd}
            style={{
              background: "linear-gradient(45deg, #4a90e2 0%, #82b1ff 100%)",
              color: "white",
              fontWeight: "700",
              borderRadius: 12,
            }}
          >
            <i className="bi bi-save2 me-2"></i> Lưu môn học
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status" />
          <p className="mt-3 text-info">Đang tải danh sách môn học...</p>
        </div>
      ) : subjects.length === 0 ? (
        <p className="text-center text-muted fst-italic">
          Chưa có môn học nào. Hãy thêm mới nhé!
        </p>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="col"
              title={subject.description || "Không có mô tả"}
            >
              <div
                className="card h-100 shadow"
                style={{
                  borderRadius: 18,
                  border: "2px solid transparent",
                  transition: "all 0.3s ease",
                  cursor: "default",
                  backgroundColor: "#f0f6ff",
                  boxShadow:
                    "0 0 15px 2px rgba(74, 144, 226, 0.15), 0 4px 20px rgba(130, 177, 255, 0.15)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-6px)";
                  el.style.borderColor = "#4a90e2";
                  el.style.boxShadow =
                    "0 0 20px 4px rgba(74, 144, 226, 0.3), 0 8px 30px rgba(130, 177, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "none";
                  el.style.borderColor = "transparent";
                  el.style.boxShadow =
                    "0 0 15px 2px rgba(74, 144, 226, 0.15), 0 4px 20px rgba(130, 177, 255, 0.15)";
                }}
              >
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5
                      className="card-title text-gradient fw-bold"
                      style={{
                        background:
                          "linear-gradient(90deg, #1e3c72 0%, #2a5298 50%, #4a90e2 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: "900",
                        fontSize: "1.5rem",
                        marginBottom: 0,
                      }}
                    >
                      <i className="bi bi-book-half me-2"></i>
                      {subject.name}
                    </h5>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      title="Xóa môn học"
                      onClick={() => handleDelete(subject.id)}
                      aria-label={`Xóa môn học ${subject.name}`}
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
                    Mã môn học: <span className="fw-semibold">{subject.code}</span>
                  </p>
                  <p
                    className="flex-grow-1 text-secondary"
                    style={{ minHeight: "3.6rem" }}
                  >
                    {subject.description || <i>Chưa có mô tả.</i>}
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
