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
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Danh mục Môn học</h2>
      <input
        placeholder="Mã môn (code)"
        value={newSubject.code}
        onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value })}
        className="border p-2 mr-2"
      />
      <input
        placeholder="Tên môn (name)"
        value={newSubject.name}
        onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
        className="border p-2 mr-2"
      />
      <input
        placeholder="Mô tả (description)"
        value={newSubject.description}
        onChange={(e) =>
          setNewSubject({ ...newSubject, description: e.target.value })
        }
        className="border p-2 mr-2"
      />
      <button onClick={handleAdd} className="bg-blue-500 text-white px-4 py-2">
        Thêm môn
      </button>

      <ul className="mt-4">
        {subjects.map((subject) => (
          <li key={subject.id} className="border p-2 my-2">
            <strong>{subject.code}</strong>: {subject.name} –{" "}
            <em>{subject.description}</em>
            <button
              onClick={() => handleDelete(subject.id)}
              className="ml-4 text-red-500"
            >
              Xoá
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
