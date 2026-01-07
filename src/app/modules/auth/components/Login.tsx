import React, { useState } from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import * as auth from "../redux/AuthRedux";
import { toAbsoluteUrl } from "../../../../_start/helpers";

// Firebase
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  getIdToken,
} from "firebase/auth";
import { authFb, db, googleProvider } from "../../../../firebase/firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Email không hợp lệ")
    .min(3, "Tối thiểu 3 ký tự")
    .max(50, "Tối đa 50 ký tự")
    .required("Vui lòng nhập email"),
  password: Yup.string()
    .min(3, "Tối thiểu 3 ký tự")
    .max(50, "Tối đa 50 ký tự")
    .required("Vui lòng nhập mật khẩu"),
});

const initialValues = {
  email: "",
  password: "",
};

async function ensureUserInFirestore(user: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId?: string;
}) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  const baseProfile = {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? "",
    photoURL: user.photoURL ?? "",
    providerId: user.providerId ?? "password",
    updatedAt: serverTimestamp(),
  };

  if (!snap.exists()) {
    await setDoc(ref, {
      ...baseProfile,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      role: "user",
      status: "active",
    });
  } else {
    await updateDoc(ref, {
      ...baseProfile,
      lastLoginAt: serverTimestamp(),
    });
  }

  return { ...baseProfile };
}

export function Login() {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setStatus(undefined);
      setLoading(true);

      try {
        const cred = await signInWithEmailAndPassword(
          authFb,
          values.email,
          values.password
        );
        const user = cred.user;

        await ensureUserInFirestore({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          providerId: user.providerData?.[0]?.providerId ?? "password",
        });

        const idToken = await getIdToken(user, true);

        setLoading(false);
        dispatch(auth.actions.login(idToken));
      } catch (err) {
        console.error(err);
        setLoading(false);
        setSubmitting(false);
        setStatus("Thông tin đăng nhập không chính xác");
      }
    },
  });

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const cred = await signInWithPopup(authFb, googleProvider);
      const user = cred.user;

      await ensureUserInFirestore({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        providerId: user.providerData?.[0]?.providerId ?? "google.com",
      });

      const idToken = await getIdToken(user, true);

      setLoading(false);
      dispatch(auth.actions.login(idToken));
    } catch (err) {
      console.error(err);
      setLoading(false);
      formik.setStatus("Không thể đăng nhập bằng Google");
    }
  };

  return (
    <form
      className="form w-100"
      onSubmit={formik.handleSubmit}
      noValidate
      id="kt_login_signin_form"
    >
      {/* Tiêu đề */}
      <div className="pb-lg-15">
        <h3 className="fw-bolder text-dark display-6">
          Chào mừng bạn đến với Lumora
        </h3>
        <div className="text-muted fw-bold fs-3">
          Chưa có tài khoản?{" "}
          <Link
            to="/auth/registration"
            className="text-primary fw-bolder"
            id="kt_login_signin_form_singup_button"
          >
            Tạo tài khoản
          </Link>
        </div>
      </div>

      {/* Thông báo */}
      {formik.status ? (
        <div className="mb-lg-15 alert alert-danger">
          <div className="alert-text font-weight-bold">{formik.status}</div>
        </div>
      ) : (
        <div className="mb-lg-15 alert alert-info">
          <div className="alert-text">Bạn có thể đăng nhập bằng Email/Mật khẩu hoặc Google.</div>
        </div>
      )}

      {/* Email */}
      <div className="v-row mb-10 fv-plugins-icon-container">
        <label className="form-label fs-6 fw-bolder text-dark">Email</label>
        <input
          placeholder="Nhập email của bạn"
          {...formik.getFieldProps("email")}
          className={clsx(
            "form-control form-control-lg form-control-solid",
            { "is-invalid": formik.touched.email && formik.errors.email },
            { "is-valid": formik.touched.email && !formik.errors.email }
          )}
          type="email"
          name="email"
          autoComplete="off"
        />
        {formik.touched.email && formik.errors.email && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block">{formik.errors.email}</div>
          </div>
        )}
      </div>

      {/* Mật khẩu */}
      <div className="fv-row mb-10 fv-plugins-icon-container">
        <div className="d-flex justify-content-between mt-n5">
          <label className="form-label fs-6 fw-bolder text-dark pt-5">
            Mật khẩu
          </label>
          <Link
            to="/auth/forgot-password"
            className="text-primary fs-6 fw-bolder text-hover-primary pt-5"
            id="kt_login_signin_form_password_reset_button"
          >
            Quên mật khẩu?
          </Link>
        </div>
        <input
          type="password"
          autoComplete="off"
          {...formik.getFieldProps("password")}
          className={clsx(
            "form-control form-control-lg form-control-solid",
            {
              "is-invalid": formik.touched.password && formik.errors.password,
            },
            { "is-valid": formik.touched.password && !formik.errors.password }
          )}
        />
        {formik.touched.password && formik.errors.password && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block">{formik.errors.password}</div>
          </div>
        )}
      </div>

      {/* Nút hành động */}
      <div className="pb-lg-0 pb-5">
        <button
          type="submit"
          id="kt_login_signin_form_submit_button"
          className="btn btn-primary fw-bolder fs-6 px-8 py-4 my-3 me-3"
          disabled={formik.isSubmitting || !formik.isValid || loading}
        >
          {!loading && <span className="indicator-label">Đăng nhập</span>}
          {loading && (
            <span className="indicator-progress" style={{ display: "block" }}>
              Vui lòng chờ...
              <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="btn btn-light-primary fw-bolder px-8 py-4 my-3 fs-6 mr-3"
          disabled={loading}
        >
          <img
            src={toAbsoluteUrl("/media/svg/brand-logos/google-icon.svg")}
            className="w-20px h-20px me-3"
            alt=""
          />
          Đăng nhập với Google
        </button>
      </div>
    </form>
  );
}
