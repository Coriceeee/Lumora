import React from "react";
import { useHistory } from "react-router-dom";

export default function RobokiLinks() {
  const history = useHistory();

  const tests = [
    {
      name: "Khảo sát tư duy phản biện",
      id: "67ddbd59923d0072befa1373",
      link: "https://roboki.vn/g/67ddbd59923d0072befa1373",
      color: "#20c997",
    },
    {
      name: "Kỹ năng giao tiếp & làm việc nhóm",
      id: "67ddbd59923d0072befa137b",
      link: "https://roboki.vn/g/67ddbd59923d0072befa137b",
      color: "#0dcaf0",
    },
    {
      name: "Chỉ số kiên trì (GRIT)",
      id: "67ddbd59923d0072befa1381",
      link: "https://roboki.vn/g/67ddbd59923d0072befa1381",
      color: "#fd7e14",
    },
    {
      name: "Động lực học tập",
      id: "67ddbd59923d0072befa138",
      link: "https://roboki.vn/g/67ddbd59923d0072befa138",
      color: "#6f42c1",
    },
    {
      name: "IQ Test",
      id: "67ddbd59923d0072befa1387",
      link: "https://roboki.vn/g/67ddbd59923d0072befa1387",
      color: "#ff6b81",
    },
    {
      name: "Kiểm tra EQ (Chỉ số cảm xúc)",
      id: "67ddbd59923d0072befa1387",
      link: "https://roboki.vn/g/67ddbd59923d0072befa1387",
      color: "#845ef7",
    },
  ];

  return (
    <div
      className="container py-5"
      style={{ position: "relative", minHeight: "600px" }}
    >
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2
          className="fw-extrabold text-primary"
          style={{
            fontSize: "2.4rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            userSelect: "none",
          }}
        >
          📊 Đánh Giá Năng Lực
        </h2>
      </div>

      <div className="row row-cols-1 row-cols-md-3 g-4">
        {tests.map((t, i) => (
          <div key={i} className="col">
            <div
              className="card h-100 shadow"
              style={{
                borderRadius: 18,
                border: "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.3s ease",
                backgroundColor: "#f8f9fa",
              }}
              onClick={() => history.push(`/roboki/embed/${t.id}`, { link: t.link })}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.transform = "translateY(-6px)";
                el.style.borderColor = t.color;
                el.style.boxShadow = `0 0 20px ${t.color}`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.transform = "none";
                el.style.borderColor = "transparent";
                el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
              }}
            >
              <div className="card-body">
                <h4 className="fw-bold mb-3" style={{ color: t.color }}>
                  {t.name}
                </h4>
                <p className="text-muted">
                  Nhấn để thực hiện bài đánh giá trong Lumora →
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <img
        src="/favicon (1).ico"
        alt="Roboki Mascot"
        style={{
          position: "absolute",
          bottom: "0px",
          right: "-35px",
          width: "110px",
          height: "auto",
          zIndex: 20,
          userSelect: "none",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
