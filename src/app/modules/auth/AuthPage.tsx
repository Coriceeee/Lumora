import React, { useEffect } from "react";
import { Redirect, Route, Switch, Link } from "react-router-dom";
import { Registration } from "./components/Registration";
import { ForgotPassword } from "./components/ForgotPassword";
import { Login } from "./components/Login";
import { toAbsoluteUrl } from "../../../_start/helpers";

export function AuthPage() {
  useEffect(() => {
    document.body.classList.add("bg-white");
    return () => {
      document.body.classList.remove("bg-white");
    };
  }, []);

  return (
    <div className="d-flex flex-column flex-root">
      <div
        className="d-flex flex-column flex-lg-row flex-column-fluid"
        id="kt_login"
      >
        {/* ================= ASIDE ================= */}
        <div className="d-flex flex-column flex-lg-row-auto bg-primary w-lg-600px pt-15 pt-lg-0">
          {/* Logo + intro */}
          <div className="d-flex flex-column-auto flex-column pt-lg-40 pt-15 text-center">
            <Link to="/" className="mb-6">
              <img
                alt="Logo"
                src={toAbsoluteUrl("/media/logos/logo.png")}
                className="h-75px"
              />
            </Link>

            <h3 className="fw-bolder fs-2x text-white lh-lg px-5">
              Vũ trụ AI giáo dục toàn diện
              <br />
              <span className="fw-semibold fs-4 d-block mt-3">
  “Ở Lumora, hành trình bắt đầu khi bạn
  <br />
  đủ can đảm là chính mình.”
</span>

            </h3>

            {/* ===== DEMO ACCOUNT HIGHLIGHT ===== */}
            <div className="mt-8 px-6">
              <div
                className="rounded-3 p-5 text-start"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  backdropFilter: "blur(6px)",
                }}
              >
                <div className="fw-bold fs-5 text-white mb-3 d-flex align-items-center">
                  🚀 TÀI KHOẢN DEMO
                  <span className="badge bg-warning text-dark ms-3">
                    Trải nghiệm ngay
                  </span>
                </div>

                <div className="text-white fs-6 mb-2">
                  <b>Email:</b>{" "}
                  <span className="text-warning">demo@lumora.ai</span>
                </div>

                <div className="text-white fs-6 mb-3">
                  <b>Mật khẩu:</b>{" "}
                  <span className="text-warning">Lumora@123</span>
                </div>

                <div className="text-white fs-7 opacity-75">
                  * Dùng để trải nghiệm đầy đủ các tính năng AI của Lumora
                </div>
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div
            className="d-flex flex-row-fluid bgi-size-contain bgi-no-repeat 
                       bgi-position-y-bottom bgi-position-x-center min-h-350px"
            style={{
              backgroundImage: `url(${toAbsoluteUrl(
                "/media/illustrations/winner.png"
              )})`,
            }}
          />
        </div>

        {/* ================= CONTENT ================= */}
        <div className="login-content flex-lg-row-fluid d-flex flex-column justify-content-center position-relative overflow-hidden py-20 px-10 p-lg-7 mx-auto mw-450px w-100">
          <div className="d-flex flex-column-fluid flex-center py-10">
            <Switch>
              <Route path="/auth/login" component={Login} />
              <Route path="/auth/registration" component={Registration} />
              <Route path="/auth/forgot-password" component={ForgotPassword} />

              <Redirect exact from="/auth" to="/auth/login" />
              <Redirect to="/auth/login" />
            </Switch>
          </div>
        </div>
      </div>
    </div>
  );
}
