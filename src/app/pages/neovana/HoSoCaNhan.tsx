import React, { useEffect, useState } from "react";
import { UserSkillForm } from "./UserSkillForm";
import { UserCertificateForm } from "./UserCertificateForm";
import { getUserSkills } from "../../../services/userSkillService";
import { getUserCertificates } from "../../../services/userCertificateService";
import { UserSkill } from "../../../types/UserSkill";
import { UserCertificate } from "../../../types/UserCertificate";
import { motion } from "framer-motion";

const userId = "demo_user_001"; // lấy từ auth nếu có

export default function ProfilePage() {
  const [showSkillForm, setShowSkillForm] = useState(false);
  const [showCertForm, setShowCertForm] = useState(false);
  const [skills, setSkills] = useState<UserSkill[]>([]);
  const [certificates, setCertificates] = useState<UserCertificate[]>([]);

  const loadData = async () => {
    const [s, c] = await Promise.all([
      getUserSkills(userId),
      getUserCertificates(userId),
    ]);
    setSkills(s);
    setCertificates(c);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="container mx-auto p-6 text-gray-800">
      <h1 className="text-3xl font-bold mb-6 text-indigo-600">📘 Hồ sơ cá nhân</h1>

      <div className="flex gap-4 mb-6">
  <button
    className="px-4 py-2 bg-indigo-300 text-black rounded hover:bg-indigo-400 transition"
    onClick={() => setShowSkillForm(!showSkillForm)}
  >
    {showSkillForm ? "Đóng Kỹ năng" : "➕ Thêm Kỹ năng"}
  </button>
  <button
    className="px-4 py-2 bg-emerald-300 text-black rounded hover:bg-emerald-400 transition"
    onClick={() => setShowCertForm(!showCertForm)}
  >
    {showCertForm ? "Đóng Chứng chỉ" : "➕ Thêm Chứng chỉ"}
  </button>
</div>


      {showSkillForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <UserSkillForm userId={userId} onSaved={loadData} />
        </motion.div>
      )}
      {showCertForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <UserCertificateForm userId={userId} onSaved={loadData} />
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-indigo-500">🧠 Kỹ năng</h2>
          <table className="w-full table-auto border-collapse bg-white shadow rounded overflow-hidden">
            <thead>
              <tr className="bg-indigo-50 text-indigo-700 text-left">
                <th className="p-3">Tên kỹ năng</th>
                <th className="p-3">Cấp độ</th>
                <th className="p-3">Ngày</th>
                <th className="p-3">Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((s) => (
                <tr key={s.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="p-3 font-medium">{s.skillId}</td>
                  <td className="p-3">{s.level}</td>
                  <td className="p-3">{s.date}</td>
                  <td className="p-3 text-gray-600">{s.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-emerald-500">📜 Chứng chỉ</h2>
          <table className="w-full table-auto border-collapse bg-white shadow rounded overflow-hidden">
            <thead>
              <tr className="bg-emerald-50 text-emerald-700 text-left">
                <th className="p-3">Tên chứng chỉ</th>
                <th className="p-3">Kết quả</th>
                <th className="p-3">Ngày cấp</th>
                <th className="p-3">Nơi cấp</th>
                <th className="p-3">Mô tả</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((c) => (
                <tr key={c.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="p-3 font-medium">{c.certificateId}</td>
                  <td className="p-3">{c.result}</td>
                  <td className="p-3">{c.date}</td>
                  <td className="p-3">{c.issuer}</td>
                  <td className="p-3 text-gray-600">{c.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
