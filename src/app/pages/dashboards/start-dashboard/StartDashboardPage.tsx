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

export const StartDashboardPage: React.FC = () => {
  const userId = "user_fake_id_123456"; // test id (thay bằng động nếu cần)
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
      loadLearningDashboards()
    }, []);
  return (
    <>
      {/* begin::Row */}
      <div className="row g-0 g-xl-5 g-xxl-8">
        <div className="col-xl-4">
          <EngageWidget5 className="card-stretch mb-5 mb-xxl-8">
            {/* begin::Action */}
            <div className="text-center pt-7">
              <Link
                to="/vireya/ket-qua-hoc-tap" // đổi thành link bạn muốn
                className="btn btn-primary fw-bolder fs-6 px-7 py-3"
                // Nếu vẫn cần mở modal khi click link, bạn có thể thêm onClick ở đây, nhưng sẽ vừa chuyển trang vừa mở modal không hợp lý
                // onClick={() => setShow(true)}
              >
                Cập nhật
              </Link>
            </div>
            {/* end::Action */}
          </EngageWidget5>
        </div>

        <div className="col-xl-8">
          <CareersCard careers={selectedCareerDashboard?.careers || [] } />
        </div>
      </div>
      {/* end::Row */}

      {/* begin::Row */}
      <div className="row g-0 g-xl-5 g-xxl-8">
        <div className="col-xl-4">
          <ListsWidget1 className="card-stretch mb-5 mb-xxl-8" />
        </div>

        <div className="col-xl-8">
          <KeySubjectsCard  selectedDashboard={selectedLearningDashboard} />
        </div>
      </div>
      {/* end::Row */}

      {/* begin::Modals */}
      <CreateAppModal show={show} handleClose={() => setShow(false)} />
      {/* end::Modals */}
    </>
  );
};
