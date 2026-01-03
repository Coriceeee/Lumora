import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { toAbsoluteUrl } from "../../../helpers";

const SidebarGeneral: React.FC = () => {
  const [activeTab, setTab] = useState<number | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string>("");
  const [showBigText, setShowBigText] = useState(true);

  const history = useHistory();
  const location = useLocation();
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  /* ===== ROUTE CONTROL ===== */
  useEffect(() => {
    setActiveItem(location.pathname);

    if (location.pathname === "/dashboard") {
      setSidebarOpen(false);
      setTab(null);
      setShowBigText(true);
    } else {
      setShowBigText(false);
    }
  }, [location.pathname]);

  const tabs = [
    { id: 0, title: "VIREYA", iconFile: "aven", color: "#ff6b81" },
    { id: 1, title: "NEOVANA", iconFile: "tower", color: "#6f42c1" },
    { id: 2, title: "ZENORA", iconFile: "ayura", color: "#20c997" },
    { id: 3, title: "ROBOKI", iconFile: "kanba", color: "#fd7e14" },
    { id: 4, title: "DANH MỤC", iconFile: "treva", color: "#0dcaf0" },
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
      { label: "🤖 Hỗ trợ (Gì cũng biết)", to: "/roboki/embed/hotro", link: "https://roboki.vn/", color: "#e6fd14" },
      { label: "📘 Thiết kế dự án học tập", to: "/roboki/embed/thietke", link: "https://roboki.vn/g/682c2d277e2e043fa9c31cba", color: "#e6fd14" },
      { label: "🧠 Chuyên sâu – Tư duy phản biện", to: "/roboki/embed/tuduy", link: "https://roboki.vn/g/67ddbd59923d0072befa135f", color: "#e6fd14" },
      { label: "🎓 Học sinh – Gia sư THPT", to: "/roboki/embed/giasu", link: "https://roboki.vn/g/681d6f075a561b1d5e71e835", color: "#e6fd14" },
      { label: "📊 Đánh giá năng lực", to: "/roboki/danh-gia-nang-luc", link: null, color: "#e6fd14" },
    ],
    4: [
      { label: "📝 Loại điểm", to: "/danh-muc/loai-diem", color: "#0dcaf0" },
      { label: "📘 Môn học", to: "/danh-muc/mon-hoc", color: "#0dcaf0" },
      { label: "📜 Chứng chỉ", to: "/danh-muc/chung-chi", color: "#0dcaf0" },
      { label: "💡 Kỹ năng", to: "/danh-muc/ky-nang", color: "#0dcaf0" },
    ],
  };

  /* ===== CURSOR TRACK ===== */
  useEffect(() => {
    const move = (e: any) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <div
  style={{
    display: "flex",
    height: "100vh",
    background: "#1f1f2e",
    position: "relative", // 👈 QUAN TRỌNG
  }}

    >
      {/* ===== LEFT SLIDE PANEL ===== */}
      <div
        style={{
          flexGrow: 1,
          padding: "1rem",
          position: "relative",
          paddingBottom: "220px",
          transform: sidebarOpen ? "translateX(0)" : "translateX(-120%)",
          transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
          pointerEvents: sidebarOpen ? "auto" : "none",
        }}
      >
        {activeTab !== null && (
          <>
            <h3 className="fw-bolder text-white fs-2 mb-4">
              {tabs[activeTab].title}
            </h3>

            {menus[activeTab].map((item: any) => (
              <div
                key={item.to}
                style={{
                  padding: "12px 18px",
                  borderRadius: "12px",
                  marginBottom: "12px",
                  cursor: "pointer",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: item.color,
                  fontWeight: 600,
                }}
                onClick={() => {
                  setActiveItem(item.to);
                  setShowBigText(false);
                  history.push(item.to, { link: item.link });
                }}
              >
                {item.label}
              </div>
            ))}
          </>
        )}
      </div>

      {/* ===== RIGHT COLUMN ===== */}
      <div
        style={{
          width: showBigText ? 200 : 80,
          padding: "1rem 0",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          transition: "width 0.35s ease",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <div
              key={tab.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: showBigText ? "space-between" : "center",
                padding: showBigText ? "0 12px" : 0,
              }}
            >
              {showBigText && (
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 900,
                    color: tab.color,
                    letterSpacing: "1px",
                  }}
                >
                  {tab.title}
                </div>
              )}

              <div
                onClick={() => {
                  setTab(tab.id);
                  setSidebarOpen(true);
                  setShowBigText(false);
                }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: isActive ? tab.color : "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  boxShadow: isActive
                    ? `0 0 20px ${tab.color}`
                    : "0 0 12px rgba(0,0,0,0.3)",
                }}
              >
                <img
                  src={toAbsoluteUrl(`/media/svg/logo/colored/${tab.iconFile}.svg`)}
                  style={{ width: 28, filter: "brightness(0) invert(1)" }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== SCHOOL IMAGE (SIDEBAR ONLY) ===== */}
<div
  style={{
    position: "absolute",
    bottom: "24px",
    left: "50%",                     // 👈 canh giữa
    transform: "translateX(-50%)",   // 👈 kéo về đúng tâm
    width: showBigText ? "300px" : "220px",
    transition: "all 0.35s ease",
    pointerEvents: "none",
    zIndex: 1,
  }}
>


  <img
    src={toAbsoluteUrl("/media/schools/Trường THPT.NK.jpg")}
    alt="Trường THPT"
    style={{
      width: "100%",
      height: "160px", // 👈 TO HƠN, RÕ HƠN
      objectFit: "cover",
      borderRadius: "24px",
      boxShadow: "0 0 28px rgba(13,202,240,0.35)",
      border: "1px solid rgba(255,255,255,0.18)",
    }}
  />
</div>

       
    </div>
  );
};

export default SidebarGeneral;
