import React, { useState } from "react";
import { AsideMenuItem } from "./AsideMenuItem";
import { toAbsoluteUrl } from "../../../../_start/helpers";

export function AsideMenuMain() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`aside-menu d-flex flex-column ${
        collapsed ? "aside-collapsed" : ""
      }`}
      style={{
        width: collapsed ? "85px" : "260px",
        transition: "width 0.3s ease",
        background: "#0f172a",
        minHeight: "100vh",
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      {/* --- Header + Nút toggle --- */}
      <div
        className="d-flex align-items-center justify-content-between px-4 mt-4 mb-5"
        style={{ transition: "all 0.3s ease" }}
      >
        {/* Logo: dùng các logo trong thư mục /media/svg/logo/... */}
        <img
          src={
            collapsed
              ? toAbsoluteUrl("/media/svg/logo/gray/aven.svg")
              : toAbsoluteUrl("/media/svg/logo/colored/aven.svg")
          }
          alt="Lumora Logo"
          style={{
            height: collapsed ? "34px" : "38px",
            objectFit: "contain",
            transition: "all 0.3s ease",
          }}
        />

        <button
          className="btn btn-icon btn-sm btn-light"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
        >
          <i
            className={`fas ${
              collapsed ? "fa-angle-double-right" : "fa-angle-double-left"
            }`}
          ></i>
        </button>
      </div>

      {/* --- Nội dung Menu --- */}
      <div className="menu-wrapper px-3">
        {/* BẢNG TỔNG HỢP */}
        {!collapsed && (
          <div className="menu-item">
            <h4 className="menu-content text-muted mb-0 fs-6 fw-bold text-uppercase">
              <i className="fas fa-chart-pie me-2 text-gray-600" />
              Bảng tổng hợp
            </h4>
          </div>
        )}
        <AsideMenuItem
          to="/dashboard"
          title={collapsed ? "" : "Tóm tắt"}
          icon="fas fa-tachometer-alt text-dark px-2"
        />
        <AsideMenuItem
          to="/light"
          title={collapsed ? "" : "Chi tiết"}
          icon="fas fa-stream text-secondary px-2"
        />

        {/* VIREYA */}
        {!collapsed && (
          <div className="menu-item mt-10">
            <h4 className="menu-content text-primary mb-0 fs-6 fw-bold text-uppercase">
              <i className="fas fa-robot me-2 text-primary" />
              VIREYA (AI Mentor)
            </h4>
          </div>
        )}
        <AsideMenuItem
          to="/vireya/ket-qua-hoc-tap"
          title={collapsed ? "" : "Kết quả học tập"}
          icon="fas fa-pen-alt text-primary px-2"
        />
        <AsideMenuItem
          to="/vireya/ho-so-hoc-tap"
          title={collapsed ? "" : "Hồ sơ học tập"}
          icon="fas fa-user-graduate text-primary px-2"
        />
        <AsideMenuItem
          to="/vireya/phan-tich-ho-so-hoc-tap"
          title={collapsed ? "" : "Phân tích hồ sơ học tập"}
          icon="fas fa-chart-bar text-primary px-2"
        />
        <AsideMenuItem
          to="/vireya/danh-gia-trinh-do"
          title={collapsed ? "" : "Đánh giá & Định hướng học tập"}
          icon="fas fa-tasks text-primary px-2"
        />

        {/* NEOVANA */}
        {!collapsed && (
          <div className="menu-item mt-10">
            <h4 className="menu-content text-success mb-0 fs-6 fw-bold text-uppercase">
              <i className="fas fa-map me-2 text-success" />
              NEOVANA (Bản đồ học lực & ước mơ)
            </h4>
          </div>
        )}
        <AsideMenuItem
          to="/neovana/ho-so-ca-nhan"
          title={collapsed ? "" : "Hồ sơ cá nhân"}
          icon="fas fa-id-card text-success px-2"
        />
        <AsideMenuItem
          to="/neovana/phan-tich-nang-luc"
          title={collapsed ? "" : "Phân tích năng lực"}
          icon="fas fa-chart-line text-success px-2"
        />
        <AsideMenuItem
          to="/neovana/dinh-huong-phat-trien"
          title={collapsed ? "" : "Định hướng phát triển"}
          icon="fas fa-compass text-success px-2"
        />

        {/* AYURA */}
        {!collapsed && (
          <div className="menu-item mt-10">
            <h4 className="menu-content text-warning mb-0 fs-6 fw-bold text-uppercase">
              <i className="fas fa-seedling me-2 text-warning" />
              AYURA (Vườn chữa lành)
            </h4>
          </div>
        )}
        <AsideMenuItem
          to="/ayura/vuon-chua-lanh"
          title={collapsed ? "" : "Vườn chữa lành"}
          icon="fas fa-book-open text-warning px-2"
        />

        {/* ZENORA */}
        {!collapsed && (
          <div className="menu-item mt-10">
            <h4 className="menu-content text-danger mb-0 fs-6 fw-bold text-uppercase">
              <i className="fas fa-heartbeat me-2 text-danger" />
              ZENORA (Trợ lý cảm xúc AI)
            </h4>
          </div>
        )}
        <AsideMenuItem
          to="/zenora/stress-market"
          title={collapsed ? "" : "Stress Market"}
          icon="fas fa-burn text-danger px-2"
        />
        <AsideMenuItem
          to="/zenora/cloud-whisper"
          title={collapsed ? "" : "Cloud Whisper"}
          icon="fas fa-cloud text-danger px-2"
        />
        <AsideMenuItem
          to="/zenora/relaxation"
          title={collapsed ? "" : "Relaxation"}
          icon="fas fa-spa text-danger px-2"
        />
        <AsideMenuItem
          to="/zenora/void-zone"
          title={collapsed ? "" : "Void Zone"}
          icon="fas fa-moon text-danger px-2"
        />
      </div>
    </div>
  );
}
