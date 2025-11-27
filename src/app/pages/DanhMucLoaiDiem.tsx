import React, { useEffect, useState } from "react";
import {
  getAllScoreTypes,
  addScoreType,
  deleteScoreType,
} from "../../services/scoreTypeService";
import { ScoreType } from "../../types/ScoreType";
import { getAuth } from "firebase/auth";

export default function DanhMucLoaiDiem() {
  const [scoreTypes, setScoreTypes] = useState<ScoreType[]>([]);
  const [newScoreType, setNewScoreType] = useState<Omit<ScoreType, "id">>({
    name: "",
    weight: 1,
    description: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchScoreTypes = async () => {
    setLoading(true);
    try {
      const data = await getAllScoreTypes();
      setScoreTypes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScoreTypes();

    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user?.email === "nguyenlamvananh66@gmail.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAdd = async () => {
    if (!isAdmin) {
      alert("Bạn không có quyền thêm loại điểm.");
      return;
    }
    if (!newScoreType.name.trim()) {
      alert("Tên loại điểm không được để trống.");
      return;
    }
    try {
      const scoreTypeToAdd: ScoreType & { point?: number } = {
        ...newScoreType,
      };
      await addScoreType(scoreTypeToAdd);
      setNewScoreType({ name: "", weight: 1, description: "" });
      setShowForm(false);
      fetchScoreTypes();
    } catch (error) {
      alert("Lỗi khi thêm loại điểm.");
      console.error(error);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!isAdmin) {
      alert("Bạn không có quyền xóa loại điểm.");
      return;
    }
    if (!id) return;
    if (!window.confirm("Bạn có chắc muốn xóa loại điểm này?")) return;
    try {
      await deleteScoreType(id);
      fetchScoreTypes();
    } catch (error) {
      alert("Lỗi khi xóa loại điểm.");
      console.error(error);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2
          className="fw-extrabold text-success"
          style={{
            fontSize: "2.6rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            userSelect: "none",
          }}
        >
          📊 Danh Mục Loại Điểm
        </h2>

        {isAdmin && (
          <button
            className="btn btn-lg btn-success"
            style={{
              background: "linear-gradient(45deg, #28a745 0%, #71d28a 100%)",
              fontWeight: "600",
              boxShadow: "0 4px 15px rgba(40, 167, 69, 0.4)",
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
                <i className="bi bi-plus-circle me-2"></i> Thêm loại điểm
              </>
            )}
          </button>
        )}
      </div>

      {isAdmin && showForm && (
        <div
          id="scoretype-form"
          className="card shadow-lg border-0 p-4 mb-5"
          style={{
            maxWidth: 600,
            backgroundColor: "#e8f5e9",
            borderRadius: 16,
          }}
        >
          <div className="mb-3">
            <label className="form-label fw-semibold">Tên loại điểm *</label>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Nhập tên loại điểm"
              value={newScoreType.name}
              onChange={(e) =>
                setNewScoreType({ ...newScoreType, name: e.target.value })
              }
              autoFocus
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Hệ số</label>
            <input
              type="number"
              min={0}
              step={0.1}
              className="form-control form-control-lg"
              value={newScoreType.weight}
              onChange={(e) =>
                setNewScoreType({
                  ...newScoreType,
                  weight: parseFloat(e.target.value) || 1,
                })
              }
            />
          </div>
          <div className="mb-4">
            <label className="form-label fw-semibold">Diễn giải</label>
            <textarea
              rows={3}
              className="form-control"
              placeholder="Mô tả ngắn gọn loại điểm"
              value={newScoreType.description}
              onChange={(e) =>
                setNewScoreType({ ...newScoreType, description: e.target.value })
              }
            />
          </div>
          <button
            className="btn btn-success btn-lg w-100"
            onClick={handleAdd}
            style={{ fontWeight: "700", borderRadius: 12 }}
          >
            <i className="bi bi-save2 me-2"></i> Lưu loại điểm
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status" />
          <p className="mt-3 text-success">Đang tải danh sách loại điểm...</p>
        </div>
      ) : scoreTypes.length === 0 ? (
        <p className="text-center text-muted fst-italic">
          Chưa có loại điểm nào. Hãy thêm mới nhé!
        </p>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {scoreTypes.map((scoreType) => (
            <div
              key={scoreType.id}
              className="col"
              title={scoreType.description || "Không có mô tả"}
            >
              <div
                className="card h-100 shadow"
                style={{
                  borderRadius: 18,
                  backgroundColor: "#f0fdf4",
                }}
              >
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="card-title text-success fw-bold">
                      {scoreType.name}
                    </h5>

                    {isAdmin && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(scoreType.id)}
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    )}
                  </div>

                  <p className="mb-1">
                    <b>Hệ số:</b> {scoreType.weight}
                  </p>
                  <p className="flex-grow-1 text-secondary">
                    {scoreType.description || <i>Chưa có mô tả.</i>}
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
