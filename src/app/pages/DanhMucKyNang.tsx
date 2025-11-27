import React, { useEffect, useState } from "react";
import { getAllSkills, addSkill, deleteSkill } from "../../services/skillService";
import { addUserSkill } from "../../services/userSkillCertService";
import { Skill } from "../../types/Skill";
import { getAuth } from "firebase/auth";

// AUTO CODE GEN
const generateCode = (text: string) =>
  text.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");

function SkillCard({ skill, onDelete }: any) {
  return (
    <div className="card h-100 shadow" style={{ borderRadius: 18, border: "3px solid" }}>
      {/* UI giữ nguyên */}
      {/* ... */}
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
    setLoading(true);
    const data = await getAllSkills();
    setSkills(data);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newSkill.name.trim()) {
      alert("Tên kỹ năng không được để trống.");
      return;
    }

    const code = generateCode(newSkill.name);

    // 1️⃣ DANH MỤC
    await addSkill({
      code,
      name: newSkill.name,
      description: newSkill.description,
    });

    // 2️⃣ HỒ SƠ CÁ NHÂN
    await addUserSkill(userId, {
      name: newSkill.name,
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

    await deleteSkill(id);
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

        <button
          className="btn btn-lg btn-warning"
          onClick={() => setShowForm(!showForm)}
        >
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
        <div className="card shadow-lg border-0 p-4 mb-5" style={{ maxWidth: 600 }}>
          <div className="mb-3">
            <label className="fw-semibold">Tên kỹ năng *</label>
            <input
              type="text"
              className="form-control form-control-lg"
              value={newSkill.name}
              onChange={(e) =>
                setNewSkill({ ...newSkill, name: e.target.value })
              }
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label className="fw-semibold">Mô tả</label>
            <textarea
              className="form-control"
              rows={3}
              value={newSkill.description}
              onChange={(e) =>
                setNewSkill({ ...newSkill, description: e.target.value })
              }
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
        <p className="text-center text-muted fst-italic">
          Chưa có kỹ năng nào!
        </p>
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
