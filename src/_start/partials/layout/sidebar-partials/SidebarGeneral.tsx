import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { AsideMenuMain } from "../../../layout/components/aside/AsideMenuMain";

const SidebarGeneral: React.FC = () => {
  const [activeTab, setTab] = useState<number | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string>("");
  const [showBigText, setShowBigText] = useState(true);

  const history = useHistory();
  const location = useLocation();
  const isDashboardPage = location.pathname === "/dashboard";

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
    { id: 0, title: "COREMIND", color: "#ff6b81" },
    { id: 1, title: "PATHFINDER", color: "#6f42c1" },
    { id: 2, title: "HEARTCORE", color: "#20c997" },
    { id: 3, title: "ROBOKI", color: "#fd7e14" },
    { id: 4, title: "DANH MỤC", color: "#0dcaf0" },
  ];

  const menus: Record<
    number,
    Array<{
      label: string;
      to: string;
      color: string;
      link?: string;
    }>
  > = {
    0: [
      {
        label: "📘 Kết quả học tập",
        to: "/coremind/ket-qua-hoc-tap",
        color: "#ff8787",
      },
      {
        label: "🗺️ Hành trình học tập",
        to: "/coremind/hanh-trinh-hoc-tap",
        color: "#ff9f6e",
      },
      {
        label: "📈 Phân tích năng lực",
        to: "/coremind/phan-tich-nang-luc",
        color: "#ffb347",
      },
      {
        label: "🧭 La bàn định hướng học tập",
        to: "/coremind/danh-gia-trinh-do",
        color: "#f06595",
      },
    ],
    1: [
      {
        label: "💼 La bàn phát triển",
        to: "/pathfinder/la-ban-phat-trien",
        color: "#4dabf7",
      },
    ],
    2: [
      {
        label: "🌀 Void Zone",
        to: "/heartcore/void-zone",
        color: "#fd7e14",
      },
      {
        label: "☁ CloudWhisper",
        to: "/heartcore/cloud-whisper",
        color: "#fd7e14",
      },
    ],
    3: [
      {
        label: "🤖 Hỗ trợ (Gì cũng biết)",
        to: "/roboki/embed/hotro",
        link: "https://roboki.vn/",
        color: "#e6fd14",
      },
      {
        label: "📘 Thiết kế dự án học tập",
        to: "/roboki/embed/thietke",
        link: "https://roboki.vn/g/682c2d277e2e043fa9c31cba",
        color: "#e6fd14",
      },
      {
        label: "🧠 Chuyên sâu – Tư duy phản biện",
        to: "/roboki/embed/tuduy",
        link: "https://roboki.vn/g/67ddbd59923d0072befa135f",
        color: "#e6fd14",
      },
      {
        label: "🎓 Học sinh – Gia sư THPT",
        to: "/roboki/embed/giasu",
        link: "https://roboki.vn/g/681d6f075a561b1d5e71e835",
        color: "#e6fd14",
      },
      {
        label: "📊 Đánh giá năng lực",
        to: "/roboki/danh-gia-nang-luc",
        color: "#e6fd14",
      },
    ],
    4: [
      {
        label: "📝 Loại điểm",
        to: "/danh-muc/loai-diem",
        color: "#0dcaf0",
      },
      {
        label: "📘 Môn học",
        to: "/danh-muc/mon-hoc",
        color: "#0dcaf0",
      },
      {
        label: "📜 Chứng chỉ",
        to: "/danh-muc/chung-chi",
        color: "#0dcaf0",
      },
      {
        label: "💡 Kỹ năng",
        to: "/danh-muc/ky-nang",
        color: "#0dcaf0",
      },
    ],
  };

  useEffect(() => {
    const move = (event: MouseEvent) => {
      setCursorPos({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener("mousemove", move);

    return () => {
      window.removeEventListener("mousemove", move);
    };
  }, []);

  /*
    Trang /dashboard tự có bản đồ và các menu tương tác riêng.
    Không render SidebarGeneral tại đây để tránh bất kỳ wrapper/panel fixed nào
    phủ lên nút và menu nhỏ trên điện thoại.
  */
  if (isDashboardPage) {
    return null;
  }

  return (
    <>
      <style>{`
        /*
          Desktop: giữ panel trợ lý ở bên phải trên các trang tính năng.
          Mobile: thu wrapper cha về kích thước 0 để nó không phủ nội dung.
          Riêng /dashboard, AsideMenuMain không render vì phần tử fixed
          bên trong có thể chặn nút "Bắt đầu hành trình".
        */
        @media (max-width: 768px) {
          .lumora-sidebar-general-root {
            width: 0 !important;
            min-width: 0 !important;
            height: 0 !important;
            min-height: 0 !important;
            overflow: visible !important;
            background: transparent !important;
          }

          .lumora-sidebar-left-content {
            display: none !important;
            pointer-events: none !important;
          }

          .lumora-ai-panel-host {
            width: 0 !important;
            min-width: 0 !important;
            max-width: 0 !important;
            height: 0 !important;
            min-height: 0 !important;
            border-left: none !important;
            box-shadow: none !important;
            background: transparent !important;
            overflow: visible !important;
          }
        }
      `}</style>

      <div
        className="lumora-sidebar-general-root"
        style={{
          display: "flex",
          height: "100vh",
          background: "#f6faf8",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: cursorPos.y - 180,
            left: cursorPos.x - 180,
            width: 360,
            height: 360,
            background:
              "radial-gradient(circle, rgba(194, 231, 220, 0.22), transparent 70%)",
            pointerEvents: "none",
            transition: "top 0.05s linear, left 0.05s linear",
            zIndex: 0,
          }}
        />

        {/* LEFT CONTENT */}
        <div
          className="lumora-sidebar-left-content"
          style={{
            flex: 1,
            minWidth: 0,
            padding: "1rem",
            position: "relative",
            paddingBottom: "220px",
            transform: sidebarOpen ? "translateX(0)" : "translateX(-120%)",
            transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
            pointerEvents: sidebarOpen ? "auto" : "none",
            zIndex: 2,
            overflow: "auto",
            background: "transparent",
          }}
        >
          {showBigText && null}

          {activeTab !== null && (
            <>
              <h3
                style={{
                  fontWeight: 800,
                  fontSize: "28px",
                  marginBottom: "20px",
                  color: "#355c5a",
                }}
              >
                {tabs[activeTab].title}
              </h3>

              {menus[activeTab].map((item) => {
                const isActive = activeItem === item.to;

                return (
                  <div
                    key={item.to}
                    onClick={() => {
                      setActiveItem(item.to);
                      setShowBigText(false);
                      history.push(item.to, { link: item.link });
                    }}
                    style={{
                      position: "relative",
                      padding: "12px 18px",
                      borderRadius: "16px",
                      marginBottom: "12px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "15px",
                      color: item.color,
                      background: isActive
                        ? "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(242,248,246,0.96))"
                        : "rgba(255,255,255,0.65)",
                      border: isActive
                        ? `1px solid ${item.color}`
                        : "1px solid rgba(180,210,200,0.35)",
                      boxShadow: isActive
                        ? `0 0 18px ${item.color}22`
                        : "0 6px 16px rgba(120,160,150,0.06)",
                      transition: "all 0.25s ease",
                      overflow: "hidden",
                      backdropFilter: "blur(6px)",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.transform = "translateX(6px)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    {item.label}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/*
          Không render panel AI trên /dashboard.
          AsideMenuMain có phần tử position: fixed trên mobile; nếu vẫn render,
          phần tử đó có thể nằm đè lên nút "Bắt đầu hành trình".
        */}
        {!isDashboardPage && (
          <div
            className="lumora-ai-panel-host"
            style={{
              width: "360px",
              minWidth: "360px",
              height: "100vh",
              borderLeft: "1px solid rgba(180,210,200,0.45)",
              boxShadow: "-12px 0 28px rgba(120,160,150,0.06)",
              zIndex: 3,
              background:
                "linear-gradient(180deg, #f5faf8 0%, #edf5f2 100%)",
              overflow: "hidden",
            }}
          >
            <AsideMenuMain />
          </div>
        )}
      </div>
    </>
  );
};

export default SidebarGeneral;