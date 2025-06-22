import React from "react";
import { AsideMenuItem } from "./AsideMenuItem";

export function AsideMenuMain() {
  return (
    <>
      {" "}
      <>
        <>
          <div className="menu-item">
            <h4 className="menu-content text-muted mb-0 fs-6 fw-bold text-uppercase">
              Bảng tổng hợp
            </h4>
          </div>
          <AsideMenuItem to="/dashboard" title="Tóm tắt" />
          <AsideMenuItem to="/light" title="Chi tiết" />
        </>

        <>
          <div className="menu-item mt-10">
            <h4 className="menu-content text-muted mb-0 fs-6 fw-bold text-uppercase">
              VIREYA (AI Mentor)
            </h4>
          </div>
          <AsideMenuItem to="/chat" title="Cập nhật kết quả học tập" />
          <AsideMenuItem to="/shop/shop-1" title="Hồ sơ học tập" />
          <AsideMenuItem to="/shop/shop-2" title="Đánh giá năng lực" />
          <AsideMenuItem to="/shop/shop-2" title="Đề xuất kế hoạch học tập" />

        </>

        <>
          <div className="menu-item mt-10">
            <h4 className="menu-content text-muted mb-0 fs-6 fw-bold text-uppercase">
              NEOVANA (Bản đồ học lực & ước mơ)
            </h4>
          </div>
          <AsideMenuItem to="/general/faq" title="Cập nhật hồ sơ cá nhân" />
          <AsideMenuItem to="/general/pricing" title="Chi tiết hồ sơ" />
          <AsideMenuItem to="/general/invoice" title="Phân tích năng lực" />
          <AsideMenuItem to="/general/wizard" title="Định hướng phát triển" />
        </>

        <>
          <div className="menu-item mt-10">
            <h4 className="menu-content text-muted mb-0 fs-6 fw-bold text-uppercase">
              AYURA (Vườn chữa lành)
            </h4>
          </div>
          <AsideMenuItem to="/profile/overview" title="Nhật kí chũa lành" />
          <AsideMenuItem to="/profile/account" title="Nguyên liệu chăm cây" />
          <AsideMenuItem to="/profile/settings" title="Tạo nguyên liệu" />
        </>

        <>
          <div className="menu-item mt-10">
            <h4 className="menu-content text-muted mb-0 fs-6 fw-bold text-uppercase">
              ZENORA (Trợ lý cảm xúc AI)
            </h4>
          </div>
          <AsideMenuItem to="/docs" title="Strees Market" />
          <AsideMenuItem to="/builder" title="Cloud Whisper"  />
          <AsideMenuItem to="/docs/change-log" title="Relaxation" />
          <AsideMenuItem to="/docs/change-log" title="Void Zone" />
        </>
      </>
    </>
  );
}
