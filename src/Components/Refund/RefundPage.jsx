"use client";

import React from "react";
import Link from "next/link";
import "./RefundPage.css";
import { FiRefreshCw, FiShieldOff, FiCheckCircle, FiFileText, FiArrowLeft, FiMail } from "react-icons/fi";

const RefundPage = () => {
  return (
    <div className="refundPageWrapper">
      <div className="refundContainer">
        
        {/* Header */}
        <div className="refundHeader">
          <div className="refundBadge">
            <FiShieldOff /> 100% Hassle-Free Guarantee
          </div>
          <h1>Refund & Return Policy</h1>
          <p>
            We stand behind our custom print quality. Here is everything regarding replacements, returns, and refund processing.
          </p>
        </div>

        {/* Content */}
        <div className="refundBody">

          {/* Quick Promise */}
          <div className="refundGridPromise">
            <div className="refundPromiseCard green">
              <h3>
                <FiCheckCircle color="#16a34a" /> 7-Day Free Replacement
              </h3>
              <p>
                If your order arrives damaged, defective, misprinted, or with size mismatch, we send a brand-new free replacement within 24 hours of reporting!
              </p>
            </div>

            <div className="refundPromiseCard blue">
              <h3>
                <FiRefreshCw color="#2563eb" /> Instant Wallet / Bank Refund
              </h3>
              <p>
                Approved refunds are processed back to your original source account (UPI, Credit Card, Netbanking) within 3-5 business days.
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="refundSection">
            <h3 className="refundSectionTitle">
              <FiFileText color="#c22928" /> Eligibility for Returns & Replacements
            </h3>
            <ul className="refundList">
              <li>
                <strong>Defective or Misprinted Merchandise:</strong> If the print quality, apparel fabric, or custom design has visible flaws, we issue an immediate replacement at zero extra cost.
              </li>
              <li>
                <strong>Wrong Size Received:</strong> If you received a size different from your ordered size specifications, we exchange it free of charge.
              </li>
              <li>
                <strong>Order Cancellation:</strong> Custom print orders can be cancelled for 100% refund within <strong style={{ color: "#c22928" }}>2 hours of placement</strong> before entering the printing queue.
              </li>
            </ul>
          </div>

          {/* Step by Step */}
          <div className="refundSection">
            <h3 className="refundSectionTitle">How to Request a Return / Refund</h3>
            <div className="refundSteps">
              <div className="refundStepItem">
                <div className="refundStepNum">1</div>
                <div>
                  <h4>Take a Photo / Video</h4>
                  <p>Snap a clear picture or unboxing video of the defective item and barcode tag.</p>
                </div>
              </div>
              <div className="refundStepItem">
                <div className="refundStepNum">2</div>
                <div>
                  <h4>Email or WhatsApp Support</h4>
                  <p>Send your Order ID and photo to <a href="mailto:sale@printmyway.com" style={{ color: "#c22928", fontWeight: "600" }}>sale@printmyway.com</a> or message +91 80 7123 4567.</p>
                </div>
              </div>
              <div className="refundStepItem">
                <div className="refundStepNum">3</div>
                <div>
                  <h4>Instant Verification & Replacement</h4>
                  <p>Our QC team verifies the issue within 4 hours and dispatches your replacement order immediately.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Box */}
          <div className="refundContactBox">
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <FiMail size={28} color="#f87171" />
              <div>
                <h4>Need help with an ongoing return?</h4>
                <p>Our customer team is available Monday to Saturday (9 AM - 8 PM IST)</p>
              </div>
            </div>
            <Link href="/contact" className="refundContactBtn">
              Contact Support
            </Link>
          </div>

          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <Link href="/shop" style={{ color: "#475569", textDecoration: "none", fontSize: "14px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <FiArrowLeft /> Back to Shop
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RefundPage;
