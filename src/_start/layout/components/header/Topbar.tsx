import React, { useState } from "react";
import { KTSVG } from "../../../helpers";
import {
  HeaderNotificationsMenu,
  SearchModal,
  HeaderUserMenu,
  InboxCompose,
} from "../../../partials";
import { useTheme } from "../../core";
import { useHistory } from "react-router-dom";


export function Topbar() {
  const { config } = useTheme();
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showInboxComposeModal, setShowInboxComposeModal] = useState(false);
  const history = useHistory();
  const navigate = (path: string): void => history.push(path);

  return (
    <>
    {/* begin::Message */}
<div className="d-flex align-items-center ms-1 ms-lg-6">

  {/* Giới thiệu */}
  <div
    className="me-4"
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      cursor: "pointer",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.querySelector("i")!.style.color = "#009ef7";
      e.currentTarget.querySelector("span")!.style.color = "#009ef7";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.querySelector("i")!.style.color = "#3f4254";
      e.currentTarget.querySelector("span")!.style.color = "#7e8299";
    }}
    onClick={() => navigate("/About")}
  >
    <button className="btn btn-icon btn-sm btn-active-bg-accent">
      <i
        className="fa-solid fa-circle-info"
        style={{ fontSize: 18, color: "#3f4254" }}
      ></i>
    </button>
    <span style={{ fontSize: 11, marginTop: 4, color: "#7e8299" }}>
      Giới thiệu
    </span>
  </div>

  {/* Liên hệ */}
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      cursor: "pointer",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.querySelector("i")!.style.color = "#009ef7";
      e.currentTarget.querySelector("span")!.style.color = "#009ef7";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.querySelector("i")!.style.color = "#3f4254";
      e.currentTarget.querySelector("span")!.style.color = "#7e8299";
    }}
    onClick={() => navigate("/Contact")}
  >
    <button className="btn btn-icon btn-sm btn-active-bg-accent">
      <i
        className="fa-solid fa-phone"
        style={{ fontSize: 18, color: "#3f4254" }}
      ></i>
    </button>
    <span style={{ fontSize: 11, marginTop: 4, color: "#7e8299" }}>
      Liên hệ
    </span>
  </div>

</div>
{/* end::Message */}


      {/* begin::User */}
      <div className="ms-1 ms-lg-6">
        {/* begin::Toggle */}
        <div
          className="btn btn-icon btn-sm btn-active-bg-accent"
          data-kt-menu-trigger="click"
          data-kt-menu-placement="bottom-end"
        >
          <KTSVG
            path="/media/icons/duotone/General/User.svg"
            className="svg-icon-1 svg-icon-dark"
          />
        </div>
        <HeaderUserMenu />
        {/* end::Toggle */}
      </div>
      {/* end::User */}

     
      {config.aside.display && (
        <button
          className="btn btn-icon btn-sm btn-active-bg-accent d-lg-none ms-1 ms-lg-6"
          id="kt_aside_toggler"
        >
          <KTSVG
            path="/media/icons/duotone/Text/Menu.svg"
            className="svg-icon-1 svg-icon-dark"
          />
        </button>
      )}
      {/* end::Aside Toggler */}

      {/* begin::Sidebar Toggler */}
      {config.sidebar.display && (
        <button
          className="btn btn-icon btn-sm btn-active-bg-accent d-lg-none ms-1 ms-lg-6"
          id="kt_sidebar_toggler"
        >
          <KTSVG
            path="/media/icons/duotone/Text/Menu.svg"
            className="svg-icon-1 svg-icon-dark"
          />
        </button>
      )}
      {/* end::Sidebar Toggler */}
    </>
  );
}
