import React, { useEffect, useMemo, useState } from "react";
// import "./start-dashboard-fullscreen.css";

type SceneType = "learning" | "career" | "emotion";

type SubMenuItem = {
  label: string;
  to: string;
  color: string;
  icon: string;
  desc: string;
};

export const StartDashboardPage: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [typing, setTyping] = useState("");
  const [selected, setSelected] = useState<null | SceneType>(null);

  const text = "EduCompass đang mở bản đồ định hướng của bạn...";

  const learningTabs: SubMenuItem[] = [
    {
      label: "Kết quả học tập",
      to: "/coremind/ket-qua-hoc-tap",
      color: "#ff8787",
      icon: "📘",
      desc: "Theo dõi thành tích và tiến độ học tập.",
    },
    {
      label: "Hành trình học tập",
      to: "/coremind/hanh-trinh-hoc-tap",
      color: "#ff9f6e",
      icon: "🗺️",
      desc: "Khám phá lộ trình học và các cột mốc phát triển.",
    },
    {
      label: "Phân tích năng lực",
      to: "/coremind/phan-tich-nang-luc",
      color: "#ffb347",
      icon: "📈",
      desc: "Đánh giá điểm mạnh và khả năng hiện tại của bạn.",
    },
    {
      label: "La bàn định hướng học tập",
      to: "/coremind/danh-gia-trinh-do",
      color: "#f06595",
      icon: "🧭",
      desc: "Nhận gợi ý hướng học phù hợp với năng lực.",
    },
  ];

  const careerTabs: SubMenuItem[] = [

    {
      label: "La bàn nghề nghiệp",
      to: "/pathfinder/la-ban-phat-trien",
      color: "#4dabf7",
      icon: "💼",
      desc: "Định hướng lựa chọn nghề nghiệp phù hợp với bạn.",
    },
  ];

  const emotionTabs: SubMenuItem[] = [
    {
      label: "Void Zone",
      to: "/heartcore/void-zone",
      color: "#ff6b6b",
      icon: "🕳️",
      desc: "Thả bỏ áp lực và giải phóng những cảm xúc nặng lòng.",
    },
    {
      label: "Cloud Whisper",
      to: "/heartcore/cloud-whisper",
      color: "#748ffc",
      icon: "☁️",
      desc: "Đón nhận những thông điệp chữa lành nhẹ nhàng cho tâm hồn.",
    },
  ];

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setTyping(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(timer);
    }, 28);

    return () => clearInterval(timer);
  }, []);

  const leaves = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: `leaf-${i}`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 8}s`,
        duration: `${8 + Math.random() * 4}s`,
      })),
    []
  );

  const petals = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: `petal-${i}`,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 7}s`,
        duration: `${7 + Math.random() * 4}s`,
      })),
    []
  );

  const fireflies = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: `firefly-${i}`,
        left: `${10 + Math.random() * 80}%`,
        top: `${10 + Math.random() * 70}%`,
        delay: `${Math.random() * 6}s`,
      })),
    []
  );

  const learningSparks = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: `gold-${i}`,
        left: `${18 + Math.random() * 64}%`,
        bottom: `${10 + Math.random() * 22}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${5 + Math.random() * 3}s`,
      })),
    []
  );

  const careerSparks = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: `blue-${i}`,
        left: `${18 + Math.random() * 64}%`,
        bottom: `${10 + Math.random() * 22}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${5 + Math.random() * 3}s`,
      })),
    []
  );

  const emotionSparks = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: `rose-${i}`,
        left: `${18 + Math.random() * 64}%`,
        bottom: `${10 + Math.random() * 22}%`,
        delay: `${Math.random() * 5}s`,
        duration: `${5 + Math.random() * 3}s`,
      })),
    []
  );

  const handleEnter = (type: SceneType) => {
    setSelected(type);
    localStorage.setItem("educompass_scene", type);
  };

  const handleNavigate = (to: string) => {
    window.location.assign(to);
  };

  const activeTabs =
    selected === "learning"
      ? learningTabs
      : selected === "career"
      ? careerTabs
      : selected === "emotion"
      ? emotionTabs
      : [];

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          width: 100%;
          min-height: 100%;
        }

        body {
          min-height: 100vh;
          overflow-x: hidden;
          background: linear-gradient(180deg, #f3fffb 0%, #eefcf8 50%, #edf8ff 100%);
          font-family: inherit;
          -webkit-tap-highlight-color: transparent;
        }

        button {
          font-family: inherit;
          -webkit-tap-highlight-color: transparent;
        }

        .edu-dashboard-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          padding: clamp(14px, 2vw, 28px);
          overflow: hidden;
          z-index: 0;
        }

        .start-btn,
        .portal,
        .submenu-btn {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        .forest-bg,
        .forest-bg *,
        .map-svg,
        .layer-hill-back,
        .layer-hill-mid,
        .layer-hill-front,
        .particle-layer,
        .particle-layer *,
        .forest-glow-1,
        .forest-glow-2,
        .forest-glow-3,
        .forest-dots,
        .forest-hill,
        .tree,
        .grass,
        .falling-leaf,
        .falling-petal,
        .firefly {
          pointer-events: none !important;
          user-select: none;
        }

        .hero,
        .map-section,
        .map-shell,
        .map-inner,
        .core,
        .portal,
        .portal-content,
        .submenu-wrap,
        .submenu-card,
        .submenu-list,
        .submenu-btn,
        .submenu-item,
        .start-btn {
          position: relative;
          z-index: 2;
          pointer-events: auto;
        }

        .forest-bg {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .forest-glow-1,
        .forest-glow-2,
        .forest-glow-3 {
          position: absolute;
          border-radius: 999px;
          filter: blur(90px);
          opacity: 0.32;
        }

        .forest-glow-1 {
          width: min(420px, 45vw);
          height: min(420px, 45vw);
          left: -80px;
          top: 40px;
          background: rgba(190, 242, 100, 0.45);
        }

        .forest-glow-2 {
          width: min(460px, 48vw);
          height: min(460px, 48vw);
          right: -120px;
          top: 120px;
          background: rgba(125, 211, 252, 0.45);
        }

        .forest-glow-3 {
          width: min(380px, 40vw);
          height: min(380px, 40vw);
          left: 50%;
          top: 0;
          transform: translateX(-50%);
          background: rgba(187, 247, 208, 0.35);
        }

        .forest-dots {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 10% 14%, rgba(34,197,94,.45) 0 5px, transparent 6px),
            radial-gradient(circle at 30% 14%, rgba(34,197,94,.45) 0 5px, transparent 6px),
            radial-gradient(circle at 60% 14%, rgba(34,197,94,.45) 0 5px, transparent 6px),
            radial-gradient(circle at 82% 14%, rgba(34,197,94,.45) 0 5px, transparent 6px);
          opacity: 0.5;
        }

        .forest-hill {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: clamp(160px, 26vw, 260px);
          background:
            radial-gradient(circle at 15% 35%, rgba(187,247,208,.95), transparent 32%),
            radial-gradient(circle at 50% 20%, rgba(190,242,100,.55), transparent 30%),
            radial-gradient(circle at 78% 30%, rgba(191,219,254,.85), transparent 34%),
            linear-gradient(180deg, rgba(220,252,231,.25), rgba(187,247,208,.75));
          clip-path: ellipse(78% 100% at 50% 100%);
          opacity: 0.82;
        }

        .tree {
          position: absolute;
          bottom: 120px;
          width: 90px;
          height: 160px;
          opacity: 0.22;
          filter: blur(0.2px);
        }

        .tree::before {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 12px;
          height: 70px;
          border-radius: 10px;
          background: rgba(76, 93, 70, 0.35);
        }

        .tree::after {
          content: "";
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 90px;
          height: 95px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(134,239,172,.65), rgba(74,222,128,.28));
        }

        .tree-1 { left: 4%; bottom: 110px; }
        .tree-2 { left: 14%; bottom: 95px; transform: scale(0.9); }
        .tree-3 { right: 12%; bottom: 108px; transform: scale(1.05); }
        .tree-4 { right: 3%; bottom: 92px; transform: scale(0.88); }

        .grass {
          position: absolute;
          bottom: 25px;
          height: 90px;
          width: 220px;
          border-radius: 50%;
          opacity: 0.22;
          filter: blur(2px);
        }

        .grass::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 100%, rgba(134,239,172,.7), transparent 70%);
        }

        .grass-1 { left: 4%; }
        .grass-2 { left: 38%; width: 260px; }
        .grass-3 { right: 5%; }

        .falling-leaf {
          position: absolute;
          top: -30px;
          width: 16px;
          height: 16px;
          background: linear-gradient(135deg,#86efac,#22c55e);
          border-radius: 2px 10px 2px 10px;
          opacity: 0.55;
          animation: leafFall linear infinite;
        }

        .falling-petal {
          position: absolute;
          top: -25px;
          width: 12px;
          height: 12px;
          background: linear-gradient(135deg,#f9a8d4,#fbcfe8);
          border-radius: 50% 50% 50% 0;
          opacity: 0.6;
          animation: petalFall linear infinite;
        }

        .firefly {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,220,.9);
          box-shadow: 0 0 18px rgba(255,255,200,.7);
          opacity: 0.55;
          animation: fireflyFloat 5s ease-in-out infinite;
        }

        @keyframes leafFall {
          0% { transform: translateY(-30px) translateX(0) rotate(0deg); opacity: 0; }
          15% { opacity: 0.6; }
          50% { transform: translateY(220px) translateX(30px) rotate(140deg); }
          100% { transform: translateY(620px) translateX(-40px) rotate(320deg); opacity: 0; }
        }

        @keyframes petalFall {
          0% { transform: translateY(-20px) translateX(0) rotate(0deg) scale(0.8); opacity: 0; }
          20% { opacity: 0.7; }
          50% { transform: translateY(250px) translateX(-20px) rotate(120deg) scale(1); }
          100% { transform: translateY(620px) translateX(45px) rotate(260deg) scale(0.9); opacity: 0; }
        }

        @keyframes fireflyFloat {
          0%,100% { transform: translate(0,0) scale(1); opacity: 0.35; }
          50% { transform: translate(10px,-18px) scale(1.15); opacity: 0.9; }
        }

        .hero {
          max-width: 920px;
          width: 100%;
          margin: 0 auto 28px auto;
          padding: clamp(22px, 3.5vw, 42px);
          border-radius: 32px;
          background: linear-gradient(
            135deg,
            rgba(190,242,100,.16) 0%,
            rgba(134,239,172,.14) 35%,
            rgba(125,211,252,.16) 100%
          );
          box-shadow:
            0 14px 34px rgba(120,145,130,.06),
            inset 0 1px 0 rgba(255,255,255,.62);
          text-align: center;
          overflow: hidden;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(28px, 5vw, 42px);
          font-weight: 800;
          color: #28456b;
          line-height: 1.15;
        }

        .typing {
          margin-top: 12px;
          font-size: clamp(14px, 2vw, 16px);
          color: #637b92;
          min-height: 24px;
          line-height: 1.6;
        }

        .start-btn {
          margin-top: 22px;
          padding: 14px 28px;
          border: 2px solid rgba(33,37,41,.22);
          border-radius: 999px;
          font-weight: 700;
          font-size: clamp(14px, 2vw, 15px);
          cursor: pointer;
          background: linear-gradient(135deg,#ffffff,#f8fafc);
          color: #1f2937;
          box-shadow: 0 10px 24px rgba(120,145,130,.10);
          transition: .3s ease;
          max-width: 100%;
        }

        .start-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 28px rgba(120,145,130,.14);
        }

        .map-section {
          animation: fadeUp .65s ease;
        }

        .map-shell {
          max-width: 1180px;
          width: 100%;
          min-height: 620px;
          height: min(76vh, 760px);
          margin: 0 auto;
          border-radius: 34px;
          overflow: hidden;
          background: linear-gradient(
            135deg,
            rgba(190,242,100,.14) 0%,
            rgba(134,239,172,.12) 35%,
            rgba(125,211,252,.14) 100%
          );
          box-shadow:
            0 16px 40px rgba(120,145,130,.06),
            inset 0 1px 0 rgba(255,255,255,.68);
          backdrop-filter: blur(10px);
        }

        .map-inner {
          position: absolute;
          inset: 0;
          transition: transform .9s cubic-bezier(.22,1,.36,1), filter .7s ease;
        }

        .map-shell.zoom-learning .map-inner {
          transform: scale(1.05) translateX(7%);
          filter: blur(1.1px);
        }

        .map-shell.zoom-career .map-inner {
          transform: scale(1.05) translateX(-7%);
          filter: blur(1.1px);
        }

        .map-shell.zoom-emotion .map-inner {
          transform: scale(1.04) translateY(3%);
          filter: blur(1.1px);
        }

        .label-top {
          position: absolute;
          left: 50%;
          top: 18px;
          transform: translateX(-50%);
          font-size: clamp(12px, 1.8vw, 14px);
          letter-spacing: 1.4px;
          text-transform: uppercase;
          font-weight: 700;
          color: #5f7793;
          text-align: center;
          width: calc(100% - 32px);
        }

        .layer-hill-back,
        .layer-hill-mid,
        .layer-hill-front {
          position: absolute;
          left: 0;
          right: 0;
          border-radius: 50%;
        }

        .layer-hill-back {
          bottom: -120px;
          height: 240px;
          background: linear-gradient(180deg, rgba(190,242,100,.14), rgba(134,239,172,.26));
          clip-path: ellipse(70% 100% at 50% 100%);
        }

        .layer-hill-mid {
          bottom: -80px;
          height: 200px;
          background: linear-gradient(180deg, rgba(187,247,208,.16), rgba(125,211,252,.18));
          clip-path: ellipse(60% 100% at 50% 100%);
        }

        .layer-hill-front {
          bottom: -50px;
          height: 170px;
          background: linear-gradient(180deg, rgba(255,255,255,.12), rgba(220,252,231,.30));
          clip-path: ellipse(58% 100% at 50% 100%);
        }

        .map-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .path-line {
          stroke: rgba(120,145,160,.22);
          stroke-width: 3;
          fill: none;
          stroke-linecap: round;
          stroke-dasharray: 8 10;
          animation: pathFlow 8s linear infinite;
        }

        .path-glow {
          stroke: rgba(255,255,255,.22);
          stroke-width: 10;
          fill: none;
          filter: blur(8px);
        }

        @keyframes pathFlow {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: 180; }
        }

        .core {
          position: absolute;
          left: 50%;
          top: 28%;
          transform: translate(-50%,-50%);
          width: clamp(110px, 14vw, 148px);
          height: clamp(110px, 14vw, 148px);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: white;
          background:
            radial-gradient(circle at 30% 30%, rgba(255,255,255,.35), transparent 25%),
            linear-gradient(135deg, #67e8f9, #34d399);
          box-shadow:
            0 0 70px rgba(103,232,249,.14),
            0 0 95px rgba(52,211,153,.12),
            inset 0 2px 16px rgba(255,255,255,.18);
          animation: corePulse 4s ease-in-out infinite;
        }

        .core-icon { font-size: clamp(28px, 4vw, 38px); line-height: 1; }
        .core-label { margin-top: 8px; font-size: clamp(10px, 1.6vw, 12px); font-weight: 700; letter-spacing: 1.2px; }

        @keyframes corePulse {
          0%,100% { transform: translate(-50%,-50%) scale(1); }
          50% { transform: translate(-50%,-50%) scale(1.04); }
        }

        .portal {
          position: absolute;
          width: clamp(160px, 20vw, 210px);
          height: clamp(160px, 20vw, 210px);
          border-radius: 50%;
          cursor: pointer;
          transition: transform .35s ease, opacity .35s ease, box-shadow .35s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .portal:hover {
          transform: translateY(-4px) scale(1.03);
        }

        .portal.learning { left: 11%; top: 54%; }
        .portal.career { right: 11%; top: 54%; }
        .portal.emotion { left: 50%; top: 73%; transform: translateX(-50%); }

        .portal.emotion:hover {
          transform: translateX(-50%) translateY(-4px) scale(1.03);
        }

        .portal.fade { opacity: .18; }

        .portal-ring,
        .portal-ring-2,
        .portal-core,
        .portal-glow {
          position: absolute;
          border-radius: 50%;
          inset: 0;
          pointer-events: none;
        }

        .portal.learning .portal-glow {
          background: radial-gradient(circle, rgba(253,224,71,.24), rgba(251,191,36,.10), transparent 70%);
          filter: blur(24px);
        }

        .portal.career .portal-glow {
          background: radial-gradient(circle, rgba(147,197,253,.24), rgba(96,165,250,.10), transparent 70%);
          filter: blur(24px);
        }

        .portal.emotion .portal-glow {
          background: radial-gradient(circle, rgba(251,113,133,.22), rgba(244,114,182,.12), transparent 72%);
          filter: blur(26px);
        }

        .portal-ring { inset: 8px; border: 2px solid rgba(255,255,255,.42); opacity: .6; animation: spin 9s linear infinite; }
        .portal-ring-2 { inset: 22px; border: 1px solid rgba(255,255,255,.28); opacity: .45; animation: spinReverse 11s linear infinite; }

        .portal-core {
          inset: 30px;
          overflow: hidden;
          box-shadow: inset 0 10px 25px rgba(255,255,255,.15), 0 10px 30px rgba(120,145,130,.08);
        }

        .portal.learning .portal-core {
          background:
            radial-gradient(circle at 30% 30%, rgba(255,255,255,.35), transparent 22%),
            conic-gradient(from 0deg, #fde68a, #fbbf24, #fdba74, #fcd34d, #fde68a);
          animation: spin 8s linear infinite;
        }

        .portal.career .portal-core {
          background:
            radial-gradient(circle at 30% 30%, rgba(255,255,255,.35), transparent 22%),
            conic-gradient(from 0deg, #bfdbfe, #60a5fa, #93c5fd, #7dd3fc, #bfdbfe);
          animation: spinReverse 9s linear infinite;
        }

        .portal.emotion .portal-core {
          background:
            radial-gradient(circle at 30% 30%, rgba(255,255,255,.35), transparent 22%),
            conic-gradient(from 0deg, #fecdd3, #fb7185, #f472b6, #fda4af, #fecdd3);
          animation: spin 10s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spinReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        .portal-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: white;
          text-shadow: 0 4px 18px rgba(80,100,100,.16);
          padding: 0 12px;
          z-index: 2;
        }

        .portal-emoji { font-size: clamp(28px, 4vw, 38px); line-height: 1; }
        .portal-title { margin-top: 10px; font-size: clamp(14px, 2vw, 16px); font-weight: 800; letter-spacing: .8px; }
        .portal-sub { margin-top: 4px; font-size: clamp(10px, 1.5vw, 11px); opacity: .95; }

        .particle-layer {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .spark {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 999px;
          opacity: .55;
          filter: blur(.4px);
          animation: rise 7s linear infinite;
        }

        .spark.gold { background: rgba(255,223,120,.78); }
        .spark.blue { background: rgba(120,200,255,.84); }
        .spark.rose { background: rgba(255,146,170,.82); }

        @keyframes rise {
          0% { transform: translateY(24px) scale(.8); opacity: 0; }
          20% { opacity: .6; }
          100% { transform: translateY(-150px) scale(1.15); opacity: 0; }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .submenu-wrap {
          max-width: 1180px;
          margin: 22px auto 0;
        }

        .submenu-card {
          border-radius: 30px;
          padding: clamp(18px, 2.5vw, 26px);
          background: linear-gradient(180deg, rgba(255,255,255,.76) 0%, rgba(255,255,255,.56) 100%);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255,255,255,.55);
        }

        .submenu-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }

        .submenu-title {
          margin: 0;
          font-size: clamp(18px, 2.5vw, 22px);
          font-weight: 800;
          color: #28456b;
        }

        .submenu-badge {
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          color: #5c738c;
          background: rgba(255,255,255,.7);
          border: 1px solid rgba(255,255,255,.8);
        }

        .submenu-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .submenu-btn {
          border: none;
          outline: none;
          cursor: pointer;
          width: 100%;
          min-height: 104px;
          border-radius: 22px;
          padding: 0;
          background: transparent;
          text-align: left;
        }

        .submenu-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          min-height: 104px;
          padding: 16px 18px 16px 16px;
          border-radius: 22px;
          background: linear-gradient(180deg, rgba(255,255,255,.95) 0%, rgba(249,252,255,.84) 100%);
          border: 1px solid rgba(222,230,240,.9);
          transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
        }

        .submenu-btn:hover .submenu-item {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(130, 146, 168, 0.10);
          border-color: rgba(200,214,230,.95);
        }

        .submenu-accent {
          position: absolute;
          left: 0;
          top: 12px;
          bottom: 12px;
          width: 6px;
          border-radius: 0 999px 999px 0;
        }

        .submenu-icon {
          flex-shrink: 0;
          width: 54px;
          height: 54px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          background: linear-gradient(135deg, rgba(255,255,255,.95), rgba(246,248,252,.78));
          border: 1px solid rgba(235,240,245,.95);
        }

        .submenu-text { flex: 1; min-width: 0; }
        .submenu-label { font-size: 15px; font-weight: 800; color: #1f3552; line-height: 1.35; margin-bottom: 5px; }
        .submenu-desc { font-size: 13px; line-height: 1.5; color: #6c7f92; }

        .submenu-arrow {
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #7b8ea5;
          background: rgba(245,248,252,.95);
          border: 1px solid rgba(229,236,243,.95);
        }

        @media (max-width: 980px) {
          .map-shell {
            min-height: 980px;
            height: auto;
          }

          .map-inner {
            position: relative;
            min-height: 980px;
          }

          .core {
            top: 18%;
          }

          .portal.learning {
            left: 50%;
            top: 34%;
            transform: translateX(-50%);
          }

          .portal.career {
            right: auto;
            left: 50%;
            top: 56%;
            transform: translateX(-50%);
          }

          .portal.emotion {
            left: 50%;
            top: 78%;
            transform: translateX(-50%);
          }

          .portal.learning:hover,
          .portal.career:hover,
          .portal.emotion:hover {
            transform: translateX(-50%) translateY(-4px) scale(1.03);
          }

          .map-shell.zoom-learning .map-inner,
          .map-shell.zoom-career .map-inner,
          .map-shell.zoom-emotion .map-inner {
            transform: scale(1.02);
            filter: none;
          }

          .submenu-list {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .edu-dashboard-page {
            padding: 12px;
            min-height: auto;
            margin-top: 72px;
          }

          .hero {
            border-radius: 24px;
            margin-bottom: 18px;
          }

          .map-shell {
            border-radius: 26px;
            min-height: 900px;
          }

          .map-inner {
            min-height: 900px;
          }

          .core {
            top: 17%;
          }

          .portal.learning {
            top: 33%;
          }

          .portal.career {
            top: 55%;
          }

          .portal.emotion {
            top: 77%;
          }

          .submenu-card {
            border-radius: 22px;
            padding: 16px;
          }

          .submenu-item {
            min-height: 94px;
            padding: 14px;
            border-radius: 18px;
          }

          .forest-dots,
          .tree,
          .grass {
            display: none;
          }
        }

        @media (max-width: 420px) {
          .start-btn {
            width: 100%;
          }

          .map-shell {
            min-height: 860px;
          }

          .map-inner {
            min-height: 860px;
          }

          .core {
            width: 100px;
            height: 100px;
          }

          .portal {
            width: 148px;
            height: 148px;
          }

          .submenu-badge {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>

      <div className="edu-dashboard-page">
        <div className="forest-bg">
          <div className="forest-glow-1" />
          <div className="forest-glow-2" />
          <div className="forest-glow-3" />
          <div className="forest-dots" />
          <div className="forest-hill" />
          <div className="tree tree-1" />
          <div className="tree tree-2" />
          <div className="tree tree-3" />
          <div className="tree tree-4" />
          <div className="grass grass-1" />
          <div className="grass grass-2" />
          <div className="grass grass-3" />

          {leaves.map((leaf) => (
            <div
              key={leaf.id}
              className="falling-leaf"
              style={{
                left: leaf.left,
                animationDelay: leaf.delay,
                animationDuration: leaf.duration,
              }}
            />
          ))}

          {petals.map((petal) => (
            <div
              key={petal.id}
              className="falling-petal"
              style={{
                left: petal.left,
                animationDelay: petal.delay,
                animationDuration: petal.duration,
              }}
            />
          ))}

          {fireflies.map((firefly) => (
            <div
              key={firefly.id}
              className="firefly"
              style={{
                left: firefly.left,
                top: firefly.top,
                animationDelay: firefly.delay,
              }}
            />
          ))}
        </div>

        <div className="hero">
          <h1>🧭 EduCompass</h1>
          <p className="typing">{typing}</p>
          <button className="start-btn" onClick={() => setStarted(true)}>
            Bắt đầu hành trình
          </button>
        </div>

        {started && (
          <div className="map-section">
            <div
              className={[
                "map-shell",
                selected === "learning" ? "zoom-learning" : "",
                selected === "career" ? "zoom-career" : "",
                selected === "emotion" ? "zoom-emotion" : "",
              ].join(" ")}
            >
              <div className="map-inner">
                <div className="label-top">Chọn hướng phát triển</div>

                <div className="layer-hill-back" />
                <div className="layer-hill-mid" />
                <div className="layer-hill-front" />

                <svg
                  className="map-svg"
                  viewBox="0 0 1200 620"
                  preserveAspectRatio="none"
                >
                  <path className="path-glow" d="M600 170 Q420 245 250 340" />
                  <path className="path-glow" d="M600 170 Q780 245 950 340" />
                  <path className="path-glow" d="M600 170 Q600 300 600 455" />

                  <path className="path-line" d="M600 170 Q420 245 250 340" />
                  <path className="path-line" d="M600 170 Q780 245 950 340" />
                  <path className="path-line" d="M600 170 Q600 300 600 455" />
                </svg>

                <div className="core">
                  <div className="core-icon">🧠</div>
                  <div className="core-label">AI CORE</div>
                </div>

                <div
                  className={`portal learning ${
                    selected && selected !== "learning" ? "fade" : ""
                  }`}
                  onClick={() => handleEnter("learning")}
                >
                  <div className="portal-glow" />
                  <div className="portal-ring" />
                  <div className="portal-ring-2" />
                  <div className="portal-core" />

                  <div className="particle-layer">
                    {learningSparks.map((spark) => (
                      <div
                        key={spark.id}
                        className="spark gold"
                        style={{
                          left: spark.left,
                          bottom: spark.bottom,
                          animationDelay: spark.delay,
                          animationDuration: spark.duration,
                        }}
                      />
                    ))}
                  </div>

                  <div className="portal-content">
                    <div className="portal-emoji">📚</div>
                    <div className="portal-title">COREMIND</div>
                    <div className="portal-sub">Học tập</div>
                  </div>
                </div>

                <div
                  className={`portal career ${
                    selected && selected !== "career" ? "fade" : ""
                  }`}
                  onClick={() => {
                  if (careerTabs.length === 1) {
                    handleNavigate(careerTabs[0].to); // 👈 đi thẳng luôn
                  } else {
                    handleEnter("career");
                  }
                }}
                >
                  <div className="portal-glow" />
                  <div className="portal-ring" />
                  <div className="portal-ring-2" />
                  <div className="portal-core" />

                  <div className="particle-layer">
                    {careerSparks.map((spark) => (
                      <div
                        key={spark.id}
                        className="spark blue"
                        style={{
                          left: spark.left,
                          bottom: spark.bottom,
                          animationDelay: spark.delay,
                          animationDuration: spark.duration,
                        }}
                      />
                    ))}
                  </div>

                  <div className="portal-content">
                    <div className="portal-emoji">💼</div>
                    <div className="portal-title">PATHFINDER</div>
                    <div className="portal-sub">Nghề nghiệp</div>
                  </div>
                </div>

                <div
                  className={`portal emotion ${
                    selected && selected !== "emotion" ? "fade" : ""
                  }`}
                  onClick={() => handleEnter("emotion")}
                >
                  <div className="portal-glow" />
                  <div className="portal-ring" />
                  <div className="portal-ring-2" />
                  <div className="portal-core" />

                  <div className="particle-layer">
                    {emotionSparks.map((spark) => (
                      <div
                        key={spark.id}
                        className="spark rose"
                        style={{
                          left: spark.left,
                          bottom: spark.bottom,
                          animationDelay: spark.delay,
                          animationDuration: spark.duration,
                        }}
                      />
                    ))}
                  </div>

                  <div className="portal-content">
                    <div className="portal-emoji">❤️</div>
                    <div className="portal-title">HEARTCORE</div>
                    <div className="portal-sub">Cảm xúc</div>
                  </div>
                </div>
              </div>
            </div>

            {selected && (
              <div className="submenu-wrap">
                <div className="submenu-card">
                  <div className="submenu-head">
                    <h3 className="submenu-title">
                      {selected === "learning"
                        ? "Khám phá các công cụ học tập"
                        : selected === "career"
                        ? "Khám phá các công cụ nghề nghiệp"
                        : "Khám phá trung tâm cảm xúc"}
                    </h3>

                    <div className="submenu-badge">
                      {selected === "learning"
                        ? "COREMIND"
                        : selected === "career"
                        ? "PATHFINDER"
                        : "HEARTCORE"}
                    </div>
                  </div>

                  <div className="submenu-list">
                    {activeTabs.map((item) => (
                      <button
                        key={item.to}
                        className="submenu-btn"
                        onClick={() => handleNavigate(item.to)}
                      >
                        <div className="submenu-item">
                          <div
                            className="submenu-accent"
                            style={{ background: item.color }}
                          />
                          <div className="submenu-icon">{item.icon}</div>
                          <div className="submenu-text">
                            <div className="submenu-label">{item.label}</div>
                            <div className="submenu-desc">{item.desc}</div>
                          </div>
                          <div className="submenu-arrow">→</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};