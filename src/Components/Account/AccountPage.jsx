"use client";

import React, { useState, useEffect } from "react";
import "./AccountPage.css";
import { useSelector, useDispatch } from "react-redux";
import { setUser, logout as logoutRedux } from "../../Features/Auth/authSlice";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "../../utils/api";
import toast from "react-hot-toast";

import {
  FaUser,
  FaMapMarkerAlt,
  FaShoppingBag,
  FaLock,
  FaEdit,
  FaCamera,
  FaSignOutAlt,
  FaTimes,
  FaUndo,
  FaExchangeAlt,
  FaCheckCircle,
  FaSearch,
} from "react-icons/fa";

const getItemImage = (it) => {
  if (!it) return "https://res.cloudinary.com/usn1yap2/image/upload/v1787230546/pod_assets/logo.png";

  const candidates = [
    it.image,
    it.productImage,
    it.frontImg,
    it.mainImage,
    it.product?.mainImage,
    it.product?.frontImg,
    it.product?.image,
    Array.isArray(it.product?.images) ? it.product.images[0] : null,
    Array.isArray(it.images) ? it.images[0] : null,
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c;
    if (c && typeof c === "object" && c.src) return c.src;
  }

  return "https://res.cloudinary.com/usn1yap2/image/upload/v1787230546/pod_assets/logo.png";
};

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

  // Orders state & Filters
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState("all");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Order Action Modals
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("Changed my mind");

  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [requestType, setRequestType] = useState("return"); // "return" or "replacement"
  const [returnReason, setReturnReason] = useState("Defective / Damaged product");
  const [returnComments, setReturnComments] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

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
        setAddresses(data.data || addresses.filter((a) => a._id !== id));
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

  const handleCancelOrderSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModalOrder) return;
    setSubmittingAction(true);
    try {
      await api.cancelOrder(cancelModalOrder._id, cancelReason);
      toast.success(`Order #${cancelModalOrder._id} cancelled successfully.`);

      setOrders((prev) =>
        prev.map((o) =>
          o._id === cancelModalOrder._id
            ? { ...o, orderStatus: "Cancelled", cancelReason }
            : o
        )
      );
      setCancelModalOrder(null);
    } catch (err) {
      toast.error(err.message || "Failed to cancel order.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnModalOrder) return;
    setSubmittingAction(true);
    try {
      const fullReason = `${returnReason}${returnComments ? ` - ${returnComments}` : ""}`;
      await api.requestReturn(returnModalOrder._id, fullReason, requestType);
      const successMsg =
        requestType === "replacement"
          ? "Replacement request submitted successfully!"
          : "Return & Refund request submitted successfully!";
      toast.success(successMsg);

      const updatedStatus =
        requestType === "replacement" ? "Replacement Requested" : "Return Requested";

      setOrders((prev) =>
        prev.map((o) =>
          o._id === returnModalOrder._id
            ? { ...o, orderStatus: updatedStatus, returnReason: fullReason }
            : o
        )
      );
      setReturnModalOrder(null);
      setReturnComments("");
    } catch (err) {
      toast.error(err.message || "Failed to submit request.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const status = (ord.orderStatus || "Confirmed").toLowerCase();

    let matchesTab = true;
    if (orderFilter === "active") {
      matchesTab = ["pending", "confirmed", "processing", "shipped"].includes(status);
    } else if (orderFilter === "delivered") {
      matchesTab = status === "delivered";
    } else if (orderFilter === "returns") {
      matchesTab = status.includes("return") || status.includes("replacement");
    } else if (orderFilter === "cancelled") {
      matchesTab = status === "cancelled";
    }

    let matchesSearch = true;
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const idMatch = String(ord._id).toLowerCase().includes(q);
      const itemMatch = ord.items && ord.items.some((it) => it.name?.toLowerCase().includes(q));
      matchesSearch = idMatch || itemMatch;
    }

    return matchesTab && matchesSearch;
  });

  const userInitials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
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

          {/* Tab 3: Order History Dashboard */}
          {activeTab === "orders" && (
            <div>
              <h3 className="accountContentHeading">Order History</h3>

              {/* Order Filter Tabs & Search */}
              <div style={{ marginBottom: "20px" }}>
                <div className="orderFilters">
                  <button
                    className={`orderFilterBtn ${orderFilter === "all" ? "active" : ""}`}
                    onClick={() => setOrderFilter("all")}
                  >
                    All Orders ({orders.length})
                  </button>
                  <button
                    className={`orderFilterBtn ${orderFilter === "active" ? "active" : ""}`}
                    onClick={() => setOrderFilter("active")}
                  >
                    Active / In-Progress
                  </button>
                  <button
                    className={`orderFilterBtn ${orderFilter === "delivered" ? "active" : ""}`}
                    onClick={() => setOrderFilter("delivered")}
                  >
                    Delivered
                  </button>
                  <button
                    className={`orderFilterBtn ${orderFilter === "returns" ? "active" : ""}`}
                    onClick={() => setOrderFilter("returns")}
                  >
                    Returns & Replacements
                  </button>
                  <button
                    className={`orderFilterBtn ${orderFilter === "cancelled" ? "active" : ""}`}
                    onClick={() => setOrderFilter("cancelled")}
                  >
                    Cancelled
                  </button>
                </div>

                <div className="formGroup" style={{ maxWidth: "350px", marginTop: "10px" }}>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      placeholder="Search by Order ID or Product Name..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      style={{ width: "100%", paddingLeft: "36px" }}
                    />
                    <FaSearch
                      style={{
                        position: "absolute",
                        left: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#888",
                      }}
                    />
                  </div>
                </div>
              </div>

              {loadingOrders ? (
                <p className="emptyText">Loading your order history...</p>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((ord) => {
                  const status = (ord.orderStatus || "Confirmed").toLowerCase();
                  const isDelivered = status === "delivered";
                  const isCancelled = status === "cancelled";
                  const isReturnRequested = status.includes("return") || status.includes("replacement");
                  const isActive = ["pending", "confirmed", "processing", "shipped"].includes(status);

                  return (
                    <div key={ord._id} className="orderCard">
                      <div className="orderHeader">
                        <div>
                          <span className="orderIdText">Order #{ord._id}</span>
                          <p className="orderDate">
                            Placed on {new Date(ord.createdAt || Date.now()).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <span className={`orderBadge ${status}`}>
                          {ord.orderStatus || "Confirmed"}
                        </span>
                      </div>

                      {/* Items List with Robust Image Extraction */}
                      <div className="orderItemsList">
                        {ord.items &&
                          ord.items.map((it, idx) => {
                            const imgSrc = getItemImage(it);
                            return (
                              <div key={idx} className="orderItemRow">
                                <img
                                  src={imgSrc}
                                  alt={it.name}
                                  className="orderItemImg"
                                />
                                <div className="orderItemDetail">
                                  <h5>{it.name}</h5>
                                  <p>Quantity: {it.quantity}</p>
                                </div>
                                <div className="orderItemPrice">₹{it.price * it.quantity}</div>
                              </div>
                            );
                          })}
                      </div>

                      {/* Order Footer & Action Buttons */}
                      <div className="orderFooter">
                        <div>
                          <span className="paymentInfo">
                            Payment: {ord.paymentMethod || "COD"} • Mode: {ord.paymentStatus || "Success"}
                          </span>
                          <div style={{ marginTop: "4px" }}>
                            <strong className="totalPriceText">Total: ₹{ord.totalAmount}</strong>
                          </div>
                        </div>

                        <div className="orderActionBtns">
                          {/* Track / Details Modal trigger */}
                          <button
                            className="actionBtn outline"
                            onClick={() => setSelectedOrder(ord)}
                          >
                            Track & Details
                          </button>

                          {/* Cancel Order Action */}
                          {isActive && (
                            <button
                              className="actionBtn danger"
                              onClick={() => setCancelModalOrder(ord)}
                            >
                              Cancel Order
                            </button>
                          )}

                          {/* Return / Replacement Action */}
                          {isDelivered && !isReturnRequested && (
                            <button
                              className="actionBtn"
                              onClick={() => {
                                setReturnModalOrder(ord);
                                setRequestType("return");
                              }}
                            >
                              Return / Replace
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <p className="emptyText">No orders found matching your filter.</p>
                </div>
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

      {/* MODAL 1: ORDER DETAILS & TRACKING TIMELINE */}
      {selectedOrder && (
        <div className="orderModalOverlay">
          <div className="orderModalCard">
            <div className="orderModalHeader">
              <h4>Order Details & Tracking</h4>
              <button className="closeModalBtn" onClick={() => setSelectedOrder(null)}>
                <FaTimes />
              </button>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <p><strong>Order ID:</strong> #{selectedOrder._id}</p>
              <p><strong>Date:</strong> {new Date(selectedOrder.createdAt || Date.now()).toLocaleString()}</p>
              <p><strong>Status:</strong> <span className={`orderBadge ${selectedOrder.orderStatus?.toLowerCase()}`}>{selectedOrder.orderStatus || "Confirmed"}</span></p>
            </div>

            {/* Delivery Timeline Stepper */}
            <div style={{ background: "#f9f9f9", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
              <h5 style={{ fontWeight: "700", marginBottom: "10px", fontSize: "14px" }}>Tracking Timeline</h5>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", textAlign: "center" }}>
                <div style={{ color: "#16a34a", fontWeight: "700" }}>
                  <FaCheckCircle size={16} />
                  <p>Placed</p>
                </div>
                <div style={{ color: ["processing", "shipped", "delivered"].includes(selectedOrder.orderStatus?.toLowerCase()) ? "#16a34a" : "#aaa" }}>
                  <FaCheckCircle size={16} />
                  <p>Processing</p>
                </div>
                <div style={{ color: ["shipped", "delivered"].includes(selectedOrder.orderStatus?.toLowerCase()) ? "#16a34a" : "#aaa" }}>
                  <FaCheckCircle size={16} />
                  <p>Shipped</p>
                </div>
                <div style={{ color: selectedOrder.orderStatus?.toLowerCase() === "delivered" ? "#16a34a" : "#aaa" }}>
                  <FaCheckCircle size={16} />
                  <p>Delivered</p>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {selectedOrder.shippingAddress && (
              <div style={{ marginBottom: "20px", fontSize: "13px" }}>
                <h5 style={{ fontWeight: "700", marginBottom: "4px" }}>Shipping Address</h5>
                <p>{selectedOrder.shippingAddress.street}</p>
                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.zipCode}</p>
                <p>{selectedOrder.shippingAddress.country}</p>
              </div>
            )}

            {/* Items */}
            <div className="orderItemsList">
              <h5 style={{ fontWeight: "700", fontSize: "14px" }}>Order Items</h5>
              {selectedOrder.items &&
                selectedOrder.items.map((it, idx) => {
                  const imgSrc = getItemImage(it);
                  return (
                    <div key={idx} className="orderItemRow">
                      <img src={imgSrc} alt={it.name} className="orderItemImg" />
                      <div className="orderItemDetail">
                        <h5>{it.name}</h5>
                        <p>Qty: {it.quantity}</p>
                      </div>
                      <div className="orderItemPrice">₹{it.price * it.quantity}</div>
                    </div>
                  );
                })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #eee", paddingTop: "15px", marginTop: "15px", fontWeight: "700" }}>
              <span>Total Amount</span>
              <span>₹{selectedOrder.totalAmount}</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CANCEL ORDER REASON */}
      {cancelModalOrder && (
        <div className="orderModalOverlay">
          <div className="orderModalCard">
            <div className="orderModalHeader">
              <h4>Cancel Order #{cancelModalOrder._id}</h4>
              <button className="closeModalBtn" onClick={() => setCancelModalOrder(null)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCancelOrderSubmit} className="profileForm" style={{ maxWidth: "100%" }}>
              <div className="formGroup">
                <label>Select Reason for Cancellation *</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  required
                >
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Ordered wrong size / color">Ordered wrong size / color</option>
                  <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                  <option value="Delivery time is too long">Delivery time is too long</option>
                  <option value="Incorrect shipping address">Incorrect shipping address</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div className="formButtonGroup" style={{ justifyContent: "flex-end" }}>
                <button type="button" className="cancelBtn" onClick={() => setCancelModalOrder(null)}>
                  Keep Order
                </button>
                <button type="submit" className="actionBtn danger" disabled={submittingAction}>
                  {submittingAction ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: RETURN / REPLACEMENT / REFUND REQUEST */}
      {returnModalOrder && (
        <div className="orderModalOverlay">
          <div className="orderModalCard">
            <div className="orderModalHeader">
              <h4>Request Return or Replacement</h4>
              <button className="closeModalBtn" onClick={() => setReturnModalOrder(null)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="profileForm" style={{ maxWidth: "100%" }}>
              <div className="formGroup">
                <label>What would you like to request? *</label>
                <div style={{ display: "flex", gap: "20px", margin: "6px 0" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="requestType"
                      value="return"
                      checked={requestType === "return"}
                      onChange={(e) => setRequestType(e.target.value)}
                    />
                    <span><FaUndo /> Return & Refund</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="requestType"
                      value="replacement"
                      checked={requestType === "replacement"}
                      onChange={(e) => setRequestType(e.target.value)}
                    />
                    <span><FaExchangeAlt /> Replacement Item</span>
                  </label>
                </div>
              </div>

              <div className="formGroup">
                <label>Select Reason *</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  required
                >
                  <option value="Defective / Damaged product">Defective / Damaged product</option>
                  <option value="Size or fit issue">Size or fit issue</option>
                  <option value="Received wrong item">Received wrong item</option>
                  <option value="Item not as described">Item not as described</option>
                  <option value="Quality not as expected">Quality not as expected</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="formGroup">
                <label>Additional Comments / Issue Details</label>
                <textarea
                  rows={4}
                  placeholder="Describe the issue with your item (e.g. size difference, damaged packaging)..."
                  value={returnComments}
                  onChange={(e) => setReturnComments(e.target.value)}
                />
              </div>

              <div className="formButtonGroup" style={{ justifyContent: "flex-end" }}>
                <button type="button" className="cancelBtn" onClick={() => setReturnModalOrder(null)}>
                  Cancel
                </button>
                <button type="submit" className="saveBtn" disabled={submittingAction}>
                  {submittingAction ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
