// src/pages/SubjectsPage.tsx
import React, { useEffect, useState } from "react";
import {
  getAllSubjects,
  addSubject,
  deleteSubject,
} from "../../services/subjectService";
import { Subject } from "../../types/Subject";

export default function DanhMucLoaiDiem() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState<Subject>({
    code: "",
    name: "",
    description: "",
  });

  const fetchSubjects = async () => {
    const data = await getAllSubjects();
    setSubjects(data);
  };

  const handleAdd = async () => {
    await addSubject(newSubject);
    setNewSubject({ code: "", name: "", description: "" });
    fetchSubjects();
  };

  const handleDelete = async (id?: string) => {
    if (id) {
      await deleteSubject(id);
      fetchSubjects();
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return (
    <div className="card card-custom p-5 shadow-sm bg-light">
      <div className="card-header d-flex justify-content-between align-items-center bg-white border-bottom py-3 px-4">
        <h3 className="card-title fw-bold text-primary text-uppercase mb-0">
          Danh Mục Môn Học
        </h3>
        <button
          type="button"
          className="btn btn-primary d-flex align-items-center gap-2"
          data-bs-toggle="modal"
          data-bs-target="#modal_them_moi"
        >
          <i className="bi bi-plus-circle fs-5"></i> Thêm
        </button>
      </div>

      <div className="card-body">
        <div className="table-responsive mt-4">
          <table className="table table-bordered table-hover align-middle">
            <thead className="bg-primary text-white text-center">
              <tr className="fw-semibold text-uppercase">
                <th style={{ minWidth: "120px" }}>Xóa môn học</th>
                <th style={{ minWidth: "150px" }}>Mã môn</th>
                <th style={{ minWidth: "250px" }}>Tên môn học</th>
                <th style={{ minWidth: "300px" }}>Diễn giải</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id}>
                  <td className="text-center">
                    <button
                      onClick={() => handleDelete(subject.id)}
                      className="btn btn-sm btn-danger"
                      title="Xóa môn học"
                    >
                      <i className="bi bi-trash3"></i>
                    </button>
                  </td>
                  <td>{subject.code}</td>
                  <td className="text-capitalize">{subject.name}</td>
                  <td>{subject.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm Mới */}
      <div className="modal fade" tabIndex={-1} id="modal_them_moi">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title fw-bold">Thêm Môn Học</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body px-4 pt-4">
              <div className="mb-3">
                <label className="form-label fw-semibold">Mã môn học</label>
                <input
                  type="text"
                  className="form-control"
                  value={newSubject.code}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, code: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Tên môn học</label>
                <input
                  type="text"
                  className="form-control"
                  value={newSubject.name}
                  onChange={(e) =>
                    setNewSubject({ ...newSubject, name: e.target.value })
                  }
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Diễn giải</label>
                <input
                  type="text"
                  className="form-control"
                  value={newSubject.description}
                  onChange={(e) =>
                    setNewSubject({
                      ...newSubject,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-light"
                data-bs-dismiss="modal"
              >
                Hủy
              </button>
              <button
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={handleAdd}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
