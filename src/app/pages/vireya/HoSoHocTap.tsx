import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { getAllLearningResults } from "../../../services/learningResultService";
import { Subject } from "../../../types/Subject";
import { ScoreType } from "../../../types/ScoreType";
import { getAllSubjects } from "../../../services/subjectService";
import { getAllScoreTypes } from "../../../services/scoreTypeService";
import { LearningResult } from "../../../types/LearningResult";



export default function HoSoHocTapPage() {
  const [learningResults, setLearningResults] = useState<LearningResult[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [scoreTypes, setScoreTypes] = useState<ScoreType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [results, subs, types] = await Promise.all([
          getAllLearningResults(),
          getAllSubjects(),
          getAllScoreTypes(),
        ]);
        setLearningResults(results);
        setSubjects(subs);
        setScoreTypes(types);
      } catch (error) {
        toast.error("Lỗi khi tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSubjectName = (id: string) =>
    subjects.find((s) => s.id === id)?.name || "Không rõ";

  const getScoreTypeName = (id: string) =>
    scoreTypes.find((t) => t.id === id)?.name || "Không rõ";

  return (
    <motion.div
      className="container py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-teal-400 to-cyan-600 text-transparent bg-clip-text">
        📘 Hồ Sơ Học Tập
      </h2>

      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : learningResults.length === 0 ? (
        <p>Chưa có kết quả học tập nào.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-xl">
          <table className="table-auto w-full border-collapse bg-white rounded-lg overflow-hidden">
            <thead className="bg-cyan-100 text-cyan-900">
              <tr>
                <th className="p-3 text-left">Lớp</th>
                <th className="p-3 text-left">Môn học</th>
                <th className="p-3 text-left">Loại điểm</th>
                <th className="p-3 text-left">Điểm</th>
                <th className="p-3 text-left">Học kỳ</th>
                <th className="p-3 text-left">Ngày học</th>
                <th className="p-3 text-left">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {learningResults.map((result) => (
                <tr key={result.id} className="hover:bg-cyan-50">
                  <td className="p-3">{result.classLevel}</td>
                  <td className="p-3">{getSubjectName(result.subjectId)}</td>
                  <td className="p-3">{getScoreTypeName(result.scoreTypeId)}</td>
                  <td className="p-3 font-semibold text-blue-600">{result.score}</td>
                  <td className="p-3">Học kỳ {result.semester}</td>
                  <td className="p-3">{new Date(result.date).toLocaleDateString("vi-VN")}</td>
                  <td className="p-3 italic">{result.note || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ToastContainer />
    </motion.div>
  );
}
