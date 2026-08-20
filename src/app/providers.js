"use client";

import React from "react";
import { Provider } from "react-redux";
import store from "../App/store";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      {children}
      <Toaster />
    </Provider>
  );
}
