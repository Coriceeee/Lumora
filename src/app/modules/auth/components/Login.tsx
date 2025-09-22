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
    .email("Wrong email format")
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Email is required"),
  password: Yup.string()
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Password is required"),
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

  // payload cơ bản cho user
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
      // bạn có thể thêm các trường mặc định ở đây (role, status, v.v.)
      role: "user",
      status: "active",
    });
  } else {
    // cập nhật mốc đăng nhập
    await updateDoc(ref, {
      ...baseProfile,
      lastLoginAt: serverTimestamp(),
    });
  }

  // trả về dữ liệu tối thiểu (để lưu vào redux nếu muốn)
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
        // 1) Đăng nhập Firebase (email/password)
        const cred = await signInWithEmailAndPassword(
          authFb,
          values.email,
          values.password
        );

        const user = cred.user;

        // 2) Đảm bảo user có trong Firestore (tạo mới nếu chưa tồn tại)
        await ensureUserInFirestore({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          providerId: user.providerData?.[0]?.providerId ?? "password",
        });

        // 3) Lấy ID token để dùng cho Redux/Auth (giữ tương thích action cũ nhận token)
        const idToken = await getIdToken(user, true);

        setLoading(false);
        // Tuỳ action login của bạn; nếu chỉ nhận token thì như sau:
        dispatch(auth.actions.login(idToken));
        // Nếu bạn có action lưu profile, có thể dispatch thêm (tùy Redux setup):
        // dispatch(auth.actions.setUser({ uid: user.uid, email: user.email, ... }))

      } catch (err) {
        console.error(err);
        setLoading(false);
        setSubmitting(false);
        setStatus("The login detail is incorrect");
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
      // dispatch(auth.actions.setUser({...})) // nếu có
    } catch (err) {
      console.error(err);
      setLoading(false);
      formik.setStatus("Google sign-in failed");
    }
  };

  return (
    <form
      className="form w-100"
      onSubmit={formik.handleSubmit}
      noValidate
      id="kt_login_signin_form"
    >
      {/* begin::Title */}
      <div className="pb-lg-15">
        <h3 className="fw-bolder text-dark display-6">
          Chào mừng bạn đến với Lumora
        </h3>
        <div className="text-muted fw-bold fs-3">
          New Here?{" "}
          <Link
            to="/auth/registration"
            className="text-primary fw-bolder"
            id="kt_login_signin_form_singup_button"
          >
            Create Account
          </Link>
        </div>
      </div>
      {/* end::Title */}

      {formik.status ? (
        <div className="mb-lg-15 alert alert-danger">
          <div className="alert-text font-weight-bold">{formik.status}</div>
        </div>
      ) : (
        <div className="mb-lg-15 alert alert-info">
          <div className="alert-text ">
            Đăng nhập bằng email/password hoặc Google.
          </div>
        </div>
      )}

      {/* Email */}
      <div className="v-row mb-10 fv-plugins-icon-container">
        <label className="form-label fs-6 fw-bolder text-dark">Email</label>
        <input
          placeholder="Email"
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

      {/* Password */}
      <div className="fv-row mb-10 fv-plugins-icon-container">
        <div className="d-flex justify-content-between mt-n5">
          <label className="form-label fs-6 fw-bolder text-dark pt-5">
            Password
          </label>

          <Link
            to="/auth/forgot-password"
            className="text-primary fs-6 fw-bolder text-hover-primary pt-5"
            id="kt_login_signin_form_password_reset_button"
          >
            Forgot Password ?
          </Link>
        </div>
        <input
          type="password"
          autoComplete="off"
          {...formik.getFieldProps("password")}
          className={clsx(
            "form-control form-control-lg form-control-solid",
            {
              "is-invalid":
                formik.touched.password && formik.errors.password,
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

      {/* Actions */}
      <div className="pb-lg-0 pb-5">
        <button
          type="submit"
          id="kt_login_signin_form_submit_button"
          className="btn btn-primary fw-bolder fs-6 px-8 py-4 my-3 me-3"
          disabled={formik.isSubmitting || !formik.isValid || loading}
        >
          {!loading && <span className="indicator-label">Sign In</span>}
          {loading && (
            <span className="indicator-progress" style={{ display: "block" }}>
              Please wait...
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
          Sign in with Google
        </button>
      </div>
    </form>
  );
}
