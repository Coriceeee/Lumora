import React from "react";
import { AsideMenuItem } from "./AsideMenuItem";
import { toAbsoluteUrl } from "../../../../_start/helpers";

export function AsideMenuMain() {
  return (
    <div
      className="aside-menu d-flex flex-column"
      style={{
        width: "260px",
        background: "#0f172a",
        minHeight: "100vh",
        overflowX: "hidden",
        overflowY: "auto",
      }}
    >
      {/* --- Header --- */}
      <div className="d-flex align-items-center px-4 mt-4 mb-6">
        <img
          src={toAbsoluteUrl("/media/svg/logo/colored/aven.svg")}
          alt="Lumora Logo"
          style={{
            height: "38px",
            objectFit: "contain",
          }}
        />
      </div>

      {/* --- Menu --- */}
      <div className="menu-wrapper px-3">
        {/* BẢNG TỔNG HỢP */}
        <div className="menu-item">
          <h4 className="menu-content text-muted mb-2 fs-6 fw-bold text-uppercase">
            <i className="fas fa-chart-pie me-2 text-gray-600" />
            Bảng tổng hợp
          </h4>
        </div>

        <AsideMenuItem
          to="/dashboard"
          title="Tóm tắt"
          icon="fas fa-tachometer-alt text-dark px-2"
        />
        <AsideMenuItem
          to="/light"
          title="Chi tiết"
          icon="fas fa-stream text-secondary px-2"
        />

        {/* VIREYA */}
        <div className="menu-item mt-10">
          <h4 className="menu-content text-primary mb-2 fs-6 fw-bold text-uppercase">
            <i className="fas fa-robot me-2 text-primary" />
            VIREYA (AI Mentor)
          </h4>
        </div>

        <AsideMenuItem
          to="/vireya/ket-qua-hoc-tap"
          title="Kết quả học tập"
          icon="fas fa-pen-alt text-primary px-2"
        />
        <AsideMenuItem
          to="/vireya/ho-so-hoc-tap"
          title="Hồ sơ học tập"
          icon="fas fa-user-graduate text-primary px-2"
        />
        <AsideMenuItem
          to="/vireya/phan-tich-ho-so-hoc-tap"
          title="Phân tích hồ sơ học tập"
          icon="fas fa-chart-bar text-primary px-2"
        />
        <AsideMenuItem
          to="/vireya/danh-gia-trinh-do"
          title="Đánh giá & Định hướng học tập"
          icon="fas fa-tasks text-primary px-2"
        />

        {/* NEOVANA */}
        <div className="menu-item mt-10">
          <h4 className="menu-content text-success mb-2 fs-6 fw-bold text-uppercase">
            <i className="fas fa-map me-2 text-success" />
            NEOVANA
          </h4>
        </div>

        <AsideMenuItem
          to="/neovana/ho-so-ca-nhan"
          title="Hồ sơ cá nhân"
          icon="fas fa-id-card text-success px-2"
        />
        <AsideMenuItem
          to="/neovana/phan-tich-nang-luc"
          title="Phân tích năng lực"
          icon="fas fa-chart-line text-success px-2"
        />
        <AsideMenuItem
          to="/neovana/dinh-huong-phat-trien"
          title="Định hướng phát triển"
          icon="fas fa-compass text-success px-2"
        />

        {/* ZENORA */}
        <div className="menu-item mt-10">
          <h4 className="menu-content text-danger mb-2 fs-6 fw-bold text-uppercase">
            <i className="fas fa-heartbeat me-2 text-danger" />
            ZENORA
          </h4>
        </div>

        <AsideMenuItem
          to="/zenora/stress-market"
          title="Stress Market"
          icon="fas fa-burn text-danger px-2"
        />
        <AsideMenuItem
          to="/zenora/cloud-whisper"
          title="Cloud Whisper"
          icon="fas fa-cloud text-danger px-2"
        />
        <AsideMenuItem
          to="/zenora/relaxation"
          title="Relaxation"
          icon="fas fa-spa text-danger px-2"
        />
        <AsideMenuItem
          to="/zenora/void-zone"
          title="Void Zone"
          icon="fas fa-moon text-danger px-2"
        />
      </div>
    </div>
  );
}
