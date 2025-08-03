import React, { useEffect, useState } from "react";
import SVG from "react-inlinesvg";
import { getLearningDashboardsByUser, addLearningDashboard } from "../../../services/learningDashboardService";
import { getLearningResultsByUser } from "../../../services/learningResultService";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { vireyaDashboardService } from "../../../services/vireyaDashboardService";
import { LearningDashboard } from "../../../types/LearningDashboard";

const LearningDashboardPage = () => {
  const userId = "user_fake_id_123456"; // tạm hardcode để test
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
      const dashboardData = await vireyaDashboardService(results);

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
    } catch (err: any) {
      if (err.status === 429) {
        toast.error("Bạn đã vượt quá hạn mức sử dụng OpenAI. Vui lòng thử lại sau hoặc nâng cấp tài khoản.");
      } else {
        toast.error("Đã xảy ra lỗi khi gọi GPT.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboards();
  }, [userId]);

  const latestDashboard = dashboards[0];

  return (
    <div className="row g-0 g-xl-5 g-xxl-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Bên trái: Timeline */}
      <div className="col-xl-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">🧭 Định hướng học tập</h2>
          <button onClick={handleCreateDashboard} disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo mới"}
          </button>
        </div>
        <div className="card">
          <div className="card-header align-items-center border-0 mt-5">
            <h3 className="card-title align-items-start flex-column">
              <span className="fw-bolder text-dark fs-3">Timeline</span>
              <span className="text-muted mt-2 fw-bold fs-6">
                Updates & notifications
              </span>
            </h3>
            <div className="card-toolbar">
              <button
                type="button"
                className="btn btn-sm btn-icon btn-color-primary btn-active-light-primary"                
              >
                <span className="svg-icon svg-icon-1">
                  <SVG src="/media/icons/duotone/Layout/Layout-4-blocks-2.svg" className="svg-icon-1" />
                </span>
                
              </button>              
            </div>
          </div>
          <div className="card-body pt-3">
            <div className="timeline-label">
              {dashboards.map((dashboard) => (
                <div className="timeline-item">
                  <div className="timeline-label fw-bolder text-gray-800 fs-6">
                    {dashboard.createdAt?.toDate ? 
                    new Date(dashboard.createdAt.toDate()).toLocaleDateString("vi-VN", {  day: "2-digit",  month: "2-digit",}) : "N/A"}                  
                  </div>
          
                  <div className="timeline-badge">
                    <i className="fa fa-genderless text-success fs-1"></i>
                  </div>
          
                  <div className="timeline-content d-flex">
                    <span className="fw-bolder text-gray-800 ps-3">
                      {dashboard.title}
                    </span>
                  </div>
                </div>                
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bên phải: Hiển thị dashboard mới nhất */}
      <div className="col-xl-8">
        {latestDashboard ? (
          <>
            <h2 className="text-lg font-semibold mb-2">📊 Phân tích gần nhất</h2>
            <div className="space-y-2">
              <p><strong>Tổng quan:</strong> {latestDashboard.summary}</p>

              {latestDashboard.importantSubjects ? (
                <div className="bg-blue-50 p-2 rounded-lg">
                  <h4 className="font-semibold mb-1">🎯 Gợi ý học tập chung</h4>
                  <p><strong>Điểm mạnh:</strong> {latestDashboard.importantSubjects.overallStrengths ?? "Chưa có dữ liệu"}</p>
                  <p><strong>Điểm yếu:</strong> {latestDashboard.importantSubjects.overallWeaknesses ?? "Chưa có dữ liệu"}</p>
                  <p><strong>Chiến lược:</strong> {latestDashboard.importantSubjects.learningAdvice ?? "Chưa có dữ liệu"}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">Chưa có dữ liệu tổng quan để hiển thị.</p>
              )}

              <h4 className="font-semibold mt-4">📚 Phân tích theo từng môn</h4>
              {latestDashboard.subjectInsights?.length > 0 ? (
                latestDashboard.subjectInsights.map((item, idx) => (
                  <div key={idx} className="border p-3 rounded-md">
                    <p><strong>{item.subjectName}</strong></p>
                    <p><em>Xu hướng:</em> {item.trend}</p>
                    <p><em>Điểm mạnh:</em> {item.strength}</p>
                    <p><em>Điểm yếu:</em> {item.weakness}</p>
                    <p><em>Gợi ý:</em> {item.suggestion}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">Không có dữ liệu phân tích môn học.</p>
              )}
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
