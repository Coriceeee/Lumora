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
    <div className="card card-custom p-1">
      <div className="card-header">
          <h3 className="card-title">Danh Mục Môn Học</h3>
          <div className="card-toolbar">
              <button type="button" className="btn btn-bg-primary text-white"
                data-bs-toggle="modal"
                data-bs-target="#modal_them_moi"
              >
                  Thêm
              </button>
          </div>
      </div>
      <div className="card-body">
        <div className="table-responsive ">      
          <table className="table table-rounded table-striped border gy-7 gs-7">
            <thead>
              <tr className="fw-bold fs-6 text-gray-800 border-bottom border-gray-200">
                  <th className="min-w-200px">Action</th>
                    <th className="min-w-200px">Code</th>
                    <th className="min-w-400px">Name</th>
                    <th className="min-w-100px">Description</th>                            
                </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id} >
                    <td>
                      <button onClick={() => handleDelete(subject.id)} className="btn btn-bg-danger">
                        <i className="bi bi-gear text-white"></i>
                      </button>
                    </td>
                    <td>{subject.code}</td>
                    <td>{subject.name} </td>
                    <td>{subject.description}</td>              
                </tr>
              ))}         
            </tbody>
        </table>
      </div>
    </div>

  <div className="modal fade" tabIndex={-1} id="modal_them_moi">
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">Them Mon Hoc</h5>
          <div
            className="btn btn-icon btn-sm btn-active-light-primary ms-2"
            data-bs-dismiss="modal"
            aria-label="Close"
          >            
          </div>
        </div>
        <div className="modal-body">
          <div className="mb-10">
            <label className="form-label">Mã môn học</label>
            <input
              type="text"
              className="form-control"
              value={newSubject.code}
              onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
            />
          </div>  
          <div className="mb-10">
            <label className="form-label">Tên môn học</label>
            <input
              type="text"
              className="form-control"
              value={newSubject.name}
              onChange={(e) =>
                setNewSubject({ ...newSubject, name: e.target.value })
              }
            />
          </div>       
          
          <div className="mb-10">
            <label className="form-label">Diễn giải</label>
            <input
              type="text"
              className="form-control"
              value={newSubject.description}
              onChange={(e) =>
                setNewSubject({ ...newSubject, description: e.target.value })
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
            Close
          </button>
          <button type="button" className="btn btn-primary"   data-bs-dismiss="modal" onClick={handleAdd}>
            Save changes
          </button>
        </div>
      </div>
    </div>
  </div>

</div>    
  );
};
