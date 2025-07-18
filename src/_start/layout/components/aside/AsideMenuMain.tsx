import React from "react";
import { AsideMenuItem } from "./AsideMenuItem";

export function AsideMenuMain() {
  return (
    <>
      {/* BẢNG TỔNG HỢP */}
      <div className="menu-item">
        <h4 className="menu-content text-muted mb-0 fs-6 fw-bold text-uppercase">
          <i className="fas fa-chart-pie me-2 text-gray-600" />
          Bảng tổng hợp
        </h4>
      </div>
      <AsideMenuItem to="/dashboard" title="Tóm tắt" icon="fas fa-tachometer-alt text-dark px-2" />
      <AsideMenuItem to="/light" title="Chi tiết" icon="fas fa-stream text-secondary px-2" />

      {/* VIREYA */}
      <div className="menu-item mt-10">
        <h4 className="menu-content text-primary mb-0 fs-6 fw-bold text-uppercase">
          <i className="fas fa-robot me-2 text-primary" />
          VIREYA (AI Mentor)
        </h4>
      </div>
      <AsideMenuItem to="/vireya/ket-qua-hoc-tap" title="Kết quả học tập" icon="fas fa-pen-alt text-primary px-2" />
      <AsideMenuItem to="/shop/shop-1" title="Hồ sơ học tập" icon="fas fa-user-graduate text-primary px-2" />
      <AsideMenuItem to="/shop/shop-2" title="Đánh giá trình độ" icon="fas fa-tasks text-primary px-2" />
      <AsideMenuItem to="/shop/shop-2" title="Định hướng kế hoạch học tập" icon="fas fa-map-signs text-primary px-2" />

      {/* NEOVANA */}
      <div className="menu-item mt-10">
        <h4 className="menu-content text-success mb-0 fs-6 fw-bold text-uppercase">
          <i className="fas fa-map me-2 text-success" />
          NEOVANA (Bản đồ học lực & ước mơ)
        </h4>
      </div>
      <AsideMenuItem to="/general/faq" title="Cập nhật hồ sơ cá nhân" icon="fas fa-user-edit text-success px-2" />
      <AsideMenuItem to="/general/pricing" title="Chi tiết hồ sơ" icon="fas fa-id-card text-success px-2" />
      <AsideMenuItem to="/general/invoice" title="Phân tích năng lực" icon="fas fa-chart-line text-success px-2" />
      <AsideMenuItem to="/general/wizard" title="Định hướng phát triển" icon="fas fa-compass text-success px-2" />

      {/* AYURA */}
      <div className="menu-item mt-10">
        <h4 className="menu-content text-warning mb-0 fs-6 fw-bold text-uppercase">
          <i className="fas fa-seedling me-2 text-warning" />
          AYURA (Vườn chữa lành)
        </h4>
      </div>
      <AsideMenuItem to="/profile/overview" title="Nhật ký chữa lành" icon="fas fa-book-open text-warning px-2" />
      <AsideMenuItem to="/profile/account" title="Nguyên liệu chăm cây" icon="fas fa-leaf text-warning px-2" />
      <AsideMenuItem to="/profile/settings" title="Tạo nguyên liệu" icon="fas fa-flask text-warning px-2" />
      <AsideMenuItem to="/profile/settings" title="Cây chữa lành" icon="fas fa-tree text-warning px-2" />

      {/* ZENORA */}
      <div className="menu-item mt-10">
        <h4 className="menu-content text-danger mb-0 fs-6 fw-bold text-uppercase">
          <i className="fas fa-heartbeat me-2 text-danger" />
          ZENORA (Trợ lý cảm xúc AI)
        </h4>
      </div>
      <AsideMenuItem to="/docs" title="Stress Market" icon="fas fa-burn text-danger px-2" />
      <AsideMenuItem to="/builder" title="Cloud Whisper" icon="fas fa-cloud text-danger px-2" />
      <AsideMenuItem to="/docs/change-log" title="Relaxation" icon="fas fa-spa text-danger px-2" />
      <AsideMenuItem to="/docs/change-log" title="Void Zone" icon="fas fa-moon text-danger px-2" />

      {/* DANH MỤC */}
      <div className="menu-item mt-10">
        <h4 className="menu-content text-muted mb-0 fs-6 fw-bold text-uppercase">
          <i className="fas fa-folder-open me-2 text-muted" />
          Danh mục
        </h4>
      </div>
      <AsideMenuItem
        to="/danh-muc/loai-diem"
        title="Loại điểm"
        classNameMenuTitle="menu-title text-dark"
        icon="fas fa-list-alt text-dark px-2"
      />
      <AsideMenuItem
        to="/danh-muc/mon-hoc"
        title="Môn học"
        classNameMenuTitle="menu-title text-primary"
        icon="fas fa-book text-primary px-2"
      />
      <AsideMenuItem
        to="/danh-muc/ky-nang"
        title="Kỹ năng"
        classNameMenuTitle="menu-title text-warning"
        icon="fas fa-tools text-warning px-2"
      />
      <AsideMenuItem
        to="/danh-muc/chung-chi"
        title="Chứng chỉ"
        classNameMenuTitle="menu-title text-success"
        icon="fas fa-certificate text-success px-2"
      />
      <AsideMenuItem
        to="/danh-muc/khao-sat"
        title="Khảo sát"
        classNameMenuTitle="menu-title text-info"
        icon="fas fa-poll text-info px-2"
      />
    </>
  );
}
