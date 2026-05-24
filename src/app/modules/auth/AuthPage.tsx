
import React, { useEffect } from "react";
import { Redirect, Route, Switch, Link } from "react-router-dom";
import { Registration } from "./components/Registration";
import { ForgotPassword } from "./components/ForgotPassword";
import { Login } from "./components/Login";
import { toAbsoluteUrl } from "../../../_start/helpers";

export function AuthPage() {
  useEffect(() => {
    document.body.classList.add("bg-light");
    return () => {
      document.body.classList.remove("bg-light");
    };
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100">

      {/* ===== HEADER ===== */}
      <div className="d-flex justify-content-center align-items-center py-8">
        <Link to="/">
          <img
            alt="Logo"
            src={toAbsoluteUrl("/media/logos/logo.png")}
            className="h-70px"
          />
        </Link>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="d-flex flex-column flex-center flex-column-fluid px-5">

        {/* TITLE */}
        <div className="text-center mb-10">
          <h1 className="fw-bolder fs-2x mb-3">
            EduCompass
          </h1>

          <div className="text-muted fw-semibold fs-5">
            Hành trình khám phá bản thân và định hướng tương lai
          </div>
        </div>

        {/* LOGIN CARD */}
        <div className="card shadow-sm w-100 mw-450px">

          <div className="card-body p-10">

            <Switch>
              <Route path="/auth/login" component={Login} />
              <Route path="/auth/registration" component={Registration} />
              <Route path="/auth/forgot-password" component={ForgotPassword} />

              <Redirect exact from="/auth" to="/auth/login" />
              <Redirect to="/auth/login" />
            </Switch>

          </div>

        </div>

        {/* DEMO ACCOUNT */}
        <div className="mt-8 w-100 mw-450px">
          <div
            className="rounded-3 p-6"
            style={{
              background: "#F1F6FF",
              border: "1px solid #D8E4FF",
            }}
          >
            <div className="fw-bold fs-5 mb-4 d-flex align-items-center">
              🚀 TÀI KHOẢN DEMO
              <span className="badge bg-warning text-dark ms-3">
                Trải nghiệm
              </span>
            </div>

            <div className="fs-6 mb-2">
              <b>Email:</b>{" "}
              <span className="text-primary">
                demo@gmail.com
              </span>
            </div>

            <div className="fs-6 mb-3">
              <b>Mật khẩu:</b>{" "}
              <span className="text-primary">
                educompass123
              </span>
            </div>

            <div className="fs-7 text-muted">
              * Sử dụng tài khoản này để trải nghiệm toàn bộ hệ thống AI
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="text-center text-muted fs-7 py-6">
        © {new Date().getFullYear()} EduCompass – Hệ thống định hướng học tập thông minh
      </div>

    </div>
  );
}
