import React, { useEffect, useState } from "react";
import { getLearningDashboardsByUser, addLearningDashboard } from "../../../services/learningDashboardService";
import { getLearningResultsByUser } from "../../../services/learningResultService"; // bạn cần tạo
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { callGPTForDashboard } from "../../../services/gptVireyaDashboardService"; // bạn cần tạo
import { LearningDashboard } from "../../../types/LearningDashboard";

const LearningDashboardPage = () => {
  const userId = "fakeUserId"; // tạm hardcode để test
  const [dashboards, setDashboards] = useState<LearningDashboard[]>([]);
  const [loading, setLoading] = useState(false);

  const loadDashboards = async () => {
    if (!userId) return;
    const data = await getLearningDashboardsByUser(userId);
    setDashboards(data);
  };

  const handleCreateDashboard = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      toast.info("Đang lấy kết quả học tập...");

      // 1. Lấy điểm học tập
      const results = await getLearningResultsByUser(userId);

      // 2. Gửi GPT
      toast.info("Đang phân tích với AI...");
      const dashboardData = await callGPTForDashboard(results);

      // 3. Thêm userId & timestamp
      const dashboardWithMeta = {
        ...dashboardData,
        userId,
        createdAt: new Date(),
      };

      // 4. Lưu Firestore
      await addLearningDashboard(dashboardWithMeta as any);
      toast.success("Phân tích thành công!");

      // 5. Cập nhật UI
      await loadDashboards();
    } catch (err) {
      toast.error("Lỗi khi tạo Dashboard mới");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboards();
  }, [userId]);

  return (
    <div className="grid grid-cols-3 gap-4 p-4">      
    <ToastContainer position="top-right" autoClose={3000} />
      {/* Bên trái: Timeline */}
      <div className="col-span-1">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">🧭 Định hướng học tập</h2>
          <button onClick={handleCreateDashboard} disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo mới"}
          </button>
        </div>
        <div className="space-y-4">
          {dashboards.map((dashboard) => (
            <motion.div
              key={dashboard.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="p-3 bg-white shadow rounded-xl border-l-4 border-blue-500"
            >
              <p className="text-sm text-gray-500">{new Date(dashboard.createdAt.toDate()).toLocaleString()}</p>
              <p className="text-md font-semibold line-clamp-2">{dashboard.summary}</p>
            </motion.div>
          ))}
        </div>
      </div>      
      {/* Bên phải: Hiển thị dashboard mới nhất */}
      <div className="col-span-2 bg-white rounded-xl shadow p-4">
        {dashboards.length > 0 ? (
          <>
            <h2 className="text-lg font-semibold mb-2">📊 Phân tích gần nhất</h2>
            <div className="space-y-2">
              <p><strong>Tổng quan:</strong> {dashboards[0].summary}</p>

              <div className="bg-blue-50 p-2 rounded-lg">
                <h4 className="font-semibold mb-1">🎯 Gợi ý học tập chung</h4>
                <p><strong>Điểm mạnh:</strong> {dashboards[0].importantSubjects.overallStrengths}</p>
                <p><strong>Điểm yếu:</strong> {dashboards[0].importantSubjects.overallWeaknesses}</p>
                <p><strong>Chiến lược:</strong> {dashboards[0].importantSubjects.learningAdvice}</p>
              </div>

              <h4 className="font-semibold mt-4">📚 Phân tích theo từng môn</h4>
              {dashboards[0].subjectInsights.map((item, idx) => (
                <div key={idx} className="border p-3 rounded-md">
                  <p><strong>{item.subjectName}</strong></p>
                  <p><em>Xu hướng:</em> {item.trend}</p>
                  <p><em>Điểm mạnh:</em> {item.strength}</p>
                  <p><em>Điểm yếu:</em> {item.weakness}</p>
                  <p><em>Gợi ý:</em> {item.suggestion}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Chưa có phân tích nào.</p>
        )}
      </div>
    </div>
  );
};

export default LearningDashboardPage;
