"use client";

import React from "react";
import { Provider } from "react-redux";
import store from "../App/store";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import CartDrawer from "../Components/CartDrawer/CartDrawer";

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <CartProvider>
          {children}
          <CartDrawer />
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </Provider>
  );
}
