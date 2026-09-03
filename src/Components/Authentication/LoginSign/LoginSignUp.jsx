"use client";

import React, { useState } from "react";
import "./LoginSignUp.css";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { useDispatch } from "react-redux";
import { setUser } from "../../../Features/Auth/authSlice";
import { FiEye, FiEyeOff } from "react-icons/fi";

const LoginSignUp = () => {
  const [activeTab, setActiveTab] = useState("tabButton1");
  const dispatch = useDispatch();
  const { login, loginMobile, verifyMobileOtp, register, verifyEmailOtp } = useAuth();
  const router = useRouter();

  // Login mode: "email" or "mobile"
  const [loginMode, setLoginMode] = useState("email");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Mobile login state
  const [mobileNum, setMobileNum] = useState("");
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileOtp, setMobileOtp] = useState("");

  // Register form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Email OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleMobileChange = (val, setter) => {
    const numeric = val.replace(/[^0-9]/g, "");
    if (numeric.length <= 10) {
      setter(numeric);
    }
  };

  // Submit standard Email/Password login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please enter email and password");
      return;
    }
    setSubmitting(true);
    try {
      const uData = await login(loginEmail, loginPassword);
      if (uData) dispatch(setUser(uData));
      toast.success("Logged in successfully! Redirecting to profile...");
      router.push("/account");
    } catch (err) {
      const errMsg = err.message || "";
      if (errMsg.toLowerCase().includes("verify")) {
        toast.error("Please verify your email address before logging in! Enter the OTP sent to your email.");
        setRegEmail(loginEmail);
        setActiveTab("tabButton2");
        setOtpSent(true);
      } else {
        toast.error(errMsg || "Login failed. Please check credentials.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Mobile Login OTP request
  const handleSendMobileOtp = async (e) => {
    e.preventDefault();
    if (mobileNum.length !== 10) {
      toast.error("Mobile number must be exactly 10 digits!");
      return;
    }
    setSubmitting(true);
    try {
      await loginMobile(mobileNum);
      setMobileOtpSent(true);
      toast.success("OTP sent to your mobile number!");
    } catch (err) {
      toast.error(err.message || "Failed to send mobile OTP");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Mobile Login OTP verification
  const handleVerifyMobileOtp = async (e) => {
    e.preventDefault();
    if (!mobileOtp) {
      toast.error("Please enter OTP code");
      return;
    }
    setSubmitting(true);
    try {
      const uData = await verifyMobileOtp(mobileNum, mobileOtp);
      if (uData) dispatch(setUser(uData));
      toast.success("Logged in successfully! Redirecting to profile...");
      router.push("/account");
    } catch (err) {
      toast.error(err.message || "Invalid OTP code");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Register form
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    if (regMobile.length !== 10) {
      toast.error("Mobile number must be exactly 10 digits!");
      return;
    }

    if (regPassword.length < 6) {
      toast.error("Password must be at least 6 characters long!");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setSubmitting(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      await register({
        name: fullName,
        email: regEmail,
        mobile: regMobile,
        password: regPassword,
      });
      setOtpSent(true);
      toast.success("Account created! A verification OTP has been sent to your email.");
    } catch (err) {
      toast.error(err.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Email OTP verification
  const handleVerifyEmailOtpSubmit = async (e) => {
    e.preventDefault();
    if (!emailOtp) {
      toast.error("Please enter verification OTP");
      return;
    }
    setSubmitting(true);
    try {
      await verifyEmailOtp(regEmail, emailOtp);
      toast.success("Email verified successfully! Please log in with your credentials.");
      
      // Switch user to Login tab and pre-fill email
      setLoginEmail(regEmail);
      setLoginPassword("");
      setLoginMode("email");
      setOtpSent(false);
      setEmailOtp("");
      setActiveTab("tabButton1");
    } catch (err) {
      toast.error(err.message || "Verification code is invalid");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="loginSignUpSection">
      <div className="loginSignUpContainer">
        <div className="loginSignUpTabs">
          <p
            onClick={() => setActiveTab("tabButton1")}
            className={activeTab === "tabButton1" ? "active" : ""}
          >
            Login
          </p>
          <p
            onClick={() => setActiveTab("tabButton2")}
            className={activeTab === "tabButton2" ? "active" : ""}
          >
            Register
          </p>
        </div>
        <div className="loginSignUpTabsContent">
          {/* LOGIN TAB */}
          {activeTab === "tabButton1" && (
            <div className="loginSignUpTabsContentLogin">
              <div className="loginModeToggle">
                <button
                  type="button"
                  className={loginMode === "email" ? "active" : ""}
                  onClick={() => setLoginMode("email")}
                >
                  Email & Password
                </button>
                <button
                  type="button"
                  className={loginMode === "mobile" ? "active" : ""}
                  onClick={() => setLoginMode("mobile")}
                >
                  Mobile Number OTP
                </button>
              </div>

              {loginMode === "email" ? (
                <form onSubmit={handleLoginSubmit}>
                  <input
                    type="email"
                    placeholder="Email address *"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    disabled={submitting}
                  />
                  <div className="passwordInputWrapper">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Password *"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      className="eyeIconToggle"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  <div className="loginSignUpForgetPass">
                    <label>
                      <input type="checkbox" className="brandRadio" defaultChecked />
                      <p>Remember me</p>
                    </label>
                  </div>
                  <button type="submit" disabled={submitting}>
                    {submitting ? "LOGGING IN..." : "LOG IN"}
                  </button>
                </form>
              ) : !mobileOtpSent ? (
                <form onSubmit={handleSendMobileOtp}>
                  <input
                    type="tel"
                    placeholder="10-Digit Mobile Number *"
                    value={mobileNum}
                    onChange={(e) => handleMobileChange(e.target.value, setMobileNum)}
                    required
                    disabled={submitting}
                  />
                  <button type="submit" disabled={submitting}>
                    {submitting ? "SENDING OTP..." : "SEND LOGIN OTP"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyMobileOtp}>
                  <p style={{ textAlign: "center", color: "#555" }}>
                    Enter 6-digit OTP sent to +91 {mobileNum}
                  </p>
                  <input
                    type="text"
                    placeholder="Enter Mobile OTP *"
                    value={mobileOtp}
                    onChange={(e) => setMobileOtp(e.target.value)}
                    required
                    disabled={submitting}
                    style={{ textAlign: "center", letterSpacing: "4px", fontWeight: "bold" }}
                  />
                  <button type="submit" disabled={submitting}>
                    {submitting ? "VERIFYING..." : "VERIFY & LOGIN"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* REGISTER TAB */}
          {activeTab === "tabButton2" && (
            <div className="loginSignUpTabsContentRegister">
              {!otpSent ? (
                <form onSubmit={handleRegisterSubmit}>
                  <div className="formRow">
                    <input
                      type="text"
                      placeholder="First Name *"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      disabled={submitting}
                    />
                    <input
                      type="text"
                      placeholder="Last Name *"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    disabled={submitting}
                  />
                  <input
                    type="tel"
                    placeholder="10-Digit Mobile Number *"
                    value={regMobile}
                    onChange={(e) => handleMobileChange(e.target.value, setRegMobile)}
                    required
                    disabled={submitting}
                  />
                  <div className="passwordInputWrapper">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      placeholder="Password *"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      className="eyeIconToggle"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                    >
                      {showRegPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  <div className="passwordInputWrapper">
                    <input
                      type={showRegConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password *"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                      disabled={submitting}
                    />
                    <button
                      type="button"
                      className="eyeIconToggle"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    >
                      {showRegConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>

                  <p>
                    Your personal data will be used to support your experience throughout
                    this website, to manage access to your account, and for other purposes
                    described in our privacy policy.
                  </p>
                  <button type="submit" disabled={submitting}>
                    {submitting ? "REGISTERING..." : "REGISTER"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyEmailOtpSubmit}>
                  <div style={{ textAlign: "center", marginBottom: "10px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
                      Verify Account Email
                    </h3>
                    <p style={{ fontSize: "13px", color: "#666" }}>
                      Enter the OTP code sent to <b>{regEmail}</b>
                    </p>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter Email Verification OTP *"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value)}
                    required
                    disabled={submitting}
                    style={{ textAlign: "center", letterSpacing: "4px", fontWeight: "bold" }}
                  />
                  <button type="submit" disabled={submitting}>
                    {submitting ? "VERIFYING..." : "VERIFY EMAIL ACCOUNT"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginSignUp;
