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

export const StartDashboardPage: React.FC = () => {
  const { userId } = useFirebaseUser();   // ⭐ LẤY userId giống trang Định hướng
  const [show, setShow] = useState(false);

  const [selectedCareerDashboard, setSelectedCareerDashboard] =
    useState<CareerDashboard | null>(null);

  const [selectedLearningDashboard, setSelectedLearningDashboard] =
    useState<LearningDashboard | null>(null);

  // ⭐ Load Career Dashboard
  const loadCareerDashboards = async () => {
    if (!userId) {
      console.warn("⚠️ getCareerDashboardsByUser bị bỏ qua do chưa có userId");
      return;
    }

    const data = await getCareerDashboardsByUser(userId);
    if (data && data.length > 0) setSelectedCareerDashboard(data[0]);
  };

  // ⭐ Load Learning Dashboard
  const loadLearningDashboards = async () => {
    if (!userId) {
      console.warn("⚠️ getLearningDashboardsByUser bị bỏ qua do chưa có userId");
      return;
    }

    const data = await getLearningDashboardsByUser(userId);
    if (data && data.length > 0) setSelectedLearningDashboard(data[0]);
  };

  // ⭐ Trigger load khi userId sẵn sàng
  useEffect(() => {
    if (!userId) return;
    loadCareerDashboards();
    loadLearningDashboards();
  }, [userId]);

  return (
    <>
      {/* Row 1 - Nghề nghiệp gợi ý */}
      <div className="row g-0 g-xl-5 g-xxl-8">
        <div className="col-xl-4">
          <EngageWidget5 className="card-stretch mb-5 mb-xxl-8">
            <div className="text-center pt-7">
              <Link
                to="/vireya/ket-qua-hoc-tap"
                className="btn btn-primary fw-bolder fs-6 px-7 py-3"
              >
                Cập nhật
              </Link>
            </div>
          </EngageWidget5>
        </div>

        <div className="col-xl-8">
          <CareersCard careers={selectedCareerDashboard?.careers || []} />
        </div>
      </div>

      {/* Row 2 - Các môn chủ chốt */}
      <div className="row g-0 g-xl-5 g-xxl-8 mt-5">
        <div className="col-xl-4">
          <ListsWidget1 className="card-stretch mb-5 mb-xxl-8" />
        </div>

        <div className="col-xl-8">
          <KeySubjectsCard selectedDashboard={selectedLearningDashboard} />
        </div>
      </div>

      {/* Modal */}
      <CreateAppModal show={show} handleClose={() => setShow(false)} />
    </>
  );
};
