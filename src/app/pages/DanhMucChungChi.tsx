import React, { useEffect, useState } from "react";
import {
  getAllCertificates,
  addCertificate,
  deleteCertificate,
} from "../../services/certificateService";
import { Certificate } from "../../types/Certificate";

const levelColors = {
  "Cơ bản": "text-primary bg-primary bg-opacity-10 border border-primary",
  "Trung bình": "text-warning bg-warning bg-opacity-10 border border-warning",
  "Nâng cao": "text-danger bg-danger bg-opacity-10 border border-danger",
};

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [newCert, setNewCert] = useState<Certificate>({
    code: "",
    name: "",
    level: "Cơ bản",
    description: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const data = await getAllCertificates();
      setCertificates(data);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCert.code.trim() || !newCert.name.trim()) {
      alert("Mã và tên chứng chỉ không được để trống.");
      return;
    }
    try {
      await addCertificate(newCert);
      setNewCert({ code: "", name: "", level: "Cơ bản", description: "" });
      setShowForm(false);
      fetchCertificates();
    } catch (error) {
      alert("Lỗi khi thêm chứng chỉ.");
      console.error(error);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Bạn có chắc muốn xóa chứng chỉ này?")) return;
    try {
      await deleteCertificate(id);
      fetchCertificates();
    } catch (error) {
      alert("Lỗi khi xóa chứng chỉ.");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2
          className="fw-extrabold text-gradient"
          style={{
            fontSize: "2.5rem",
            background:
              "linear-gradient(90deg, #5a2a83 0%, #8b40f4 50%, #c380ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            userSelect: "none",
          }}
        >
          🎖 Danh Mục Chứng Chỉ
        </h2>
        <button
          className="btn btn-lg btn-gradient"
          style={{
            background:
              "linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)",
            color: "white",
            fontWeight: "600",
            boxShadow: "0 4px 15px rgba(101, 71, 255, 0.4)",
            border: "none",
          }}
          onClick={() => setShowForm((v) => !v)}
          aria-expanded={showForm}
          aria-controls="cert-form"
        >
          {showForm ? (
            <>
              <i className="bi bi-x-circle me-2"></i> Đóng form
            </>
          ) : (
            <>
              <i className="bi bi-award me-2"></i> Thêm chứng chỉ
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div
          id="cert-form"
          className="card shadow-lg border-0 p-4 mb-5"
          style={{
            maxWidth: 600,
            backgroundColor: "#f5f0ff",
            borderRadius: 16,
          }}
        >
          <div className="mb-3">
            <label className="form-label fw-semibold">Mã chứng chỉ *</label>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Nhập mã chứng chỉ"
              value={newCert.code}
              onChange={(e) =>
                setNewCert({ ...newCert, code: e.target.value })
              }
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Tên chứng chỉ *</label>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Nhập tên chứng chỉ"
              value={newCert.name}
              onChange={(e) =>
                setNewCert({ ...newCert, name: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Cấp độ</label>
            <select
              className="form-select form-select-lg"
              value={newCert.level}
              onChange={(e) =>
                setNewCert({ ...newCert, level: e.target.value as Certificate["level"] })
              }
            >
              <option>Cơ bản</option>
              <option>Trung bình</option>
              <option>Nâng cao</option>
            </select>
            <small className="form-text text-muted mt-1">
              Cấp độ giúp phân loại mức độ chuyên môn của chứng chỉ.
            </small>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Mô tả</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Mô tả ngắn gọn về chứng chỉ"
              value={newCert.description}
              onChange={(e) =>
                setNewCert({ ...newCert, description: e.target.value })
              }
            />
          </div>

          <button
            className="btn btn-gradient btn-lg w-100"
            onClick={handleAdd}
            style={{
              background:
                "linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)",
              color: "white",
              fontWeight: "700",
              borderRadius: 12,
            }}
          >
            <i className="bi bi-save2 me-2"></i> Lưu chứng chỉ
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info" role="status" />
          <p className="mt-3 text-info">Đang tải danh sách chứng chỉ...</p>
        </div>
      ) : certificates.length === 0 ? (
        <p className="text-center text-muted fst-italic">
          Chưa có chứng chỉ nào. Hãy thêm mới nhé!
        </p>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="col">
              <div
                className="card h-100 shadow"
                style={{
                  borderRadius: 18,
                  border: "2px solid transparent",
                  transition: "all 0.3s ease",
                  cursor: "default",
                  backgroundColor: "#faf8ff",
                  boxShadow:
                    "0 0 15px 2px rgba(106, 17, 203, 0.15), 0 4px 20px rgba(37, 117, 252, 0.15)",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-6px)";
                  el.style.borderColor = "#6a11cb";
                  el.style.boxShadow =
                    "0 0 20px 4px rgba(106, 17, 203, 0.3), 0 8px 30px rgba(37, 117, 252, 0.3)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "none";
                  el.style.borderColor = "transparent";
                  el.style.boxShadow =
                    "0 0 15px 2px rgba(106, 17, 203, 0.15), 0 4px 20px rgba(37, 117, 252, 0.15)";
                }}
                title={cert.description || "Không có mô tả"}
              >
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5
                      className="card-title text-gradient"
                      style={{
                        background:
                          "linear-gradient(90deg, #5a2a83 0%, #8b40f4 50%, #c380ff 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontWeight: "800",
                        fontSize: "1.4rem",
                        marginBottom: 0,
                      }}
                    >
                      <i className="bi bi-award me-2"></i>
                      {cert.name}
                    </h5>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      title="Xóa chứng chỉ"
                      onClick={() => handleDelete(cert.id)}
                      aria-label={`Xóa chứng chỉ ${cert.name}`}
                      style={{
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#d6336c")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "")
                      }
                    >
                      <i className="bi bi-trash3"></i>
                    </button>
                  </div>
                  <p className="text-muted fst-italic small mb-1">
                    Mã: <span className="fw-semibold">{cert.code}</span>
                  </p>
                  <p className="flex-grow-1 text-secondary" style={{minHeight: "3.6rem"}}>
                    {cert.description || <i>Chưa có mô tả.</i>}
                  </p>
                  <span
                    className={`badge rounded-pill py-2 px-3 fw-semibold ${levelColors[cert.level]}`}
                    style={{ fontSize: "0.85rem", userSelect: "none" }}
                    title={`Cấp độ: ${cert.level}`}
                  >
                    {cert.level}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
