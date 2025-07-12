import React, { useEffect, useState } from "react";
import {
  getAllSkills,
  addSkill,
  deleteSkill,
} from "../../services/skillService";
import { Skill } from "../../types/Skill";

const levelColors = {
  "Cơ bản": "#0d6efd",     // blue
  "Trung bình": "#ffc107", // yellow
  "Nâng cao": "#dc3545",   // red
} as const;

function SkillCard({
  skill,
  onDelete,
}: {
  skill: Skill;
  onDelete: (id?: string) => void;
}) {
  return (
    <div
      className="card h-100 shadow"
      style={{
        borderRadius: 18,
        border: `3px solid ${levelColors[skill.level]}`,
        cursor: "default",
        transition: "transform 0.3s ease",
        backgroundColor: "#fff8f0",
      }}
      title={skill.description || "Không có mô tả"}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px 4px ${levelColors[skill.level]}80`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "none";
        (e.currentTarget as HTMLElement).style.boxShadow = "none";
      }}
    >
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5
            className="fw-bold"
            style={{ color: levelColors[skill.level], fontSize: "1.5rem" }}
          >
            <i className="bi bi-stars me-2"></i>
            {skill.name}
          </h5>
          <button
            className="btn btn-sm btn-outline-danger"
            title="Xóa kỹ năng"
            onClick={() => {
              if (
                window.confirm(
                  `Bạn có chắc muốn xóa kỹ năng "${skill.name}"?`
                )
              ) {
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
        {/* Bỏ hiển thị mã kỹ năng */}
        {/* <p className="text-muted small mb-1" style={{ userSelect: "none" }}>
          Mã: <span className="fw-semibold">{skill.code}</span>
        </p> */}
        <p className="flex-grow-1">{skill.description || <i>Chưa có mô tả.</i>}</p>
        <span
          className="badge"
          style={{
            backgroundColor: levelColors[skill.level],
            color: "white",
            fontWeight: "600",
            fontSize: "0.9rem",
            alignSelf: "start",
            borderRadius: "9999px",
            padding: "0.25em 0.8em",
            userSelect: "none",
          }}
        >
          {skill.level}
        </span>
      </div>
    </div>
  );
}

export default function DanhMucKyNang() {
  const [skills, setSkills] = useState<Skill[]>([]);
  // Bỏ code khỏi state newSkill
  const [newSkill, setNewSkill] = useState<Omit<Skill, "code" | "id">>({
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
    if (!newSkill.name.trim()) {
      alert("Tên kỹ năng không được để trống.");
      return;
    }
    try {
      // Nếu backend yêu cầu code thì bạn có thể tự tạo mã từ tên ở đây
      // Ví dụ:
      // const code = newSkill.name.trim().toLowerCase().replace(/\s+/g, "_");
      // await addSkill({ ...newSkill, code });

      await addSkill(newSkill as Skill);
      setNewSkill({ name: "", level: "Cơ bản", description: "" });
      setShowForm(false);
      fetchSkills();
    } catch (error) {
      alert("Lỗi khi thêm kỹ năng.");
      console.error(error);
    }
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    if (!window.confirm("Bạn có chắc muốn xóa kỹ năng này?")) return;
    try {
      await deleteSkill(id);
      fetchSkills();
    } catch (error) {
      alert("Lỗi khi xóa kỹ năng.");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2
          className="fw-extrabold text-warning text-uppercase"
          style={{ fontSize: "2.6rem", userSelect: "none" }}
        >
          🌟 Danh Mục Kỹ Năng
        </h2>
        <button
          className="btn btn-lg btn-warning"
          style={{
            background:
              "linear-gradient(45deg, #ffc107 0%, #ffca28 100%)",
            fontWeight: "600",
            boxShadow: "0 4px 15px rgba(255, 193, 7, 0.4)",
            border: "none",
          }}
          onClick={() => setShowForm((v) => !v)}
          aria-expanded={showForm}
          aria-controls="skill-form"
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
        <div
          id="skill-form"
          className="card shadow-lg border-0 p-4 mb-5"
          style={{ maxWidth: 600, borderRadius: 16, backgroundColor: "#fff8e1" }}
        >
          {/* Bỏ nhập mã kỹ năng */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Tên kỹ năng *</label>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Nhập tên kỹ năng"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Trình độ</label>
            <select
              className="form-select form-select-lg"
              value={newSkill.level}
              onChange={(e) =>
                setNewSkill({ ...newSkill, level: e.target.value as Skill["level"] })
              }
            >
              <option value="Cơ bản">Cơ bản</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Nâng cao">Nâng cao</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Diễn giải</label>
            <textarea
              rows={3}
              className="form-control"
              placeholder="Mô tả ngắn gọn về kỹ năng"
              value={newSkill.description}
              onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
            />
          </div>

          <button
            className="btn btn-warning btn-lg w-100"
            onClick={handleAdd}
            style={{ fontWeight: "700", borderRadius: 12 }}
          >
            <i className="bi bi-save2 me-2"></i> Lưu kỹ năng
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status" />
          <p className="mt-3 text-warning">Đang tải danh sách kỹ năng...</p>
        </div>
      ) : skills.length === 0 ? (
        <p className="text-center text-muted fst-italic">
          Chưa có kỹ năng nào. Hãy thêm mới nhé!
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
