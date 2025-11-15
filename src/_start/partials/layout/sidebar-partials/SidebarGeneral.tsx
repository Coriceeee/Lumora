import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { toAbsoluteUrl } from "../../../helpers";

const SidebarGeneral: React.FC = () => {
  const [activeTab, setTab] = useState<number | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState<string>("");

  const history = useHistory();
  const location = useLocation();
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setActiveItem(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/dashboard") {
      setSidebarOpen(false);
      setTab(null);
    }
  }, [location.pathname]);

  const tabs = [
    { id: 0, title: "Vireya", iconFile: "aven", color: "#ff6b81" },
    { id: 1, title: "Neovana", iconFile: "tower", color: "#6f42c1" },
    { id: 2, title: "Zenora", iconFile: "ayura", color: "#20c997" },
    { id: 3, title: "Roboki", iconFile: "kanba", color: "#fd7e14" },
    { id: 4, title: "Danh mục", iconFile: "treva", color: "#0dcaf0" },
  ];

  const menus: any = {
    0: [
      { label: "📂 Hồ sơ học tập", to: "/vireya/ho-so-hoc-tap", color: "#ff8787" },
      { label: "📈 Phân tích hồ sơ học tập", to: "/vireya/phan-tich-ho-so-hoc-tap", color: "#ff8787" },
      { label: "🧪 Đánh giá & Định hướng học tập", to: "/vireya/danh-gia-trinh-do", color: "#ff8787" },
    ],
    1: [
      { label: "👤 Hồ sơ năng lực", to: "/neovana/ho-so-ca-nhan", color: "#6f42c1" },
      { label: "🚀 Định hướng nghề nghiệp", to: "/neovana/dinh-huong-phat-trien", color: "#845ef7" },
      { label: "🧠 Phân tích năng lực", to: "/neovana/phan-tich-nang-luc", color: "#845ef7" },
    ],
    2: [
      { label: "🌀 Void Zone", to: "/zenora/void-zone", color: "#fd7e14" },
      { label: "☁ CloudWhisper", to: "/zenora/cloud-whisper", color: "#fd7e14" },
    ],
    3: [
      {
        label: "🤖 Hỗ trợ (Gì cũng biết)",
        to: "/roboki/embed/hotro",
        link: "https://roboki.vn/",
        color: "#e6fd14"
      },
      {
        label: "📘 Thiết kế dự án học tập",
        to: "/roboki/embed/thietke",
        link: "https://roboki.vn/g/682c2d277e2e043fa9c31cba",
        color: "#e6fd14"
      },
      {
        label: "🧠 Chuyên sâu – Tư duy phản biện",
        to: "/roboki/embed/tuduy",
        link: "https://roboki.vn/g/67ddbd59923d0072befa135f",
        color: "#e6fd14"
      },
      {
        label: "🎓 Học sinh – Gia sư THPT",
        to: "/roboki/embed/giasu",
        link: "https://roboki.vn/g/681d6f075a561b1d5e71e835",
        color: "#e6fd14"
      },
      {
        label: "📊 Đánh giá năng lực",
        to: "/roboki/danh-gia-nang-luc",
        link: null,
        color: "#e6fd14"
      }
    ],
    4: [
      { label: "📝 Loại điểm", to: "/danh-muc/loai-diem", color: "#0dcaf0" },
      { label: "📘 Môn học", to: "/danh-muc/mon-hoc", color: "#0dcaf0" },
      { label: "📜 Chứng chỉ", to: "/danh-muc/chung-chi", color: "#0dcaf0" },
      { label: "💡 Kỹ năng", to: "/danh-muc/ky-nang", color: "#0dcaf0" },
    ],
  };

  const menuItemStyles: React.CSSProperties = {
    padding: "12px 18px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1.1rem",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    marginBottom: "12px",
    transition: "all 0.25s ease",
  };

  useEffect(() => {
    const move = (e: any) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const computeGlow = (elem: HTMLDivElement | null, color: string) => {
    if (!elem) return "none";
    const rect = elem.getBoundingClientRect();
    const dx = cursorPos.x - (rect.left + rect.width / 2);
    const dy = cursorPos.y - (rect.top + rect.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    const intensity = Math.max(0, 140 - dist) / 140;

    return `
      0 0 ${10 + 20 * intensity}px ${color}77,
      0 0 ${30 + 40 * intensity}px ${color}55
    `;
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#1f1f2e" }}>
      
      <div
        style={{
          flexGrow: 1,
          padding: "1rem",
          position: "relative",
          paddingBottom: "220px",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-130%)",
          transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {activeTab !== null && (
          <>
            <h3 className="fw-bolder text-white fs-2 mb-4">{tabs[activeTab].title}</h3>

            {menus[activeTab].map((item: any) => {
              const isActive = activeItem === item.to;
              return (
                <div
                  key={item.to}
                  ref={(el) => (itemRefs.current[item.to] = el)}
                  style={{
                    ...menuItemStyles,
                    color: item.color,
                    boxShadow: isActive
                      ? `0 0 18px ${item.color}, 0 0 40px ${item.color}55`
                      : computeGlow(itemRefs.current[item.to], item.color),
                  }}
                  onClick={() => {
                    setActiveItem(item.to);
                    history.push(item.to, { link: item.link });
                  }}
                >
                  <span>{item.label}</span>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* IMAGE FIXED */}
      <div
        style={{
          position: "absolute",
          bottom: "100px",
          left: 0,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <img
          src="/media/schools/Trường THPT.NK.jpg"
          style={{
            width: "88%",
            height: "220px",
            objectFit: "cover",
            borderRadius: "16px",
            boxShadow: "0 0 35px #0dcaf077",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        />
      </div>

      {/* RIGHT TAB */}
      <div
        style={{
          width: 80,
          padding: "1rem 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => {
                setTab(tab.id);
                setSidebarOpen(true);
              }}
              style={{
                width: 60,
                height: 60,
                borderRadius: "18px",
                marginBottom: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isActive ? tab.color : "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.3)",
                boxShadow: isActive
                  ? `0 0 20px ${tab.color}, 0 0 40px ${tab.color}`
                  : `0 0 12px rgba(0,0,0,0.3)`,
                transition: "all 0.25s ease",
              }}
            >
              <img
                src={toAbsoluteUrl(`/media/svg/logo/colored/${tab.iconFile}.svg`)}
                style={{ width: 28, filter: "brightness(0) invert(1)" }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SidebarGeneral;
