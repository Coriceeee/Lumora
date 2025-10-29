import React from "react";

const Toggle = () => {
  const handleToggle = () => {
    const body = document.querySelector("body");
    const isMinimized = body?.getAttribute("data-kt-aside-minimize") === "on";
    if (isMinimized) {
      body?.setAttribute("data-kt-aside-minimize", "off");
    } else {
      body?.setAttribute("data-kt-aside-minimize", "on");
    }
  };

  return (
    <button
      id="kt_explore_toggle"
      onClick={handleToggle}
      className="explore-toggle btn btn-sm explore-btn-toggle shadow-sm position-fixed fw-bolder zindex-2 top-50 px-8 mt-10 end-0 transform-90 fs-5 rounded-top-0"
      title="Đóng / Mở menu"
      data-bs-toggle="tooltip"
      data-bs-placement="right"
      data-bs-trigger="hover"
    >
      <span id="kt_explore_toggle_label">☰</span>
    </button>
  );
};

export { Toggle };
