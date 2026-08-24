"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useDispatch } from "react-redux";
import { setCartItemsRedux } from "../Features/Cart/cartSlice";
import toast from "react-hot-toast";
import api from "../utils/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const { token } = useAuth();
  const dispatch = useDispatch();

  // Sync to Redux store whenever cartItems change
  useEffect(() => {
    if (dispatch && typeof setCartItemsRedux === "function") {
      dispatch(setCartItemsRedux(cartItems));
    }
  }, [cartItems, dispatch]);

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    if (!token) {
      setCartLoading(false);
      return;
    }
    try {
      setCartLoading(true);
      const data = await api.getCart();
      if (data.success && data.data) {
        const items = data.data.items || [];
        const formatted = items
          .map((it) => {
            if (!it.product) return null;
            const p = it.product;
            return {
              id: p._id || p.id,
              _id: p._id || p.id,
              productId: p._id || p.id,
              productID: p._id || p.id,
              name: p.name,
              productName: p.name,
              price: p.salePrice || p.price || 0,
              productPrice: p.salePrice || p.price || 0,
              image: p.mainImage || (p.images && p.images[0]) || "",
              frontImg: p.mainImage || (p.images && p.images[0]) || "",
              quantity: it.quantity,
              inventory: p.inventory ?? 999,
              productReviews: `${p.numReviews || 0} reviews`,
              product: p,
            };
          })
          .filter(Boolean);
        setCartItems(formatted);
      }
    } catch (err) {
      console.warn("Fetch cart error:", err);
    } finally {
      setCartLoading(false);
    }
  }, [token]);

  // Load from local storage or fetch backend cart
  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      if (typeof window !== "undefined") {
        const localCart = localStorage.getItem("vardaan_cart");
        if (localCart) {
          try {
            setCartItems(JSON.parse(localCart));
          } catch (e) {
            setCartItems([]);
          }
        }
      }
      setCartLoading(false);
    }
  }, [token, fetchCart]);

  // Save to local storage when guest
  const saveToLocal = (items) => {
    if (!token && typeof window !== "undefined") {
      localStorage.setItem("vardaan_cart", JSON.stringify(items));
    }
  };

  // Sync local cart to database upon login
  useEffect(() => {
    const syncLocalCart = async () => {
      if (token && typeof window !== "undefined") {
        const localCart = localStorage.getItem("vardaan_cart");
        if (localCart) {
          try {
            const items = JSON.parse(localCart);
            if (items && items.length > 0) {
              for (const item of items) {
                await api.addToCart(item.productId || item.id || item._id, item.quantity);
              }
              localStorage.removeItem("vardaan_cart");
              await fetchCart();
            }
          } catch (e) {
            console.warn("Local cart sync error:", e);
          }
        }
      }
    };
    syncLocalCart();
  }, [token, fetchCart]);

  const addToCart = useCallback(
    async (product, qty = 1) => {
      const pId = product._id || product.id || product.productID || product.productId;
      const pName = product.name || product.productName || "Product";
      const pPrice = product.salePrice || product.productPrice || product.price || 0;
      const pImage =
        product.mainImage ||
        product.frontImg?.src ||
        product.frontImg ||
        product.image ||
        (product.images && product.images[0]) ||
        "";

      const maxStock = Number(
        product.inventory ?? (product.product?.inventory ?? 999)
      );

      // Check existing quantity in cart
      const existing = cartItems.find(
        (i) => i.id === pId || i._id === pId || i.productId === pId
      );
      const currentQty = existing ? existing.quantity : 0;

      if (maxStock >= 0 && currentQty + qty > maxStock) {
        toast.error(`Cannot add item! Stock limit is ${maxStock} item(s).`, {
          duration: 3000,
          style: { background: "#dc2626", color: "#fff" },
        });
        return;
      }

      const newItem = {
        id: pId,
        _id: pId,
        productId: product.productId || pId,
        productID: product.productId || pId,
        name: pName,
        productName: pName,
        price: pPrice,
        productPrice: pPrice,
        image: pImage,
        frontImg: pImage,
        quantity: qty,
        inventory: maxStock,
        productReviews: `${product.numReviews || 0} reviews`,
        product: product,
        isCustom: product.isCustom || false,
        krDesignId: product.krDesignId || null,
        designData: product.designData || null,
      };

      if (token) {
        try {
          await api.addToCart(pId, qty, {
            isCustom: product.isCustom,
            krDesignId: product.krDesignId,
            designData: product.designData,
          });
          await fetchCart();
        } catch (err) {
          console.warn("Add to cart API error:", err);
          // Fallback to local cart state if backend request fails
          setCartItems((prev) => {
            const idx = prev.findIndex((item) => item.id === pId || item._id === pId);
            let updated;
            if (idx > -1) {
              updated = prev.map((item, i) =>
                i === idx ? { ...item, quantity: item.quantity + qty } : item
              );
            } else {
              updated = [...prev, newItem];
            }
            saveToLocal(updated);
            return updated;
          });
        }
      } else {
        setCartItems((prev) => {
          const idx = prev.findIndex((item) => item.id === pId || item._id === pId);
          let updated;
          if (idx > -1) {
            updated = prev.map((item, i) =>
              i === idx ? { ...item, quantity: item.quantity + qty } : item
            );
          } else {
            updated = [...prev, newItem];
          }
          saveToLocal(updated);
          return updated;
        });
      }

      setIsCartOpen(true);
    },
    [token, fetchCart, cartItems]
  );

  const removeFromCart = useCallback(
    async (id) => {
      setCartItems((prev) => {
        const updated = prev.filter(
          (item) =>
            item.id !== id &&
            item._id !== id &&
            item.productId !== id &&
            item.productID !== id
        );
        saveToLocal(updated);
        return updated;
      });

      if (token) {
        try {
          await api.removeFromCart(id);
          await fetchCart();
        } catch (err) {
          console.warn("Remove from cart API error:", err);
        }
      }
    },
    [token, fetchCart]
  );

  const updateQuantity = useCallback(
    async (id, newQuantity) => {
      const item = cartItems.find(
        (i) => i.id === id || i._id === id || i.productId === id || i.productID === id
      );
      if (!item) return;

      const targetQty = Number(newQuantity);
      if (isNaN(targetQty) || targetQty < 1) return;

      const maxStock = Number(
        item.inventory ?? (item.product?.inventory ?? 999)
      );

      if (maxStock >= 0 && targetQty > maxStock) {
        toast.error(`Cannot increase quantity! Stock limit is ${maxStock} item(s).`, {
          duration: 3000,
          style: { background: "#dc2626", color: "#fff" },
        });
        return;
      }

      setCartItems((prev) => {
        const updated = prev.map((i) =>
          i.id === id || i._id === id || i.productId === id || i.productID === id
            ? { ...i, quantity: targetQty }
            : i
        );
        saveToLocal(updated);
        return updated;
      });

      if (token) {
        try {
          await api.updateCartItem(id, targetQty);
        } catch (err) {
          console.warn("Update quantity API error:", err);
        }
      }
    },
    [token, cartItems]
  );

  const clearCart = useCallback(async () => {
    if (token) {
      try {
        await api.clearCart();
        setCartItems([]);
      } catch (err) {
        console.warn("Clear cart API error:", err);
      }
    } else {
      setCartItems([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem("vardaan_cart");
      }
    }
  }, [token]);

  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const openCart = useCallback(() => setIsCartOpen(true), []);

  return (
    <CartContext.Provider
      value={{
        isCartOpen,
        cartItems,
        cartLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        closeCart,
        openCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

export default CartContext;
