/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  EngageWidget5,
  ListsWidget1,
  TablesWidget2,
} from "../../../../_start/partials/widgets";
import { CreateAppModal } from "../_modals/create-app-stepper/CreateAppModal";
import CareersCard from "./CareersCard";
import { CareerDashboard } from "../../../../types/CareerDashboard";
import { getCareerDashboardsByUser } from "../../../../services/careerDashboardService";
import KeySubjectsCard from "./KeySubjectsCard";
import { LearningDashboard } from "../../../../types/LearningDashboard";
import { getLearningDashboardsByUser } from "../../../../services/learningDashboardService";
import { getAuth } from "firebase/auth";

export const StartDashboardPage: React.FC = () => {
 const userId = getAuth().currentUser?.uid || "";
  const [show, setShow] = useState(false);
  const [selectedCareerDashboard, setSelectedCareerDashboard] = useState<CareerDashboard | null>(null);
  const [selectedLearningDashboard, setSelectedLearningDashboard] = useState<LearningDashboard | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadCareerDashboards = async () => {
    const data = await getCareerDashboardsByUser();
    if (data && data.length > 0) setSelectedCareerDashboard(data[0]);
  };

  const loadLearningDashboards = async () => {
    const data = await getLearningDashboardsByUser(userId);
    if (data && data.length > 0) setSelectedLearningDashboard(data[0]);
  };

  useEffect(() => {
    loadCareerDashboards();
    loadLearningDashboards();
  }, []);

  return (
    <>
      {/* begin::Row 1 - Nghề nghiệp gợi ý */}
      <div className="row g-0 g-xl-5 g-xxl-8">
        <div className="col-xl-4">
          <EngageWidget5 className="card-stretch mb-5 mb-xxl-8">
            {/* begin::Action */}
            <div className="text-center pt-7">
              <Link
                to="/vireya/ket-qua-hoc-tap"
                className="btn btn-primary fw-bolder fs-6 px-7 py-3"
              >
                Cập nhật
              </Link>
            </div>
            {/* end::Action */}
          </EngageWidget5>
        </div>

        <div className="col-xl-8">
          <CareersCard careers={selectedCareerDashboard?.careers || []} />
        </div>
      </div>
      {/* end::Row 1 */}

      {/* begin::Row 2 - Các môn chủ chốt */}
      <div className="row g-0 g-xl-5 g-xxl-8 mt-5"> {/* 👈 thêm khoảng cách giữa 2 tab */}
        <div className="col-xl-4">
          <ListsWidget1 className="card-stretch mb-5 mb-xxl-8" />
        </div>

        <div className="col-xl-8">
          <KeySubjectsCard selectedDashboard={selectedLearningDashboard} />
        </div>
      </div>
      {/* end::Row 2 */}

      {/* begin::Modals */}
      <CreateAppModal show={show} handleClose={() => setShow(false)} />
      {/* end::Modals */}
    </>
  );
};
