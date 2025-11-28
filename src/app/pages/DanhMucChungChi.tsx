// DanhMucChungChi.tsx — FULL USER-ONLY VERSION
import { useEffect, useState } from "react";

import {
  addUserCertificate,
  deleteUserCertificate,
  getUserCertificatesFirestore,
} from "../../services/userSkillCertService";

import { Certificate } from "../../types/Certificate";
import { getAuth } from "firebase/auth";

// AUTO CODE GEN
const generateCode = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [newCert, setNewCert] = useState<Certificate>({
    name: "",
    description: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const userId = getAuth().currentUser?.uid || "";

  /* ------------------------------------------- */
  /*  FETCH USER CERTIFICATES ONLY               */
  /* ------------------------------------------- */
  const fetchCertificates = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const data = (await getUserCertificatesFirestore(userId)) as Certificate[] | null;
      setCertificates(data || []);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------- */
  /*  ADD USER CERTIFICATE                       */
  /* ------------------------------------------- */
  const handleAdd = async () => {
    if (!newCert.name.trim())
      return alert("Tên chứng chỉ không được để trống.");

    try {
      await addUserCertificate(userId, {
        code: generateCode(newCert.name),
        name: newCert.name,
        description: newCert.description,
        status: "existing",
      });

      setNewCert({ name: "", description: "" });
      setShowForm(false);
      fetchCertificates();
    } catch (error) {
      alert("Lỗi khi thêm chứng chỉ.");
      console.error(error);
    }
  };

  /* ------------------------------------------- */
  /*  DELETE USER CERTIFICATE                    */
  /* ------------------------------------------- */
  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Bạn có chắc muốn xóa chứng chỉ này?")) return;

    try {
      await deleteUserCertificate(userId, id);
      fetchCertificates();
    } catch (error) {
      alert("Lỗi khi xóa chứng chỉ.");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  /* ------------------------------------------- */
  /*  UI RENDER                                  */
  /* ------------------------------------------- */
  return (
    <div className="container py-5">
      {/* HEADER */}
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
          🎖 Chứng Chỉ Của Bạn
        </h2>

        <button
          className="btn btn-lg btn-gradient"
          style={{
            background: "linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)",
            color: "white",
            fontWeight: "600",
            boxShadow: "0 4px 15px rgba(101, 71, 255, 0.4)",
            border: "none",
          }}
          onClick={() => setShowForm((v) => !v)}
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

      {/* FORM ADD */}
      {showForm && (
        <div
          className="card shadow-lg border-0 p-4 mb-5"
          style={{
            maxWidth: 600,
            backgroundColor: "#f5f0ff",
            borderRadius: 16,
          }}
        >
          <div className="mb-3">
            <label className="form-label fw-semibold">Tên chứng chỉ *</label>
            <input
              type="text"
              className="form-control form-control-lg"
              value={newCert.name}
              onChange={(e) =>
                setNewCert({ ...newCert, name: e.target.value })
              }
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Mô tả</label>
            <textarea
              className="form-control"
              rows={3}
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
              background: "linear-gradient(45deg, #6a11cb 0%, #2575fc 100%)",
              color: "white",
              fontWeight: "700",
              borderRadius: 12,
            }}
          >
            <i className="bi bi-save2 me-2"></i> Lưu chứng chỉ
          </button>
        </div>
      )}

      {/* LIST */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-info"></div>
          <p className="mt-3 text-info">Đang tải chứng chỉ...</p>
        </div>
      ) : certificates.length === 0 ? (
        <p className="text-center text-muted fst-italic">
          Bạn chưa có chứng chỉ nào. Hãy thêm mới nhé!
        </p>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="col">
              <div
                className="card h-100 shadow"
                style={{
                  borderRadius: 18,
                  backgroundColor: "#faf8ff",
                }}
              >
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5
                      className="card-title fw-bold"
                      style={{ fontSize: "1.4rem" }}
                    >
                      <i className="bi bi-award me-2"></i>
                      {cert.name}
                    </h5>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(cert.id)}
                    >
                      <i className="bi bi-trash3"></i>
                    </button>
                  </div>

                  <p className="text-secondary flex-grow-1">
                    {cert.description || <i>Không có mô tả.</i>}
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
