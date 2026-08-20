"use client";

import React, { useState, useEffect } from "react";
import "./AccountPage.css";
import { useSelector, useDispatch } from "react-redux";
import { setUser, logout as logoutRedux } from "../../Features/Auth/authSlice";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../utils/api";
import toast from "react-hot-toast";

import { FaUser, FaMapMarkerAlt, FaShoppingBag, FaLock, FaEdit, FaCamera, FaSignOutAlt } from "react-icons/fa";

const AccountPage = () => {
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { logout: logoutAuth } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Profile Form state
  const [name, setName] = useState(auth.user ? auth.user.name : "");
  const [email, setEmail] = useState(auth.user ? auth.user.email : "");
  const [mobile, setMobile] = useState(auth.user ? auth.user.mobile || "" : "");
  const [avatar, setAvatar] = useState(auth.user ? auth.user.avatar || "" : "");
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Address state
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrTitle, setAddrTitle] = useState("Home");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrZip, setAddrZip] = useState("");
  const [addrCountry, setAddrCountry] = useState("India");
  const [addrMobile, setAddrMobile] = useState("");

  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Security state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (auth.user) {
      setName(auth.user.name || "");
      setEmail(auth.user.email || "");
      setMobile(auth.user.mobile || "");
      setAvatar(auth.user.avatar || "");
      loadAddresses();
      loadOrders();
    }
  }, [auth.user]);

  const loadAddresses = async () => {
    try {
      const data = await api.getAddresses();
      if (data.success && data.data) {
        setAddresses(data.data);
      }
    } catch (err) {
      console.warn("Could not load addresses:", err);
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await api.getOrders();
      if (data.success && data.data) {
        setOrders(data.data);
      }
    } catch (err) {
      console.warn("Could not load orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLogout = () => {
    dispatch(logoutRedux());
    if (logoutAuth) logoutAuth();
    toast.success("Logged out successfully!");
    router.push("/login-signup");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setUpdatingProfile(true);
      const data = await api.updateProfile({ name, email, mobile, avatar });
      if (data.success && data.data) {
        dispatch(setUser(data.data));
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(data.data));
        }
        toast.success("Profile updated successfully!");
        setIsEditingProfile(false);
      }
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAvatarFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      setAvatar(base64Data);
      try {
        const data = await api.updateProfile({ avatar: base64Data });
        if (data.success && data.data) {
          dispatch(setUser(data.data));
          if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(data.data));
          }
          toast.success("Profile photo updated!");
        }
      } catch (err) {
        toast.error("Failed to update profile photo");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addrStreet || !addrCity || !addrZip) {
      toast.error("Please fill in required street, city, and zip code fields.");
      return;
    }
    try {
      const data = await api.addAddress({
        title: addrTitle,
        street: addrStreet,
        city: addrCity,
        state: addrState,
        zipCode: addrZip,
        country: addrCountry,
        mobile: addrMobile,
      });
      if (data.success && data.data) {
        setAddresses(data.data);
        setShowAddressForm(false);
        setAddrStreet("");
        setAddrCity("");
        setAddrState("");
        setAddrZip("");
        toast.success("Address added successfully!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to add address");
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const data = await api.deleteAddress(id);
      if (data.success) {
        setAddresses(data.data || addresses.filter(a => a._id !== id));
        toast.success("Address deleted");
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete address");
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const data = await api.setDefaultAddress(id);
      if (data.success && data.data) {
        setAddresses(data.data);
        toast.success("Primary address updated");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update primary address");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    try {
      const data = await api.changePassword(oldPassword, newPassword);
      if (data.success) {
        toast.success("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      toast.error(err.message || "Failed to change password");
    }
  };

  const userInitials = name
    ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="accountSection">
      <div className="accountHeader">
        <h2>My Account</h2>
        <p>Manage your profile, shipping addresses, order history, and security.</p>
      </div>

      <div className="accountContainer">
        <div className="accountSidebar">
          {/* Profile Photo / Avatar Badge with Direct Upload */}
          <div className="profileAvatarBox">
            <input
              type="file"
              id="avatarFileInput"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarFileSelect}
            />
            <div
              className="avatarImageWrapper"
              onClick={() => document.getElementById("avatarFileInput")?.click()}
              title="Click to upload profile photo"
            >
              <div className="avatarImageCircle">
                {avatar ? (
                  <img src={avatar} alt={name} />
                ) : (
                  <span>{userInitials}</span>
                )}
              </div>
              <div className="avatarCameraBadge">
                <FaCamera size={12} />
              </div>
            </div>
            <h4>{name || "User Profile"}</h4>
            <p>{email}</p>
          </div>

          <button
            className={`accountTabBtn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <FaUser /> My Profile
          </button>
          <button
            className={`accountTabBtn ${activeTab === "addresses" ? "active" : ""}`}
            onClick={() => setActiveTab("addresses")}
          >
            <FaMapMarkerAlt /> Addresses
          </button>
          <button
            className={`accountTabBtn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <FaShoppingBag /> Order History
          </button>
          <button
            className={`accountTabBtn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <FaLock /> Password & Security
          </button>

          {/* Logout Button in Account Dashboard */}
          <button className="accountLogoutBtn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>

        <div className="accountContent">
          {/* Tab 1: Profile */}
          {activeTab === "profile" && (
            <div>
              <div className="profileTabHeaderContainer">
                <h3 className="accountContentHeading profileTabHeadingNoBorder">
                  Profile Details
                </h3>
                {!isEditingProfile && (
                  <button
                    className="editProfileBtn"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    <FaEdit /> Edit Profile
                  </button>
                )}
              </div>

              {!isEditingProfile ? (
                /* READ-ONLY VIEW */
                <div className="profileViewCard">
                  <div className="profileViewItem">
                    <span className="label">Full Name</span>
                    <span className="value">{name || "Not specified"}</span>
                  </div>
                  <div className="profileViewItem">
                    <span className="label">Email Address</span>
                    <span className="value">{email || "Not specified"}</span>
                  </div>
                  <div className="profileViewItem">
                    <span className="label">Mobile Number</span>
                    <span className="value">{mobile || auth.user?.mobile || "Not specified"}</span>
                  </div>
                </div>
              ) : (
                /* EDITING VIEW FORM */
                <form onSubmit={handleUpdateProfile} className="profileForm">
                  <div className="formGroup">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="formGroup">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled
                      className="disabledInput"
                    />
                  </div>
                  <div className="formGroup">
                    <label>Mobile Number</label>
                    <input
                      type="text"
                      placeholder="Enter phone number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                  </div>
                  <div className="formButtonGroup">
                    <button type="submit" className="saveBtn" disabled={updatingProfile}>
                      {updatingProfile ? "Updating..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      className="cancelBtn"
                      onClick={() => setIsEditingProfile(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Tab 2: Addresses */}
          {activeTab === "addresses" && (
            <div>
              <div className="profileTabHeaderContainer">
                <h3 className="accountContentHeading profileTabHeadingNoBorder">Saved Addresses</h3>
                <button
                  className="saveBtn addAddressBtn"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                >
                  {showAddressForm ? "Cancel" : "+ Add New Address"}
                </button>
              </div>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="profileForm addAddressForm">
                  <div className="formGroup">
                    <label>Address Title (e.g. Home, Office)</label>
                    <input type="text" value={addrTitle} onChange={(e) => setAddrTitle(e.target.value)} />
                  </div>
                  <div className="formGroup">
                    <label>Street Address *</label>
                    <input type="text" value={addrStreet} onChange={(e) => setAddrStreet(e.target.value)} required />
                  </div>
                  <div className="formGroup">
                    <label>City *</label>
                    <input type="text" value={addrCity} onChange={(e) => setAddrCity(e.target.value)} required />
                  </div>
                  <div className="formGroup">
                    <label>State</label>
                    <input type="text" value={addrState} onChange={(e) => setAddrState(e.target.value)} />
                  </div>
                  <div className="formGroup">
                    <label>ZIP / Postcode *</label>
                    <input type="text" value={addrZip} onChange={(e) => setAddrZip(e.target.value)} required />
                  </div>
                  <div className="formGroup">
                    <label>Country</label>
                    <input type="text" value={addrCountry} onChange={(e) => setAddrCountry(e.target.value)} />
                  </div>
                  <button type="submit" className="saveBtn">Save Address</button>
                </form>
              )}

              <div className="addressList">
                {addresses.length > 0 ? (
                  addresses.map((addr) => (
                    <div key={addr._id} className={`addressCard ${addr.isDefault ? "default" : ""}`}>
                      {addr.isDefault && <span className="defaultBadge">Primary</span>}
                      <h4>{addr.title || "Address"}</h4>
                      <p>{addr.street}</p>
                      <p>{addr.city}, {addr.state} {addr.zipCode}</p>
                      <p>{addr.country}</p>
                      <div className="addressActions">
                        {!addr.isDefault && (
                          <button onClick={() => handleSetDefaultAddress(addr._id)}>Set Primary</button>
                        )}
                        <button className="deleteBtn" onClick={() => handleDeleteAddress(addr._id)}>Delete</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="emptyText">No saved addresses found. Add a new address above.</p>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Orders */}
          {activeTab === "orders" && (
            <div>
              <h3 className="accountContentHeading">Order History</h3>
              {loadingOrders ? (
                <p>Loading your orders...</p>
              ) : orders.length > 0 ? (
                orders.map((ord) => (
                  <div key={ord._id} className="orderCard">
                    <div className="orderHeader">
                      <div>
                        <strong>Order #{ord._id}</strong>
                        <p className="orderDate">
                          Placed on {new Date(ord.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`orderBadge ${ord.orderStatus || "confirmed"}`}>
                        {ord.orderStatus || "Confirmed"}
                      </span>
                    </div>
                    <div className="orderItemsSummary">
                      {ord.items && ord.items.map((it, idx) => (
                        <p key={idx}>• {it.name} x {it.quantity} (${it.price})</p>
                      ))}
                    </div>
                    <div className="orderFooter">
                      <span className="paymentInfo">Payment: {ord.paymentMethod} ({ord.paymentStatus})</span>
                      <strong className="totalPriceText">Total: ${ord.totalAmount}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <p className="emptyText">No past orders found.</p>
              )}
            </div>
          )}

          {/* Tab 4: Security */}
          {activeTab === "security" && (
            <div>
              <h3 className="accountContentHeading">Change Password</h3>
              <form onSubmit={handleChangePassword} className="profileForm">
                <div className="formGroup">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="formGroup">
                  <label>New Password (min 6 characters)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="formGroup">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="saveBtn">Update Password</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
