/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  EngageWidget5,
  ListsWidget1,
} from "../../../../_start/partials/widgets";

import { CreateAppModal } from "../_modals/create-app-stepper/CreateAppModal";

import CareersCard from "./CareersCard";
import KeySubjectsCard from "./KeySubjectsCard";

import { CareerDashboard } from "../../../../types/CareerDashboard";
import { LearningDashboard } from "../../../../types/LearningDashboard";

import {
  getCareerDashboardsByUser,
} from "../../../../services/careerDashboardService";

import {
  getLearningDashboardsByUser,
} from "../../../../services/learningDashboardService";

import { useFirebaseUser } from "../../../hooks/useFirebaseUser";
import LumoraOnboarding from "../../onboarding/LumoraOnboarding";

export const StartDashboardPage: React.FC = () => {
  // ================= USER =================
  const { userId } = useFirebaseUser();

  // ================= MODAL =================
  const [show, setShow] = useState(false);

  // ================= ONBOARDING =================
  const [showOnboarding, setShowOnboarding] = useState(false);

  // ================= DASHBOARD DATA =================
  const [selectedCareerDashboard, setSelectedCareerDashboard] =
    useState<CareerDashboard | null>(null);

  const [selectedLearningDashboard, setSelectedLearningDashboard] =
    useState<LearningDashboard | null>(null);

  // ================= ONBOARDING FLAGS =================
  const skipForever =
    localStorage.getItem("lumora_skip_onboarding") === "true";

  const isFirstTime =
    localStorage.getItem("lumora_has_onboarded") !== "true";

  // ================= ONBOARDING LOGIC =================
  useEffect(() => {
    // Nếu user đã chọn bỏ qua vĩnh viễn → không hiện
    if (skipForever) return;

    // Nếu trong phiên này đã hiện → không hiện lại
    const seenThisSession = sessionStorage.getItem(
      "lumora_onboarding_seen"
    );
    if (seenThisSession) return;

    // Ngược lại → hiện onboarding
    setShowOnboarding(true);
  }, [skipForever]);

  // ================= KHI HOÀN THÀNH ONBOARDING =================
  const closeOnboarding = () => {
    // Đánh dấu đã xem trong phiên
    sessionStorage.setItem("lumora_onboarding_seen", "true");

    // Đánh dấu đã từng onboarding (để lần sau cho phép bỏ qua)
    localStorage.setItem("lumora_has_onboarded", "true");

    setShowOnboarding(false);
  };

  // ================= KHI BỎ QUA VĨNH VIỄN =================
  const skipOnboardingForever = () => {
    localStorage.setItem("lumora_skip_onboarding", "true");
    sessionStorage.setItem("lumora_onboarding_seen", "true");
    setShowOnboarding(false);
  };

  // ================= LOAD CAREER DASHBOARD =================
  const loadCareerDashboards = async () => {
    if (!userId) {
      console.warn(
        "⚠️ getCareerDashboardsByUser bị bỏ qua do chưa có userId"
      );
      return;
    }

    const data = await getCareerDashboardsByUser(userId);
    const sorted = data.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );

    if (sorted.length > 0) {
      setSelectedCareerDashboard(sorted[0]);
    }
  };

  // ================= LOAD LEARNING DASHBOARD =================
  const loadLearningDashboards = async () => {
    if (!userId) {
      console.warn(
        "⚠️ getLearningDashboardsByUser bị bỏ qua do chưa có userId"
      );
      return;
    }

    const data = await getLearningDashboardsByUser(userId);
    if (data.length > 0) {
      setSelectedLearningDashboard(data[0]);
    }
  };

  // ================= TRIGGER LOAD =================
  useEffect(() => {
    if (!userId) return;
    loadCareerDashboards();
    loadLearningDashboards();
  }, [userId]);

  // ================= RENDER =================
  return (
    <>
      {/* 🌌 ONBOARDING – BLOCK WEB */}
      <LumoraOnboarding
        open={showOnboarding}
        onFinish={closeOnboarding}
        onSkipForever={skipOnboardingForever}
        isFirstTime={isFirstTime}
      />

      {/* ================= ROW 1 – NGHỀ NGHIỆP ================= */}
      <div className="row g-0 g-xl-5 g-xxl-8">
        <div className="col-xl-4">
          <EngageWidget5 className="card-stretch mb-5 mb-xxl-8">
            <div className="text-center pt-7">
              <Link
                id="menu-vireya"
                to="/vireya/ket-qua-hoc-tap"
                className="btn btn-primary fw-bolder fs-6 px-7 py-3"
              >
                Cập nhật
              </Link>
            </div>
          </EngageWidget5>
        </div>

        <div id="menu-neovana" className="col-xl-8">
          <CareersCard
            careers={selectedCareerDashboard?.careers || []}
          />
        </div>
      </div>

      {/* ================= ROW 2 – MÔN HỌC ================= */}
      <div className="row g-0 g-xl-5 g-xxl-8 mt-5">
        <div className="col-xl-4">
          <ListsWidget1 className="card-stretch mb-5 mb-xxl-8" />
        </div>

        <div id="menu-zenora" className="col-xl-8">
          <KeySubjectsCard
            selectedDashboard={selectedLearningDashboard}
          />
        </div>
      </div>

      {/* ROBOKI (placeholder highlight) */}
      <div id="menu-roboki" />

      {/* ================= MODAL ================= */}
      <CreateAppModal
        show={show}
        handleClose={() => setShow(false)}
      />
    </>
  );
};
