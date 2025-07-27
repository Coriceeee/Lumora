/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { Link } from "react-router-dom";
import { MenuItem } from "./MenuItem";

export function MenuInner() {
  return (
    <>
      <div className="row">
        <div className="col-sm-4">
          <h3 className="fw-bolder mb-5">Dashboards</h3>
          <ul className="menu menu-column menu-fit menu-rounded menu-gray-600 menu-hover-primary menu-active-primary fw-bold fs-6 mb-10">
            <li className="menu-item">
              <MenuItem to="/dashboard" title="Start" />
            </li>
            <li className="menu-item">
              <MenuItem to="/extended" title="Extended" free={true} />
            </li>
            <li className="menu-item">
              <MenuItem to="/light" title="Light" />
            </li>
            <li className="menu-item">
              <MenuItem to="/compact" title="Compact" free={true} />
            </li>
          </ul>
        </div>
        <div className="col-sm-4">
          <h3 className="fw-bolder mb-5">Apps</h3>
          <ul className="menu menu-column menu-fit menu-rounded menu-gray-600 menu-hover-primary menu-active-primary fw-bold fs-6 mb-10">
            <li className="menu-item">
              <MenuItem to="/chat" title="Chat" free={true} />
            </li>
            {/* <li className="menu-item">
              <MenuItem to="/mail" title="Inbox" />
            </li> */}
            <li className="menu-item">
              <MenuItem to="/shop/shop-1" title="Shop 1" free={true} />
            </li>
            <li className="menu-item">
              <MenuItem to="/shop/shop-2" title="Shop 2" free={true} />
            </li>
            <li className="menu-item">
              <MenuItem to="/shop/product/1" title="Shop Product" free={true} />
            </li>
          </ul>
        </div>
        <div className="col-sm-4">
          <h3 className="fw-bolder mb-5">General</h3>
          <ul className="menu menu-column menu-fit menu-rounded menu-gray-600 menu-hover-primary menu-active-primary fw-bold fs-6 mb-10">
            <li className="menu-item">
              <MenuItem to="/general/faq" title="FAQ" />
            </li>
            <li className="menu-item">
              <MenuItem to="/general/pricing" title="Pricing" />
            </li>
            <li className="menu-item">
              <MenuItem to="/general/invoice" title="Invoice" />
            </li>
            <li className="menu-item">
              <MenuItem to="/auth/login" title="Login" />
            </li>
            <li className="menu-item">
              <MenuItem to="/general/wizard" title="Wizard" free={true} />
            </li>
            <li className="menu-item">
              <MenuItem to="/error/404" title="Error" free={true} />
            </li>
          </ul>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-4">
          <h3 className="fw-bolder mb-5">Profile</h3>
          <ul className="menu menu-column menu-fit menu-rounded menu-gray-600 menu-hover-primary menu-active-primary fw-bold fs-6 mb-10">
            <li className="menu-item">
              <Link className="menu-link ps-0 py-2" to="/profile/overview">
                Overview
              </Link>
            </li>
            <li className="menu-item">
              <a href="#" className="menu-link ps-0 py-2" data-kt-page="pro">
                Account
                <span className="badge badge-pro badge-light-danger fw-bold fs-9 px-2 py-1 ms-1">
                  Pro
                </span>
              </a>
            </li>
            <li className="menu-item">
              <a href="#" className="menu-link ps-0 py-2" data-kt-page="pro">
                Settings
                <span className="badge badge-pro badge-light-danger fw-bold fs-9 px-2 py-1 ms-1">
                  Pro
                </span>
              </a>
            </li>
          </ul>
        </div>
        <div className="col-sm-4">
          <h3 className="fw-bolder mb-5">Danh Mục</h3>
          <ul className="menu menu-column menu-fit menu-rounded menu-gray-600 menu-hover-primary menu-active-primary fw-bold fs-6 mb-10">
            <li className="menu-item">
              <Link className="menu-link ps-0 py-2" to="/danh-muc/loai-diem">
                Loại điểm
              </Link>
            </li>
            <li className="menu-item">
              <Link className="menu-link ps-0 py-2" to="/danh-muc/mon-hoc">
                Môn học
              </Link>
            </li>
            <li className="menu-item">
              <Link className="menu-link ps-0 py-2" to="/danh-muc/ky-nang">
                Kỹ năng
              </Link>
            </li>
            <li className="menu-item">
  <Link className="menu-link ps-0 py-2" to="/danh-muc/chung-chi">
    Chứng chỉ
  </Link>
</li>
<li className="menu-item">
  <Link className="menu-link ps-0 py-2" to="/danh-muc/khao-sat">
    Khảo sát
  </Link>
</li>
          </ul>
        </div>
      </div>
    </>
  );
}
