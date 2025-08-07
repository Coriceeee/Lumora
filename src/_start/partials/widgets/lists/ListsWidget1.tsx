/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";
import { KTSVG } from "../../../helpers";
import { Dropdown1 } from "../../content/dropdown/Dropdown1";
import { getLearningDashboardsByUser } from "../../../../services/learningDashboardService";
import { LearningDashboard } from "../../../../types/LearningDashboard";

type Props = {
  className: string;
};

const ListsWidget1: React.FC<Props> = ({ className }) => {
  const userId = "user_fake_id_123456";
  const [dashboards, setDashboards] = useState<LearningDashboard[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getLearningDashboardsByUser(userId);
      setDashboards(data);
    };
    fetchData();
  }, [userId]);

  return (
    <div className={`card ${className}`}>
      {/* begin::Header */}
      <div className="card-header align-items-center border-0 mt-5">
        <h3 className="card-title align-items-start flex-column">
          <span className="fw-bolder text-dark fs-3">Timeline</span>
          <span className="text-muted mt-2 fw-bold fs-6">
            Updates & notifications
          </span>
        </h3>
        <div className="card-toolbar">
          <button
            type="button"
            className="btn btn-sm btn-icon btn-color-primary btn-active-light-primary"
            data-kt-menu-trigger="click"
            data-kt-menu-placement="bottom-end"
            data-kt-menu-flip="top-end"
          >
            <KTSVG
              path="/media/icons/duotone/Layout/Layout-4-blocks-2.svg"
              className="svg-icon-1"
            />
          </button>
          <Dropdown1 />
        </div>
      </div>
      {/* end::Header */}

      {/* begin::Body */}
      <div className="card-body pt-3">
        <div className="timeline-label">
          {dashboards.map((dashboard) => (
            <div className="timeline-item" key={dashboard.id}>
              <div className="timeline-label fw-bolder text-gray-800 fs-6">
                {dashboard.createdAt?.toDate
                  ? new Date(dashboard.createdAt.toDate()).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                    })
                  : "N/A"}
              </div>

              <div className="timeline-badge">
                <i className="fa fa-genderless text-success fs-1"></i>
              </div>

              <div className="timeline-content d-flex">
                <span className="fw-bolder text-gray-800 ps-3">
                  {dashboard.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { ListsWidget1 };
