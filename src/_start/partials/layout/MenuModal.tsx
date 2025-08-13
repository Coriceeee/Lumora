/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useRef } from "react";
import { Modal } from "react-bootstrap-v5";
import { Link, useLocation } from "react-router-dom";
import { KTSVG, toAbsoluteUrl } from "../../helpers";

type Props = {
  show: boolean;
  handleClose: () => void;
};

const MenuModal: React.FC<Props> = ({ show, handleClose, children }) => {
  const location = useLocation();
  const isFirstRef = useRef(true);
  useEffect(() => {
    if (isFirstRef.current) {
      isFirstRef.current = false;
    } else {
      handleClose();
    }
  }, [location]);

  return (
    <Modal
      className="bg-white"
      id="kt_mega_menu_modal"
      aria-hidden="true"
      tabIndex={-1}
      dialogClassName="modal-fullscreen"
      contentClassName="shadow-none"
      show={show}
    >
      <div className="container">
        <div className="modal-header d-flex align-items-center justify-content-between border-0">
          <div className="d-flex align-items-center">
            {/* begin::Logo */}
            <Link to="/">
              <img
                alt="logo"
                className="h-30px"
                src={toAbsoluteUrl("/media/logos/logo.png")}
              />
            </Link>
            {/* end::Logo */}
          </div>

          {/* begin::Close */}
          <div
            className="btn btn-icon btn-sm btn-light-primary ms-2"
            onClick={handleClose}
            role="button"
            tabIndex={0}
            aria-label="Close menu modal"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleClose();
            }}
          >
            <KTSVG
              path="/media/icons/duotone/Navigation/Close.svg"
              className="svg-icon-2"
            />
          </div>
          {/* end::Close */}
        </div>
        <div className="modal-body">
          {/* begin::Row */}
          <div className="row py-10 g-5">
            {/* begin::Column */}
            <div className="col-lg-6 pe-lg-25">{children}</div>
            {/* end::Column */}

            {/* begin::Column */}
            <div className="col-lg-6">
              <h3 className="fw-bolder mb-8">Danh Mục</h3>

              {/* begin::Row */}
              <div className="row g-5">
                <div className="col-sm-4">
                  <Link
                    to="/danh-muc/loai-diem"
                    className="card card-custom bg-light-success hoverable min-h-125px shadow-none mb-5 text-decoration-none"
                  >
                    <div className="card-body d-flex flex-column flex-center">
                      <h3 className="fs-3 mb-2 text-dark fw-bolder">
                        Loại điểm
                      </h3>
                    </div>
                  </Link>
                </div>
                <div className="col-sm-4">
                  <Link
                    to="/danh-muc/mon-hoc"
                    className="card card-custom bg-light-danger hoverable min-h-125px shadow-none mb-5 text-decoration-none"
                  >
                    <div className="card-body d-flex flex-column flex-center text-center">
                      <h3 className="fs-3 mb-2 text-dark fw-bolder">Môn học</h3>
                    </div>
                  </Link>
                </div>
                <div className="col-sm-4">
                  <Link
                    to="/danh-muc/ky-nang"
                    className="card card-custom bg-light-warning hoverable min-h-125px shadow-none mb-5 text-decoration-none"
                  >
                    <div className="card-body d-flex flex-column flex-center text-center">
                      <h3 className="fs-3 mb-2 text-dark text-hover-primary fw-bolder">
                        Kỹ năng
                      </h3>
                    </div>
                  </Link>
                </div>
              </div>
              {/* end::Row */}

              {/* begin::Row */}
              <div className="row g-5">
                <div className="col-sm-8">
                  <Link
                    to="/danh-muc/khao-sat"
                    className="card card-custom bg-light-primary hoverable min-h-125px shadow-none mb-5 text-decoration-none"
                  >
                    <div className="card-body d-flex flex-column flex-center text-center">
                      <h3 className="fs-3 mb-2 text-dark fw-bolder">
                        Khảo sát
                      </h3>
                    </div>
                  </Link>

                  {/* begin::Row */}
                  <div className="row g-5">
                    <div className="col-sm-6">
                      <Link
                        to="/danh-muc/chung-chi"
                        className="card card-custom bg-light-warning hoverable shadow-none min-h-125px mb-5 text-decoration-none"
                      >
                        <div className="card-body d-flex flex-column flex-center text-center">
                          <h3 className="fs-3 mb-2 text-dark fw-bolder">
                            Chứng chỉ
                          </h3>
                          <p className="mb-0 text-gray-600">6 Month Free</p>
                        </div>
                      </Link>
                    </div>
                    <div className="col-sm-6">
                      <div
                        className="card card-custom bg-light-success hoverable shadow-none min-h-125px mb-5"
                        role="region"
                        aria-label="Installation info"
                      >
                        <div className="card-body d-flex flex-column flex-center text-center">
                          <h3 className="fs-3 mb-2 text-dark fw-bolder">
                            Installation
                          </h3>
                          <p className="mb-0 text-gray-600">
                            $0.99 Per Machine
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* end::Row */}
                </div>
                <div className="col-sm-4">
                  <div
                    className="card card-custom card-stretch mb-5 bg-light-info hoverable shadow-none min-h-250px"
                    role="region"
                    aria-label="Quick start info"
                  >
                    <div className="card-body d-flex flex-column p-0">
                      <div className="d-flex flex-column flex-center text-center px-5 pt-10">
                        <h3 className="fs-3 mb-2 text-dark fw-bolder">
                          Quick Start
                        </h3>
                        <p className="mb-0 text-gray-600">
                          Single Click Import
                        </p>
                      </div>
                      <div
                        className="flex-grow-1 bgi-no-repeat bgi-size-contain bgi-position-x-center bgi-position-y-bottom card-rounded-bottom"
                        style={{
                          backgroundImage: `url('${toAbsoluteUrl(
                            "/media/illustrations/terms-1.png"
                          )}')`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* end::Row */}
            </div>
            {/* end::Column */}
          </div>
          {/* end::Row */}
        </div>
      </div>
    </Modal>
  );
};

export { MenuModal };
