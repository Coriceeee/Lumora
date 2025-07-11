import React, { useEffect, useState } from "react";
import {
  getAllSkills,
  addSkill,
  deleteSkill,
} from "../../services/skillService";
import { Skill } from "../../types/Skill";

function SkillCard({
  skill,
  onDelete,
}: {
  skill: Skill;
  onDelete: (id?: string) => void;
}) {
  // Màu sắc theo cấp độ skill
  const levelColors = {
    "Cơ bản": "primary",
    "Trung bình": "warning",
    "Nâng cao": "danger",
  } as const;

  return (
    <div
      className={`card h-100 border border-${levelColors[skill.level]} shadow-sm`}
      style={{ cursor: "default", transition: "transform 0.2s" }}
      title={skill.description}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1.03)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = "none";
      }}
    >
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className={`card-title text-${levelColors[skill.level]} mb-0`}>
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
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
        <p className="text-muted small mb-1">Mã: {skill.code}</p>
        <p className="flex-grow-1">{skill.description}</p>
        <span className={`badge bg-${levelColors[skill.level]} bg-opacity-75 rounded-pill align-self-start`}>
          {skill.level}
        </span>
      </div>
    </div>
  );
}

export default function SkillPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState<Skill>({
    code: "",
    name: "",
    level: "Cơ bản",
    description: "",
  });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const data = await getAllSkills();
      setSkills(data);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newSkill.code.trim() || !newSkill.name.trim()) {
      alert("Mã kỹ năng và Tên kỹ năng không được để trống.");
      return;
    }
    try {
      await addSkill(newSkill);
      setNewSkill({ code: "", name: "", level: "Cơ bản", description: "" });
      setShowForm(false);
      fetchSkills();
      alert("Thêm kỹ năng thành công!");
    } catch (error) {
      alert("Có lỗi xảy ra khi thêm kỹ năng.");
      console.error(error);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    try {
      await deleteSkill(id);
      fetchSkills();
      alert("Xóa kỹ năng thành công!");
    } catch (error) {
      alert("Có lỗi xảy ra khi xóa kỹ năng.");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-uppercase text-warning">
          🌟 Danh Mục Kỹ Năng
        </h2>
        <button
          className={`btn btn-warning`}
          onClick={() => setShowForm((v) => !v)}
          aria-expanded={showForm}
          aria-controls="skill-form"
        >
          <i className="bi bi-lightning-charge me-2"></i>
          {showForm ? "Đóng form thêm" : "Thêm kỹ năng"}
        </button>
      </div>

      {showForm && (
        <div
          id="skill-form"
          className="card p-4 mb-5 shadow-sm border-warning bg-light"
          style={{ maxWidth: 600 }}
        >
          <div className="mb-3">
            <label className="form-label">Mã kỹ năng</label>
            <input
              type="text"
              className="form-control"
              value={newSkill.code}
              onChange={(e) =>
                setNewSkill({ ...newSkill, code: e.target.value })
              }
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Tên kỹ năng</label>
            <input
              type="text"
              className="form-control"
              value={newSkill.name}
              onChange={(e) =>
                setNewSkill({ ...newSkill, name: e.target.value })
              }
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Cấp độ</label>
            <select
              className="form-select"
              value={newSkill.level}
              onChange={(e) =>
                setNewSkill({
                  ...newSkill,
                  level: e.target.value as Skill["level"],
                })
              }
            >
              <option>Cơ bản</option>
              <option>Trung bình</option>
              <option>Nâng cao</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Mô tả</label>
            <textarea
              className="form-control"
              rows={3}
              value={newSkill.description}
              onChange={(e) =>
                setNewSkill({ ...newSkill, description: e.target.value })
              }
            />
          </div>

          <button className="btn btn-warning" onClick={handleAdd}>
            Thêm kỹ năng
          </button>
        </div>
      )}

      {loading ? (
        <p>Đang tải danh sách kỹ năng...</p>
      ) : skills.length === 0 ? (
        <p>Chưa có kỹ năng nào. Hãy thêm mới nhé!</p>
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
