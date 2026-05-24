import React from "react";
import { AsideMenuMain } from "./AsideMenuMain";

export function AsideDefault() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: "360px",
        height: "100vh",
        zIndex: 999,
      }}
    >
      <AsideMenuMain />
    </div>
  );
}