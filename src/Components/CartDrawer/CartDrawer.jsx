"use client";

import React, { useEffect, useState } from "react";
import "./CartDrawer.css";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MdOutlineClose, MdCheckCircle } from "react-icons/md";
import toast from "react-hot-toast";
import api from "../../utils/api";

const CartDrawer = () => {
  const { isCartOpen, closeCart, cartItems, addToCart, removeFromCart, updateQuantity } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [recommended, setRecommended] = useState([]);
  const isLoggedIn = Boolean(user || (typeof window !== "undefined" && localStorage.getItem("token")));

  useEffect(() => {
    async function loadRecommended() {
      try {
        const data = await api.getProducts({ limit: 10 });
        if (data.success && data.data) {
          const prods = data.data.products || data.data;
          setRecommended(prods);
        }
      } catch (err) {
        console.warn("Could not load recommendations:", err);
      }
    }
    if (isCartOpen && recommended.length === 0) {
      loadRecommended();
    }
  }, [isCartOpen, recommended.length]);

  // Filter recommended items to exclude products ALREADY in the cart
  const filteredRecommended = recommended.filter(
    (rec) => !cartItems.some((cartItem) => (cartItem._id || cartItem.id) === rec._id)
  );

  const subtotal = cartItems.reduce((acc, item) => {
    const p = item.salePrice || item.price || 0;
    return acc + p * (item.quantity || 1);
  }, 0);

  const handleProceedCheckout = (e) => {
    e.preventDefault();
    closeCart();
    if (!isLoggedIn) {
      toast.error("Please login to proceed to checkout!");
      router.push("/login-signup?redirect=/cart");
    } else {
      router.push("/cart");
    }
  };

  return (
    <>
      <div
        className={`cartDrawerOverlay ${isCartOpen ? "open" : ""}`}
        onClick={closeCart}
      />

      <div className={`cartDrawerContainer ${isCartOpen ? "open" : ""}`}>
        <div className="cartDrawerHeader">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MdCheckCircle color="#16a34a" size={22} />
            <h3>
              {cartItems.length === 0
                ? "Your bag is empty"
                : `${cartItems.length} item${cartItems.length > 1 ? "s" : ""} in your bag`}
            </h3>
          </div>
          <button className="closeCartBtn" onClick={closeCart}>
            <MdOutlineClose />
          </button>
        </div>

        <div className="cartDrawerContent">
          {/* ALL CART ITEMS LIST */}
          {cartItems.length > 0 ? (
            <div className="cartItemsList">
              {cartItems.map((item, idx) => {
                const id = item._id || item.id || idx;
                const img = item.image || item.mainImage || (item.images && item.images[0]);
                const unitPrice = item.salePrice || item.price || 0;

                return (
                  <div className="cartDrawerItemCard" key={id}>
                    <img src={img} alt={item.name} />
                    <div className="cartDrawerItemDetails">
                      <h4>{item.name}</h4>
                      <p className="itemPrice">₹{unitPrice}</p>
                      <div className="qtyControls">
                        <button onClick={() => updateQuantity(id, Math.max(1, item.quantity - 1))}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(id, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                    <button className="removeItemBtn" onClick={() => removeFromCart(id)}>
                      <MdOutlineClose />
                    </button>
                  </div>
                );
              })}
              <div className="cartDrawerSubtotal">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: "#777", textAlign: "center", padding: "30px 0" }}>
              No items in your bag yet.
            </p>
          )}

          <div className="cartDrawerActions">
            {cartItems.length > 0 && (
              <>
                <button onClick={handleProceedCheckout} className="checkoutBtn" style={{ width: "100%", border: "none", cursor: "pointer", display: "block" }}>
                  PROCEED TO CHECKOUT
                </button>
                <Link href="/cart" onClick={closeCart} className="viewCartDrawerBtn">
                  VIEW CART PAGE
                </Link>
              </>
            )}
            <button onClick={closeCart} className="continueBtn">
              CONTINUE SHOPPING
            </button>
          </div>

          {/* RECOMMENDED SECTION (Excludes items in cart) */}
          {filteredRecommended.length > 0 && (
            <div className="recommendedSection">
              <h4>You May Also Like</h4>
              <div className="recommendedList">
                {filteredRecommended.slice(0, 3).map((item) => (
                  <div key={item._id} className="recommendedCard">
                    <img src={item.mainImage || (item.images && item.images[0])} alt={item.name} />
                    <div className="recommendedCardInfo">
                      <h5>{item.name}</h5>
                      <p>₹{item.salePrice || item.price}</p>
                    </div>
                    <button
                      className="quickAddBtn"
                      onClick={() => addToCart(item, 1)}
                    >
                      + ADD
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
