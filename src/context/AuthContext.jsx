"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load User Addresses
  const loadAddresses = useCallback(async () => {
    try {
      const data = await api.getAddresses();
      if (data.success && data.data) {
        setAddresses(data.data);
      }
    } catch (err) {
      console.warn("Failed to load user addresses:", err);
    }
  }, []);

  // Fetch current user details with token
  const fetchProfile = useCallback(async () => {
    try {
      const data = await api.getProfile();
      if (data.success && data.data) {
        setUser(data.data);
        await loadAddresses();
      } else {
        logout();
      }
    } catch (err) {
      console.warn("Profile retrieval error:", err);
      logout();
    } finally {
      setAuthLoading(false);
    }
  }, [loadAddresses]);

  // Check login on startup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
        fetchProfile();
      } else {
        setAuthLoading(false);
      }
    }
  }, [fetchProfile]);

  // Sign In with Email & Password
  const login = async (email, password) => {
    setError(null);
    try {
      const data = await api.login(email, password);
      if (data.success && data.data) {
        const uData = data.data;
        const authToken = uData.token;
        setUser(uData);
        setToken(authToken);
        if (typeof window !== "undefined") {
          localStorage.setItem("token", authToken);
          localStorage.setItem("user", JSON.stringify(uData));
        }
        await loadAddresses();
        return uData;
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (err) {
      const message = err?.message || "Login failed. Please check credentials.";
      setError(message);
      throw new Error(message);
    }
  };

  // Sign Up / Register Account
  const register = async (userData) => {
    setError(null);
    try {
      const data = await api.register(
        userData.name,
        userData.email,
        userData.password,
        userData.mobile || ""
      );
      if (!data.success) {
        throw new Error(data.message || "Failed to create account");
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Request Mobile OTP login
  const loginMobile = async (mobile) => {
    setError(null);
    try {
      const res = await fetch("http://localhost:5001/api/auth/login-mobile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to send mobile OTP");
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Verify Mobile Login OTP
  const verifyMobileOtp = async (mobile, otp) => {
    setError(null);
    try {
      const res = await fetch("http://localhost:5001/api/auth/verify-mobile-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Invalid OTP code");
      }
      const uData = data.data || data;
      const authToken = uData.token;
      setUser(uData);
      setToken(authToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("token", authToken);
        localStorage.setItem("user", JSON.stringify(uData));
      }
      await loadAddresses();
      return uData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Verify Email OTP
  const verifyEmailOtp = async (email, otp) => {
    setError(null);
    try {
      const data = await api.verifyEmail(email, otp);
      if (!data.success) {
        throw new Error(data.message || "Failed to verify email");
      }
      if (data.data && data.data.token) {
        const uData = data.data;
        setUser(uData);
        setToken(uData.token);
        if (typeof window !== "undefined") {
          localStorage.setItem("token", uData.token);
          localStorage.setItem("user", JSON.stringify(uData));
        }
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Log Out / Reset State
  const logout = () => {
    setUser(null);
    setToken(null);
    setAddresses([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  };

  // Update Profile Name / Email / Mobile
  const updateProfile = async (profileData) => {
    setError(null);
    try {
      const data = await api.updateProfile(profileData);
      if (data.success && data.data) {
        setUser((prev) => (prev ? { ...prev, ...data.data } : data.data));
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(data.data));
        }
        return data.data;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Change Password
  const changePassword = async (oldPassword, newPassword) => {
    setError(null);
    try {
      const data = await api.changePassword(oldPassword, newPassword);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Address CRUD: Add
  const addAddress = async (addrData) => {
    setError(null);
    try {
      const data = await api.addAddress(addrData);
      if (data.success && data.data) {
        setAddresses(data.data);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Address CRUD: Delete
  const deleteAddress = async (id) => {
    setError(null);
    try {
      const data = await api.deleteAddress(id);
      if (data.success) {
        setAddresses(data.data || addresses.filter((a) => a._id !== id));
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Address CRUD: Set Default
  const setDefaultAddress = async (id) => {
    setError(null);
    try {
      const data = await api.setDefaultAddress(id);
      if (data.success && data.data) {
        setAddresses(data.data);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        addresses,
        authLoading,
        error,
        login,
        loginMobile,
        verifyMobileOtp,
        verifyEmailOtp,
        register,
        logout,
        updateProfile,
        changePassword,
        addAddress,
        deleteAddress,
        setDefaultAddress,
        loadAddresses,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
