"use client";

import React from "react";
import "./Banner.css";

import Link from "next/link";

const Banner = () => {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  return (
    <>
      <div className="banner">
        <div className="bannerLeft">
          <h6 className="bannerh6">Starting At ₹499</h6>
          <h3 className="bannerh3">Women's T-shirts</h3>
          <h5 className="bannerh5">
            <Link href="/shop" onClick={scrollToTop} style={{ color: "white" }}>
              Shop Now
            </Link>
          </h5>
        </div>
        <div className="bannerRight">
          <h6 className="bannerh6" style={{ color: "black" }}>
            Starting At ₹999
          </h6>
          <h3 className="bannerh3" style={{ color: "black" }}>
            Men's Sportswear
          </h3>
          <h5 className="bannerh5">
            <Link href="/shop" onClick={scrollToTop} style={{ color: "black" }}>
              Shop Now
            </Link>
          </h5>
        </div>
      </div>
    </>
  );
};

export default Banner;
