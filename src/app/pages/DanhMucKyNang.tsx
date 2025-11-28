import React, { useEffect, useState } from "react";
import { Skill } from "../../types/Skill";
import { getAuth } from "firebase/auth";

// Lấy và thao tác kỹ năng theo user
import {
  getUserSkills,
  addUserSkill,
  deleteUserSkill,
} from "../../services/userSkillCertService";

// AUTO CODE GEN
const generateCode = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");

function SkillCard({ skill, onDelete }: any) {
  return (
    <div
      className="card h-100 shadow"
      style={{
        borderRadius: 18,
        border: `3px solid`,
        cursor: "default",
        transition: "transform 0.3s ease",
        backgroundColor: "#fff8f0",
      }}
      title={skill.description || "Không có mô tả"}
    >
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold" style={{ fontSize: "1.5rem" }}>
            <i className="bi bi-stars me-2"></i>
            {skill.name}
          </h5>

          <button
            className="btn btn-sm btn-outline-danger"
            title="Xóa kỹ năng"
            onClick={() => {
              if (window.confirm(`Bạn có chắc muốn xóa kỹ năng "${skill.name}"?`)) {
                onDelete(skill.id);
              }
            }}
            style={{ transition: "all 0.3s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#d6336c")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
          >
            <i className="bi bi-trash3"></i>
          </button>
        </div>

        <p className="flex-grow-1">{skill.description || <i>Chưa có mô tả.</i>}</p>
      </div>
    </div>
  );
}

export default function DanhMucKyNang() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState<Omit<Skill, "id">>({
    name: "",
    description: "",
  });

  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const userId = getAuth().currentUser?.uid || "";

  const fetchSkills = async () => {
    if (!userId) return;

    setLoading(true);
    const data = await getUserSkills(userId); // ⬅️ CHỈ LẤY KỸ NĂNG CỦA USER
    setSkills(data as Skill[]);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newSkill.name.trim()) {
      alert("Tên kỹ năng không được để trống.");
      return;
    }

    const code = generateCode(newSkill.name);

    // ➤ LƯU KỸ NĂNG VÀO USER
    await addUserSkill(userId, {
      code,
      name: newSkill.name,
      description: newSkill.description,
      level: 1,
      status: "existing",
    });

    setNewSkill({ name: "", description: "" });
    setShowForm(false);

    fetchSkills();
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Bạn chắc muốn xóa kỹ năng này?")) return;

    // ➤ XOÁ KỸ NĂNG RIÊNG CỦA USER
    await deleteUserSkill(userId, id);

    fetchSkills();
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2
          className="fw-extrabold text-warning text-uppercase"
          style={{ fontSize: "2.6rem" }}
        >
          🌟 Danh Mục Kỹ Năng
        </h2>

        <button className="btn btn-lg btn-warning" onClick={() => setShowForm(!showForm)}>
          {showForm ? (
            <>
              <i className="bi bi-x-circle me-2"></i> Đóng form
            </>
          ) : (
            <>
              <i className="bi bi-plus-circle me-2"></i> Thêm kỹ năng
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div
          className="card shadow-lg border-0 p-4 mb-5"
          style={{ maxWidth: 600 }}
        >
          <div className="mb-3">
            <label className="fw-semibold">Tên kỹ năng *</label>
            <input
              type="text"
              className="form-control form-control-lg"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label className="fw-semibold">Mô tả</label>
            <textarea
              className="form-control"
              rows={3}
              value={newSkill.description}
              onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
            />
          </div>

          <button className="btn btn-warning btn-lg w-100" onClick={handleAdd}>
            <i className="bi bi-save2 me-2"></i> Lưu kỹ năng
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" />
          <p className="mt-3 text-warning">Đang tải kỹ năng...</p>
        </div>
      ) : skills.length === 0 ? (
        <p className="text-center text-muted fst-italic">Chưa có kỹ năng nào!</p>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {skills.map((skill) => (
            <div key={skill.id} className="col">
              <SkillCard skill={skill} onDelete={handleDelete} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
