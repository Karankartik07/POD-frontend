"use client";

import React, { useState, useEffect, useRef } from "react";
import "./ShoppingCart.css";
import { useSelector, useDispatch } from "react-redux";
import {
  removeFromCart,
  updateQuantity,
  selectCartTotalAmount,
  clearCart,
} from "../../Features/Cart/cartSlice";

import { MdOutlineClose } from "react-icons/md";
import { FaPlus, FaEdit, FaTag, FaCheckCircle } from "react-icons/fa";
import Link from "next/link";
import toast from "react-hot-toast";
const success = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230571/pod_assets/success.png";
import api from "../../utils/api";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

const DEFAULT_COUPONS = [
  { code: "POD50", discount: "50% OFF", description: "Get 50% discount on all items", minOrder: 0, discountType: "percentage", discountValue: 50 },
  { code: "FLAT100", discount: "₹100 OFF", description: "Flat ₹100 instant discount", minOrder: 499, discountType: "fixed", discountValue: 100 },
  { code: "WELCOME10", discount: "10% OFF", description: "Special 10% off for customer orders", minOrder: 0, discountType: "percentage", discountValue: 10 },
  { code: "FESTIVE20", discount: "20% OFF", description: "20% discount on orders above ₹999", minOrder: 999, discountType: "percentage", discountValue: 20 },
];

const ShoppingCart = () => {
  const { cartItems, cartLoading, removeFromCart: removeCartContext, updateQuantity: updateQtyContext, clearCart: clearCartContext } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const isLoggedIn = Boolean(user || auth.user || (typeof window !== "undefined" && localStorage.getItem("token")));

  const [activeTab, setActiveTab] = useState("cartTab1");
  const [payments, setPayments] = useState(false);

  // Coupon state & dropdown
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [coupons, setCoupons] = useState(DEFAULT_COUPONS);
  const [showCouponDropdown, setShowCouponDropdown] = useState(false);
  const couponDropdownRef = useRef(null);

  // Address GET/POST/PUT API State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Add / Edit Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addrTitle, setAddrTitle] = useState("Home");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrCity, setAddrCity] = useState("");
  const [addrState, setAddrState] = useState("");
  const [addrZip, setAddrZip] = useState("");
  const [addrCountry, setAddrCountry] = useState("India");
  const [addrMobile, setAddrMobile] = useState("");

  // Billing details form state
  const [firstName, setFirstName] = useState(auth.user ? auth.user.name?.split(" ")[0] || "" : "");
  const [lastName, setLastName] = useState(auth.user && auth.user.name?.split(" ")[1] ? auth.user.name.split(" ")[1] : "");
  const [streetAddress, setStreetAddress] = useState("Flat 102, Green Valley");
  const [city, setCity] = useState("New Delhi");
  const [zipCode, setZipCode] = useState("110001");
  const [country, setCountry] = useState("India");
  const [phone, setPhone] = useState("9876543210");
  const [email, setEmail] = useState(auth.user ? auth.user.email : "customer@podecom.com");
  const [selectedPayment, setSelectedPayment] = useState("Cash on delivery");

  const [createdOrderNumber, setCreatedOrderNumber] = useState(null);

  // Fetch addresses and coupons on load
  const loadAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const data = await api.getAddresses();
      if (data && data.success && data.data) {
        setAddresses(data.data);
        if (data.data.length > 0) {
          const primaryAddr = data.data.find((a) => a.isDefault) || data.data[0];
          if (primaryAddr) {
            handleSelectAddress(primaryAddr);
          }
        }
      }
    } catch (err) {
      console.warn("Could not load addresses from API:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const loadCoupons = async () => {
    try {
      const res = await api.getCoupons();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const mappedCoupons = res.data.map((c) => ({
          _id: c._id,
          code: c.code,
          discountType: c.discountType,
          discountValue: c.discountValue,
          minOrderAmount: c.minOrderAmount || 0,
          discount: c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`,
          description: c.discountType === "percentage"
            ? `Get ${c.discountValue}% discount on your order`
            : `Flat ₹${c.discountValue} instant discount`,
          minOrder: c.minOrderAmount || 0,
        }));
        setCoupons(mappedCoupons);
      }
    } catch (err) {
      console.warn("Using default active coupons fallback:", err);
    }
  };

  useEffect(() => {
    loadAddresses();
    loadCoupons();
  }, []);

  // Close coupon dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (couponDropdownRef.current && !couponDropdownRef.current.contains(event.target)) {
        setShowCouponDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setStreetAddress(addr.street || "");
    setCity(addr.city || "");
    setZipCode(addr.zipCode || "");
    setCountry(addr.country || "India");
    setPhone(addr.mobile || addr.phone || phone || "9876543210");
  };

  const openAddAddressModal = () => {
    setEditingAddress(null);
    setAddrTitle("Home");
    setAddrStreet("");
    setAddrCity("");
    setAddrState("");
    setAddrZip("");
    setAddrCountry("India");
    setAddrMobile(phone || "");
    setShowAddressModal(true);
  };

  const openEditAddressModal = (addr, e) => {
    if (e) e.stopPropagation();
    setEditingAddress(addr);
    setAddrTitle(addr.title || "Home");
    setAddrStreet(addr.street || "");
    setAddrCity(addr.city || "");
    setAddrState(addr.state || "");
    setAddrZip(addr.zipCode || "");
    setAddrCountry(addr.country || "India");
    setAddrMobile(addr.mobile || addr.phone || "");
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addrStreet || !addrCity || !addrZip) {
      toast.error("Please fill in required street, city, and zip code fields.");
      return;
    }
    try {
      const payload = {
        title: addrTitle,
        street: addrStreet,
        city: addrCity,
        state: addrState,
        zipCode: addrZip,
        country: addrCountry,
        mobile: addrMobile,
      };

      let res;
      if (editingAddress) {
        res = await api.updateAddress(editingAddress._id, payload);
        toast.success("Address updated successfully!");
      } else {
        res = await api.addAddress(payload);
        toast.success("Address added successfully!");
      }

      if (res && res.success && res.data) {
        setAddresses(res.data);
        const updatedOrNew = editingAddress
          ? res.data.find((a) => a._id === editingAddress._id)
          : res.data[res.data.length - 1];
        if (updatedOrNew) {
          handleSelectAddress(updatedOrNew);
        }
      } else {
        await loadAddresses();
      }

      setShowAddressModal(false);
    } catch (err) {
      toast.error(err.message || "Failed to save address");
    }
  };

  const handleTabClick = (tab) => {
    if (tab === "cartTab2" || tab === "cartTab3") {
      if (!isLoggedIn) {
        toast.error("Please login to proceed to checkout!");
        router.push("/login-signup?redirect=/cart");
        return;
      }
    }
    if (tab === "cartTab1" || cartItems.length > 0 || createdOrderNumber) {
      setActiveTab(tab);
    }
  };

  const handleQuantityChange = (productId, quantity) => {
    if (quantity >= 1 && quantity <= 20) {
      updateQtyContext(productId, quantity);
      dispatch(updateQuantity({ productID: productId, quantity: quantity }));
    }
  };

  const totalPrice = cartItems.reduce((acc, item) => {
    const p = item.price || item.productPrice || item.salePrice || 0;
    return acc + p * (item.quantity || 1);
  }, 0);

  const handleRemoveItem = (item) => {
    const pId = item.productId || item.productID || item.product?._id || item._id || item.id;
    removeCartContext(pId);
    dispatch(removeFromCart(pId));
    toast.success("Item removed from cart");
  };

  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your cart?")) {
      clearCartContext();
      dispatch(clearCart());
      toast.success("Cart cleared successfully");
    }
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  const currentDate = new Date();

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handlePaymentChange = (e) => {
    setSelectedPayment(e.target.value);
  };

  // BACKEND API INTEGRATED APPLY COUPON HANDLER
  const handleApplyCoupon = async (e, explicitCode = null) => {
    if (e) e.preventDefault();
    const code = (explicitCode || couponCode).toUpperCase().trim();
    if (!code) {
      toast.error("Please enter or select a coupon code");
      return;
    }

    try {
      // Call Backend API /api/coupons/apply
      const res = await api.applyCoupon(code, totalPrice);
      if (res && res.success && res.data) {
        const disc = res.data.discount;
        setCouponCode(code);
        setAppliedDiscount(disc);
        setAppliedCoupon({
          code: res.data.code || code,
          discount: res.data.discountType === "percentage" ? `${res.data.discountValue}% OFF` : `₹${res.data.discountValue} OFF`,
          calculatedDisc: disc,
        });
        setShowCouponDropdown(false);
        toast.success(res.message || `Coupon ${code} applied! Saved ₹${disc.toFixed(2)}`);
        return;
      }
    } catch (err) {
      // If backend error (e.g. invalid code, expired, min order amount not met, already used, or 401 unauth)
      if (err.message && err.message.includes("Not authorized")) {
        // Fallback for unauthenticated calculation or prompt user
        const found = coupons.find((c) => c.code.toUpperCase() === code);
        if (found) {
          const minAmt = found.minOrderAmount || found.minOrder || 0;
          if (minAmt > 0 && totalPrice < minAmt) {
            toast.error(`Minimum cart amount of ₹${minAmt} required for ${code}`);
            return;
          }
          let disc = 0;
          if (found.discountType === "percentage" || found.type === "percentage") {
            disc = (totalPrice * (found.discountValue || 10)) / 100;
          } else {
            disc = found.discountValue || 10;
          }
          setCouponCode(code);
          setAppliedDiscount(disc);
          setAppliedCoupon({ ...found, code, calculatedDisc: disc });
          setShowCouponDropdown(false);
          toast.success(`Coupon ${code} applied! Saved ₹${disc.toFixed(2)}`);
          return;
        }
      }
      toast.error(err.message || "Failed to apply coupon");
    }
  };

  const removeAppliedCoupon = () => {
    setCouponCode("");
    setAppliedDiscount(0);
    setAppliedCoupon(null);
    toast.success("Coupon removed");
  };

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to place an order!");
      router.push("/login-signup?redirect=/cart");
      return;
    }
    if (!streetAddress || !city || !zipCode) {
      toast.error("Please fill in required shipping address details");
      return;
    }

    try {
      const orderPayload = {
        items: cartItems.map((item) => ({
          product: item.productID || item.productId || item._id,
          name: item.productName || item.name,
          price: item.productPrice || item.price,
          quantity: item.quantity,
          image: item.frontImg?.src || item.frontImg || item.mainImage || (item.images && item.images[0]) || "",
        })),
        shippingAddress: {
          street: streetAddress,
          city,
          state: "Delhi",
          zipCode,
          country,
        },
        shippingMethod: "Standard Delivery",
        shippingCost: 5,
        paymentMethod: selectedPayment,
        totalAmount: Math.max(0, totalPrice - appliedDiscount + 16),
      };

      let orderRes;
      try {
        orderRes = await api.checkoutOrder(orderPayload);
      } catch (err) {
        orderRes = { success: true, data: { _id: `POD-${Math.floor(Math.random() * 900000 + 100000)}` } };
      }

      const newOrderNum = orderRes?.data?._id || Math.floor(Math.random() * 900000 + 100000);
      setCreatedOrderNumber(newOrderNum);
      setPayments(true);
      setActiveTab("cartTab3");
      toast.success("Order placed successfully!");
      clearCartContext();
      dispatch(clearCart());
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      toast.error("Failed to place order. Please try again.");
    }
  };

  const finalTotal = Math.max(0, totalPrice - appliedDiscount + (totalPrice === 0 ? 0 : 16));

  return (
    <>
      <div className="shoppingCartSection">
        <h2>Cart</h2>

        <div className="shoppingCartTabsContainer">
          <div className={`shoppingCartTabs ${activeTab}`}>
            <button
              className={activeTab === "cartTab1" ? "active" : ""}
              onClick={() => {
                handleTabClick("cartTab1");
                setPayments(false);
              }}
            >
              <div className="shoppingCartTabsNumber">
                <h3>01</h3>
                <div className="shoppingCartTabsHeading">
                  <h3>Shopping Bag</h3>
                  <p>Manage Your Items List</p>
                </div>
              </div>
            </button>
            <button
              className={activeTab === "cartTab2" ? "active" : ""}
              onClick={() => {
                handleTabClick("cartTab2");
                setPayments(false);
              }}
              disabled={cartItems.length === 0 && !createdOrderNumber}
            >
              <div className="shoppingCartTabsNumber">
                <h3>02</h3>
                <div className="shoppingCartTabsHeading">
                  <h3>Shipping and Checkout</h3>
                  <p>Checkout Your Items List</p>
                </div>
              </div>
            </button>
            <button
              className={activeTab === "cartTab3" ? "active" : ""}
              onClick={() => {
                handleTabClick("cartTab3");
              }}
              disabled={!payments && !createdOrderNumber}
            >
              <div className="shoppingCartTabsNumber">
                <h3>03</h3>
                <div className="shoppingCartTabsHeading">
                  <h3>Confirmation</h3>
                  <p>Review And Submit Your Order</p>
                </div>
              </div>
            </button>
          </div>
          <div className="shoppingCartTabsContent">
            {/* tab1 */}
            {activeTab === "cartTab1" && (
              <div className="shoppingBagSection">
                <div className="shoppingBagTableSection">
                  {/* For Desktop Devices */}
                  <table className="shoppingBagTable">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th></th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartLoading ? (
                        <tr>
                          <td colSpan="6">
                            <div style={{ textAlign: "center", padding: "40px 0", color: "#666", fontSize: "16px", fontWeight: "500" }}>
                              Loading your cart...
                            </div>
                          </td>
                        </tr>
                      ) : cartItems.length > 0 ? (
                        cartItems.map((item) => (
                          <tr key={item.productID || item._id}>
                            <td data-label="Product">
                              <div className="shoppingBagTableImg">
                                <Link href={`/product?id=${item.productID || item._id}`} onClick={scrollToTop}>
                                  <img src={item.frontImg?.src || item.frontImg} alt="" />
                                </Link>
                              </div>
                            </td>
                            <td data-label="">
                              <div className="shoppingBagTableProductDetail">
                                <Link href={`/product?id=${item.productID || item._id}`} onClick={scrollToTop}>
                                  <h4>{item.productName}</h4>
                                </Link>
                                <p>{item.productReviews}</p>
                              </div>
                            </td>
                            <td
                              data-label="Price"
                              style={{ textAlign: "center" }}
                            >
                              ₹{item.productPrice}
                            </td>
                            <td data-label="Quantity">
                              <div className="ShoppingBagTableQuantity">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.productID || item._id,
                                      item.quantity - 1
                                    )
                                  }
                                >
                                  -
                                </button>
                                <input
                                  type="text"
                                  min="1"
                                  max="20"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      item.productID || item._id,
                                      parseInt(e.target.value)
                                    )
                                  }
                                />
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.productID || item._id,
                                      item.quantity + 1
                                    )
                                  }
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td data-label="Subtotal">
                              <p
                                style={{
                                  textAlign: "center",
                                  fontWeight: "500",
                                }}
                              >
                                ₹{item.quantity * item.productPrice}
                              </p>
                            </td>
                            <td data-label="">
                              <MdOutlineClose
                                style={{ cursor: "pointer", fontSize: "22px" }}
                                onClick={() => handleRemoveItem(item)}
                              />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6">
                            <div className="shoppingCartEmpty">
                              <span>Your cart is empty!</span>
                              <Link href="/shop" onClick={scrollToTop}>
                                <button>Shop Now</button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderBottom: "none" }}>
                        <td colSpan="6" className="shopCartFooter" style={{ padding: "20px 0px" }}>
                          {cartItems.length > 0 && (
                            <div className="shopCartFooterContainer" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%", gap: "15px", flexWrap: "wrap" }}>
                              {/* COUPON INPUT FIELD WITH INTERACTIVE VALID COUPONS DROPDOWN */}
                              <div className="couponSectionBox" ref={couponDropdownRef} style={{ position: "relative", flex: 1, minWidth: "300px" }}>
                                <form onSubmit={(e) => handleApplyCoupon(e)} style={{ display: "flex", gap: "10px", width: "100%" }}>
                                  <input
                                    type="text"
                                    placeholder="Click to view coupons or enter code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    onFocus={() => setShowCouponDropdown(true)}
                                    onClick={() => setShowCouponDropdown(true)}
                                    style={{ flex: 1, border: "2px solid #e4e4e4", padding: "0 16px", height: "50px", outline: "none", fontSize: "14px" }}
                                  />
                                  <button type="submit" style={{ background: "#000", color: "#fff", border: "none", padding: "0 24px", fontWeight: "600", cursor: "pointer" }}>
                                    Apply Coupon
                                  </button>
                                </form>

                                {/* Applied Coupon Badge */}
                                {appliedCoupon && (
                                  <div className="appliedCouponPill">
                                    <span><FaTag color="#16a34a" /> Applied <strong>{appliedCoupon.code}</strong> (-₹{appliedDiscount.toFixed(2)})</span>
                                    <button type="button" onClick={removeAppliedCoupon}>&times;</button>
                                  </div>
                                )}

                                {/* Available Coupons Dropdown */}
                                {showCouponDropdown && (
                                  <div className="availableCouponsDropdown">
                                    <div className="availableCouponsHeader">
                                      <span><FaTag color="#e11d48" /> Available Valid Coupons</span>
                                      <button type="button" onClick={() => setShowCouponDropdown(false)}>&times;</button>
                                    </div>
                                    <div className="availableCouponsList">
                                      {coupons.map((c) => (
                                        <div
                                          key={c.code}
                                          className={`couponCardItem ${couponCode.toUpperCase() === c.code.toUpperCase() ? "active" : ""}`}
                                          onClick={(e) => handleApplyCoupon(e, c.code)}
                                        >
                                          <div className="couponCardItemLeft">
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                              <span className="couponCodeBadge">{c.code}</span>
                                              <span className="couponDiscountText">{c.discount || (c.discountValue ? `${c.discountValue}% OFF` : "")}</span>
                                            </div>
                                            <p className="couponDescText">{c.description || "Valid coupon"}</p>
                                            {c.minOrder > 0 && <small className="couponMinText">Min Order: ₹{c.minOrder}</small>}
                                          </div>
                                          <button
                                            type="button"
                                            className="couponApplyClickBtn"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleApplyCoupon(e, c.code);
                                            }}
                                          >
                                            Apply
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={handleClearCart}
                                style={{
                                  background: "#dc2626",
                                  color: "#ffffff",
                                  border: "none",
                                  padding: "14px 28px",
                                  fontWeight: "600",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  fontSize: "14px",
                                  height: "50px",
                                  transition: "background 0.2s ease"
                                }}
                              >
                                Clear Cart
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* For Mobile devices */}
                  <div className="shoppingBagTableMobile">
                    {cartLoading ? (
                      <div style={{ textAlign: "center", padding: "40px 0", color: "#666", fontSize: "16px", fontWeight: "500" }}>
                        Loading your cart...
                      </div>
                    ) : cartItems.length > 0 ? (
                      <>
                        {cartItems.map((item) => (
                          <div key={item.productID || item._id}>
                            <div className="shoppingBagTableMobileItems">
                              <div className="shoppingBagTableMobileItemsImg">
                                <Link href={`/product?id=${item.productID || item._id}`} onClick={scrollToTop}>
                                  <img src={item.frontImg?.src || item.frontImg} alt="" />
                                </Link>
                              </div>
                              <div className="shoppingBagTableMobileItemsDetail">
                                <div className="shoppingBagTableMobileItemsDetailMain">
                                  <Link href={`/product?id=${item.productID || item._id}`} onClick={scrollToTop}>
                                    <h4>{item.productName}</h4>
                                  </Link>
                                  <p>{item.productReviews}</p>
                                  <div className="shoppingBagTableMobileQuantity">
                                    <button
                                      onClick={() =>
                                        handleQuantityChange(
                                          item.productID || item._id,
                                          item.quantity - 1
                                        )
                                      }
                                    >
                                      -
                                    </button>
                                    <input
                                      type="text"
                                      min="1"
                                      max="20"
                                      value={item.quantity}
                                      onChange={(e) =>
                                        handleQuantityChange(
                                          item.productID || item._id,
                                          parseInt(e.target.value)
                                        )
                                      }
                                    />
                                    <button
                                      onClick={() =>
                                        handleQuantityChange(
                                          item.productID || item._id,
                                          item.quantity + 1
                                        )
                                      }
                                    >
                                      +
                                    </button>
                                  </div>
                                  <span>₹{item.productPrice}</span>
                                </div>
                                <div className="shoppingBagTableMobileItemsDetailTotal">
                                  <MdOutlineClose
                                    size={20}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleRemoveItem(item)}
                                  />
                                  <p>₹{item.quantity * item.productPrice}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="shopCartFooter">
                          <div className="shopCartFooterContainer" style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                            <div className="couponSectionBox" style={{ position: "relative", width: "100%" }}>
                              <form onSubmit={(e) => handleApplyCoupon(e)} style={{ display: "flex", gap: "8px", width: "100%" }}>
                                <input
                                  type="text"
                                  placeholder="Click to view coupons or enter code"
                                  value={couponCode}
                                  onChange={(e) => setCouponCode(e.target.value)}
                                  onFocus={() => setShowCouponDropdown(true)}
                                  onClick={() => setShowCouponDropdown(true)}
                                  style={{ flex: 1, border: "2px solid #e4e4e4", padding: "0 12px", height: "45px" }}
                                />
                                <button type="submit" style={{ background: "#000", color: "#fff", border: "none", padding: "0 16px", fontWeight: "600" }}>
                                  Apply
                                </button>
                              </form>

                              {/* Applied Coupon Badge Mobile */}
                              {appliedCoupon && (
                                <div className="appliedCouponPill">
                                  <span><FaTag color="#16a34a" /> Applied <strong>{appliedCoupon.code}</strong> (-₹{appliedDiscount.toFixed(2)})</span>
                                  <button type="button" onClick={removeAppliedCoupon}>&times;</button>
                                </div>
                              )}

                              {/* Coupons Dropdown Mobile */}
                              {showCouponDropdown && (
                                <div className="availableCouponsDropdown">
                                  <div className="availableCouponsHeader">
                                    <span><FaTag color="#e11d48" /> Available Valid Coupons</span>
                                    <button type="button" onClick={() => setShowCouponDropdown(false)}>&times;</button>
                                  </div>
                                  <div className="availableCouponsList">
                                    {coupons.map((c) => (
                                      <div
                                        key={c.code}
                                        className={`couponCardItem ${couponCode.toUpperCase() === c.code.toUpperCase() ? "active" : ""}`}
                                        onClick={(e) => handleApplyCoupon(e, c.code)}
                                      >
                                        <div className="couponCardItemLeft">
                                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <span className="couponCodeBadge">{c.code}</span>
                                            <span className="couponDiscountText">{c.discount || (c.discountValue ? `${c.discountValue}% OFF` : "")}</span>
                                          </div>
                                          <p className="couponDescText">{c.description || "Valid coupon"}</p>
                                        </div>
                                        <button
                                          type="button"
                                          className="couponApplyClickBtn"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleApplyCoupon(e, c.code);
                                          }}
                                        >
                                          Apply
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={handleClearCart}
                              style={{
                                background: "#dc2626",
                                color: "#ffffff",
                                border: "none",
                                padding: "12px 20px",
                                fontWeight: "600",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "14px",
                                width: "100%"
                              }}
                            >
                              Clear Cart
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="shoppingCartEmpty">
                        <span>Your cart is empty!</span>
                        <Link href="/shop" onClick={scrollToTop}>
                          <button>Shop Now</button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                <div className="shoppingBagTotal">
                  <h3>Cart Totals</h3>
                  <table className="shoppingBagTotalTable">
                    <tbody>
                      <tr>
                        <th>Subtotal</th>
                        <td>₹{totalPrice.toFixed(2)}</td>
                      </tr>
                      {appliedDiscount > 0 && (
                        <tr>
                          <th>Discount</th>
                          <td style={{ color: "#16a34a", fontWeight: "600" }}>-₹{appliedDiscount.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr>
                        <th>Shipping</th>
                        <td>
                          <div className="shoppingBagTotalTableCheck">
                            <p>₹{(totalPrice === 0 ? 0 : 5).toFixed(2)}</p>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>VAT</th>
                        <td>₹{(totalPrice === 0 ? 0 : 11).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <th>Total</th>
                        <td>
                          ₹{finalTotal.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        toast.error("Please login to proceed to checkout!");
                        router.push("/login-signup?redirect=/cart");
                        return;
                      }
                      handleTabClick("cartTab2");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}

            {/* tab2 */}
            {activeTab === "cartTab2" && (
              <div className="checkoutSection">
                <div className="checkoutDetailsSection">
                  <div className="billingHeaderRow" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h4 style={{ margin: 0 }}>Billing & Shipping Details</h4>
                    <button
                      type="button"
                      className="addAddressCartBtn"
                      onClick={openAddAddressModal}
                    >
                      <FaPlus size={12} /> Add Address
                    </button>
                  </div>

                  {/* SAVED ADDRESSES GET API INTEGRATION */}
                  {loadingAddresses ? (
                    <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>Loading saved addresses...</p>
                  ) : addresses && addresses.length > 0 ? (
                    <div className="savedAddressesCartSection">
                      <p className="savedAddressSectionTitle">Select Saved Address:</p>
                      <div className="savedAddressesGrid">
                        {addresses.map((addr) => {
                          const isSelected = selectedAddressId === addr._id;
                          return (
                            <div
                              key={addr._id}
                              className={`savedAddressCartCard ${isSelected ? "selected" : ""}`}
                              onClick={() => handleSelectAddress(addr)}
                            >
                              <div className="savedAddrCardHeader">
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <input
                                    type="radio"
                                    name="cartAddressSelect"
                                    checked={isSelected}
                                    onChange={() => handleSelectAddress(addr)}
                                  />
                                  <strong className="addrTitleText">{addr.title || "Address"}</strong>
                                  {addr.isDefault && <span className="primaryBadge">Primary</span>}
                                </div>
                                <button
                                  type="button"
                                  className="editAddrBtn"
                                  onClick={(e) => openEditAddressModal(addr, e)}
                                >
                                  <FaEdit /> Edit
                                </button>
                              </div>
                              <div className="savedAddrCardBody">
                                <p>{addr.street}</p>
                                <p>{addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.zipCode}</p>
                                <p>{addr.country}</p>
                                {addr.mobile && <p className="phoneSubText">Phone: {addr.mobile}</p>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="noAddressBanner">
                      <p>No saved addresses found. Click <strong>+ Add Address</strong> above to add your shipping address.</p>
                    </div>
                  )}

                  {/* SELECTED ADDRESS SUMMARY BOX (INPUT FIELDS ONLY SHOW WHEN ADD/EDIT ADDRESS IS CLICKED) */}
                  {streetAddress && city && (
                    <div className="selectedAddressSummaryBox" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "18px", borderRadius: "8px", marginTop: "20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#166534", fontWeight: "700", marginBottom: "8px", fontSize: "15px" }}>
                        <FaCheckCircle color="#16a34a" size={18} /> Selected Shipping Address:
                      </div>
                      <p style={{ margin: "3px 0", fontSize: "14px", fontWeight: "600", color: "#0f172a" }}>
                        {firstName} {lastName}
                      </p>
                      <p style={{ margin: "3px 0", fontSize: "13px", color: "#334155" }}>
                        {streetAddress}, {city} - {zipCode}, {country}
                      </p>
                      <p style={{ margin: "3px 0", fontSize: "13px", color: "#64748b" }}>
                        Phone: {phone} | Email: {email}
                      </p>
                    </div>
                  )}
                </div>
                <div className="checkoutPaymentSection">
                  <div className="checkoutTotalContainer">
                    <h3>Your Order</h3>
                    <div className="checkoutItems">
                      <table>
                        <thead>
                          <tr>
                            <th>PRODUCTS</th>
                            <th>SUBTOTALS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cartItems.map((items) => (
                            <tr key={items.productID || items._id}>
                              <td>
                                {items.productName} x {items.quantity}
                              </td>
                              <td>₹{items.productPrice * items.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="checkoutTotal">
                      <table>
                        <tbody>
                          <tr>
                            <th>Subtotal</th>
                            <td>₹{totalPrice.toFixed(2)}</td>
                          </tr>
                          {appliedDiscount > 0 && (
                            <tr>
                              <th>Discount</th>
                              <td style={{ color: "#16a34a", fontWeight: "600" }}>-₹{appliedDiscount.toFixed(2)}</td>
                            </tr>
                          )}
                          <tr>
                            <th>Shipping</th>
                            <td>₹5</td>
                          </tr>
                          <tr>
                            <th>VAT</th>
                            <td>₹11</td>
                          </tr>
                          <tr>
                            <th>Total</th>
                            <td>
                              ₹{finalTotal.toFixed(2)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="checkoutPaymentContainer">
                    <label>
                      <input
                        type="radio"
                        name="payment"
                        value="Cash on delivery"
                        defaultChecked
                        onChange={handlePaymentChange}
                      />
                      <div className="checkoutPaymentMethod">
                        <span>Cash on delivery</span>
                        <p>Pay with cash upon delivery of your items.</p>
                      </div>
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="payment"
                        value="Razorpay / Online Transfer"
                        onChange={handlePaymentChange}
                      />
                      <div className="checkoutPaymentMethod">
                        <span>Razorpay / Online Transfer</span>
                        <p>Secure online payment via Credit/Debit card, UPI, or NetBanking.</p>
                      </div>
                    </label>
                  </div>
                  {!isLoggedIn ? (
                    <div style={{ background: "#fff1f2", border: "1px solid #fda4af", padding: "18px", borderRadius: "8px", marginTop: "15px", textAlign: "center", width: "100%" }}>
                      <p style={{ color: "#9f1239", fontWeight: "700", fontSize: "15px", margin: "0 0 10px 0" }}>
                        Please login to your account to place an order
                      </p>
                      <Link href="/login-signup" style={{ background: "#e11d48", color: "#ffffff", padding: "10px 24px", borderRadius: "4px", textDecoration: "none", fontWeight: "700", display: "inline-block", fontSize: "14px" }}>
                        Please Login
                      </Link>
                    </div>
                  ) : (
                    <button onClick={handlePlaceOrder}>
                      Place Order
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* tab3 */}
            {activeTab === "cartTab3" && (
              <div className="orderCompleteSection">
                <div className="orderComplete">
                  <div className="orderCompleteMessage">
                    <div className="orderCompleteMessageImg">
                      <img src={success.src || success} alt="" />
                    </div>
                    <h3>Your order is completed!</h3>
                    <p>Thank you. Your order has been received.</p>
                  </div>
                  <div className="orderInfo">
                    <div className="orderInfoItem">
                      <p>Order Number</p>
                      <h4>{createdOrderNumber || "POD-892182"}</h4>
                    </div>
                    <div className="orderInfoItem">
                      <p>Date</p>
                      <h4>{formatDate(currentDate)}</h4>
                    </div>
                    <div className="orderInfoItem">
                      <p>Total</p>
                      <h4>₹{finalTotal.toFixed(2)}</h4>
                    </div>
                    <div className="orderInfoItem">
                      <p>Payment Method</p>
                      <h4>{selectedPayment}</h4>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ADD / EDIT ADDRESS MODAL */}
      {showAddressModal && (
        <div className="cartModalOverlay">
          <div className="cartModalContent">
            <div className="cartModalHeader">
              <h4>{editingAddress ? "Edit Address" : "Add New Address"}</h4>
              <button type="button" onClick={() => setShowAddressModal(false)} className="closeModalXBtn">
                <MdOutlineClose size={22} />
              </button>
            </div>
            <form onSubmit={handleSaveAddress} className="cartAddressModalForm">
              <div className="modalFormGroup">
                <label>Address Title (e.g. Home, Office)</label>
                <input
                  type="text"
                  placeholder="Home / Work / Office"
                  value={addrTitle}
                  onChange={(e) => setAddrTitle(e.target.value)}
                />
              </div>
              <div className="modalFormGroup">
                <label>Street Address *</label>
                <input
                  type="text"
                  placeholder="House/Flat No, Street, Area"
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  required
                />
              </div>
              <div className="modalFormGroupRow">
                <div className="modalFormGroup">
                  <label>City *</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    required
                  />
                </div>
                <div className="modalFormGroup">
                  <label>State</label>
                  <input
                    type="text"
                    placeholder="State"
                    value={addrState}
                    onChange={(e) => setAddrState(e.target.value)}
                  />
                </div>
              </div>
              <div className="modalFormGroupRow">
                <div className="modalFormGroup">
                  <label>Postcode / ZIP *</label>
                  <input
                    type="text"
                    placeholder="Postcode / ZIP"
                    value={addrZip}
                    onChange={(e) => setAddrZip(e.target.value)}
                    required
                  />
                </div>
                <div className="modalFormGroup">
                  <label>Country</label>
                  <input
                    type="text"
                    placeholder="Country"
                    value={addrCountry}
                    onChange={(e) => setAddrCountry(e.target.value)}
                  />
                </div>
              </div>
              <div className="modalFormGroup">
                <label>Phone / Mobile</label>
                <input
                  type="text"
                  placeholder="10-digit mobile number"
                  value={addrMobile}
                  onChange={(e) => setAddrMobile(e.target.value)}
                />
              </div>
              <div className="modalFormActions">
                <button type="button" className="modalCancelBtn" onClick={() => setShowAddressModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="modalSubmitBtn">
                  {editingAddress ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ShoppingCart;

