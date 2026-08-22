"use client";

import React from "react";
import Error from "../Components/Error/Error";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body>
        <Error />
      </body>
    </html>
  );
}
