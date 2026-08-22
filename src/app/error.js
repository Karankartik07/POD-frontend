"use client";

import React, { useEffect } from "react";
import Error from "../Components/Error/Error";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error("App boundary error:", error);
  }, [error]);

  return <Error />;
}
