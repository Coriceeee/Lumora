import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { KTSVG, toAbsoluteUrl } from "../../../helpers";
import { Dropdown1 } from "../../../partials/content/dropdown/Dropdown1";

const SidebarGeneral: React.FC = () => {
  const [activeTab, setTab] = useState<number>(0);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const history = useHistory();

  // Tab definitions
  const tabs = [
    { id: 0, title: "Vireya", iconFile: "aven", color: "#ff6b81" },
    { id: 1, title: "Neovana", iconFile: "tower", color: "#6f42c1" },
    { id: 2, title: "Ayura", iconFile: "ayura", color: "#20c997" },
    { id: 3, title: "Zenora", iconFile: "kanba", color: "#fd7e14" },
    { id: 4, title: "Danh mục", iconFile: "treva", color: "#0dcaf0" },
  ];

  // Menus
  const menus: { [key: number]: { label: string; to: string; color: string }[] } = {
    0: [
      { label: "📊 Kết quả học tập", to: "/vireya/ket-qua-hoc-tap", color: "#ff6b81" },
      { label: "📂 Hồ sơ học tập", to: "/vireya/ho-so-hoc-tap", color: "#ff8787" },
      { label: "📈 Phân tích hồ sơ học tập", to: "/vireya/phan-tich-ho-so-hoc-tap", color: "#ff8787" },
      { label: "🧪 Đánh giá & Định hướng học tập", to: "/vireya/danh-gia-trinh-do", color: "#ff8787" },

    ],
    1: [
      { label: "👤 Hồ sơ năng lực", to: "/neovana/ho-so-ca-nhan", color: "#6f42c1" },
      { label: "🚀 Đánh giá & Định hướng nghề nghiệp", to: "/neovana/dinh-huong-phat-trien", color: "#845ef7" },
      { label: "🧠 Phân tích năng lực", to: "/neovana/phan-tich-nang-luc", color: "#845ef7" },
      
    ],
    2: [{ label: "🪴Vườn chữa lành", to: "/ayura/vuon-chua-lanh", color: "#20c997" }],
    3: [{ label: "🌀 Void Zone", to: "/zenora/void-zone", color: "#fd7e14" }],
    4: [
      { label: "📝 Loại điểm", to: "/danh-muc/loai-diem", color: "#0dcaf0" },
      { label: "📘 Môn học", to: "/danh-muc/mon-hoc", color: "#0dcaf0" },
      { label: "📜 Chứng chỉ", to: "/danh-muc/chung-chi", color: "#0dcaf0" },
      { label: "📝 Khảo sát", to: "/danh-muc/khao-sat", color: "#0dcaf0" },
      { label: "💡 Kỹ năng", to: "/danh-muc/ky-nang", color: "#0dcaf0" },
    ],
  };

  const menuItemStyles: React.CSSProperties = {
    padding: "10px 16px",
    borderRadius: "10px",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1.1rem",
    background: "transparent",
    textShadow: "0 0 2px #000",
  };

  // Cursor tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Neon glow effect based on cursor distance
  const computeGlow = (elem: HTMLDivElement, color: string) => {
    const rect = elem.getBoundingClientRect();
    const dx = cursorPos.x - (rect.left + rect.width / 2);
    const dy = cursorPos.y - (rect.top + rect.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const intensity = Math.max(0, 150 - dist) / 150;
    const glow1 = `0 0 ${10 + 20 * intensity}px ${color}`;
    const glow2 = `0 0 ${30 + 40 * intensity}px ${color}55`;
    const glow3 = `0 0 ${50 + 50 * intensity}px ${color}33`;
    return `${glow1}, ${glow2}, ${glow3}`;
  };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#1f1f2e" }}>
      {/* Sidebar Content (giữ bên trái) */}
      <div style={{ flexGrow: 1, overflowY: "auto", padding: "1rem" }}>
        <div className="card card-custom bg-transparent w-100">
          <div className="card-header d-flex justify-content-between align-items-center border-0 mb-3">
            <h3 className="card-title fw-bolder text-white fs-2">{tabs[activeTab].title}</h3>
            <div className="card-toolbar d-flex align-items-center gap-2">
              <button type="button" className="btn btn-md btn-icon btn-icon-white btn-info">
                <KTSVG path="/media/icons/duotone/Layout/Layout-4-blocks-2.svg" className="svg-icon-1" />
              </button>
              <Dropdown1 />
            </div>
          </div>

          <div>
            {menus[activeTab].map((item) => (
              <div
                key={item.to}
                style={{
                  ...menuItemStyles,
                  color: item.color,
                  boxShadow: "0 0 8px rgba(0,0,0,0.3)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                className="menu-item mb-2"
                onClick={() => history.push(item.to)}
                ref={(el) => {
                  if (el) el.style.boxShadow = computeGlow(el, item.color);
                }}
              >
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Tabs (chuyển sang bên phải) */}
      <div
        style={{
          width: 80,
          padding: "1rem 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          borderLeft: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setTab(tab.id)}
            style={{
              width: 60,
              height: 60,
              borderRadius: "12px",
              marginBottom: "12px",
              backgroundColor: activeTab === tab.id ? tab.color : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow:
                activeTab === tab.id
                  ? `0 0 20px ${tab.color}, 0 0 40px ${tab.color}55, 0 0 60px ${tab.color}33`
                  : "0 2px 6px rgba(0,0,0,0.2)",
              animation: activeTab === tab.id ? "glowPulse 2s infinite alternate" : "none",
            }}
          >
            <img
              alt={tab.title}
              src={toAbsoluteUrl(`/media/svg/logo/colored/${tab.iconFile}.svg`)}
              style={{
                width: 30,
                filter:
                  activeTab === tab.id
                    ? `drop-shadow(0 0 10px ${tab.color}) drop-shadow(0 0 20px ${tab.color}aa)`
                    : "none",
                transition: "filter 0.3s ease",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SidebarGeneral;
