import React, { useEffect, useState } from "react";
import {
  getAllScoreTypes,
  addScoreType,
  deleteScoreType,
} from "../../services/scoreTypeService";
import { ScoreType } from "../../types/ScoreType";

function ScoreTypeCard({
  scoreType,
  onDelete,
}: {
  scoreType: ScoreType;
  onDelete: (id?: string) => void;
}) {
  // Đổi màu theo hệ số
  const getColor = (weight: number) => {
    if (weight >= 2) return "#d9534f"; // đỏ đậm
    if (weight >= 1) return "#f0ad4e"; // cam
    return "#5bc0de"; // xanh dương nhạt
  };

  return (
    <div
      className="scoretype-card p-3 rounded shadow-sm"
      style={{
        borderLeft: `6px solid ${getColor(scoreType.weight)}`,
        backgroundColor: "#fff",
        marginBottom: "1rem",
        cursor: "default",
      }}
      title={scoreType.description}
    >
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0" style={{ color: getColor(scoreType.weight) }}>
          {scoreType.name}
        </h5>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(scoreType.id)}
          title="Xóa loại điểm"
        >
          <i className="bi bi-trash3"></i>
        </button>
      </div>
      <p className="mb-1">
        <strong>Mã loại:</strong> {scoreType.code}
      </p>
      <p className="mb-0">
        <strong>Hệ số:</strong> {scoreType.weight}
      </p>
    </div>
  );
}

export default function DanhMucLoaiDiem() {
  const [scoreTypes, setScoreTypes] = useState<ScoreType[]>([]);
  const [newScoreType, setNewScoreType] = useState<ScoreType>({
    code: "",
    name: "",
    weight: 1,
    description: "",
  });
  const [showForm, setShowForm] = useState(false);

  const fetchScoreTypes = async () => {
    const data = await getAllScoreTypes();
    setScoreTypes(data);
  };

  const handleAdd = async () => {
    if (!newScoreType.code || !newScoreType.name) {
      alert("Mã loại và Tên loại điểm không được để trống!");
      return;
    }
    await addScoreType(newScoreType);
    setNewScoreType({ code: "", name: "", weight: 1, description: "" });
    setShowForm(false);
    fetchScoreTypes();
  };

  const handleDelete = async (id?: string) => {
    if (id && window.confirm("Bạn có chắc muốn xóa loại điểm này?")) {
      await deleteScoreType(id);
      fetchScoreTypes();
    }
  };

  useEffect(() => {
    fetchScoreTypes();
  }, []);

  return (
    <div className="container py-4">
      <h3 className="text-success text-uppercase fw-bold mb-4">
        Danh Mục Loại Điểm
      </h3>

      <button
        className="btn btn-success mb-4"
        onClick={() => setShowForm((v) => !v)}
      >
        {showForm ? "Đóng form thêm" : "Thêm loại điểm mới"}
      </button>

      {showForm && (
        <div
          className="card p-4 mb-5 shadow-sm"
          style={{ maxWidth: 500, backgroundColor: "#f9f9f9" }}
        >
          <div className="mb-3">
            <label className="form-label">Mã loại điểm</label>
            <input
              type="text"
              className="form-control"
              value={newScoreType.code}
              onChange={(e) =>
                setNewScoreType({ ...newScoreType, code: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Tên loại điểm</label>
            <input
              type="text"
              className="form-control"
              value={newScoreType.name}
              onChange={(e) =>
                setNewScoreType({ ...newScoreType, name: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Hệ số</label>
            <input
              type="number"
              className="form-control"
              min={0}
              step={0.1}
              value={newScoreType.weight}
              onChange={(e) =>
                setNewScoreType({
                  ...newScoreType,
                  weight: parseFloat(e.target.value),
                })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Diễn giải</label>
            <input
              type="text"
              className="form-control"
              value={newScoreType.description}
              onChange={(e) =>
                setNewScoreType({ ...newScoreType, description: e.target.value })
              }
            />
          </div>

          <button className="btn btn-primary" onClick={handleAdd}>
            Lưu loại điểm
          </button>
        </div>
      )}

      {/* Danh sách các loại điểm dạng card */}
      <div className="scoretype-list">
        {scoreTypes.length === 0 ? (
          <p>Chưa có loại điểm nào. Hãy thêm mới nhé!</p>
        ) : (
          scoreTypes.map((scoreType) => (
            <ScoreTypeCard
              key={scoreType.id}
              scoreType={scoreType}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
