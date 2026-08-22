"use client";

import React from "react";
import Link from "next/link";
import "./ShippingPage.css";
import { FiTruck, FiClock, FiMapPin, FiPackage, FiAlertCircle, FiArrowLeft } from "react-icons/fi";

const ShippingPage = () => {
  return (
    <div className="shippingPageWrapper">
      <div className="shippingContainer">
        
        {/* Header */}
        <div className="shippingHeader">
          <div className="shippingBadge">
            <FiPackage /> Fast & Reliable Dispatch
          </div>
          <h1>Shipping & Delivery Policy</h1>
          <p>
            Everything you need to know about our print production timelines, courier partners, and order delivery.
          </p>
        </div>

        {/* Content */}
        <div className="shippingBody">

          {/* Cards */}
          <div className="shippingGridCards">
            <div className="shippingFeatureCard">
              <div className="shippingFeatureIcon">
                <FiClock />
              </div>
              <h4>2-3 Days Printing</h4>
              <p>Custom orders are printed & quality inspected within 48-72 hours.</p>
            </div>
            <div className="shippingFeatureCard">
              <div className="shippingFeatureIcon">
                <FiTruck />
              </div>
              <h4>Free Delivery</h4>
              <p>Enjoy complimentary shipping across India on orders over ₹499.</p>
            </div>
            <div className="shippingFeatureCard">
              <div className="shippingFeatureIcon">
                <FiMapPin />
              </div>
              <h4>All-India Coverage</h4>
              <p>We deliver to 27,000+ PIN codes via top courier networks.</p>
            </div>
          </div>

          {/* Timelines */}
          <div className="shippingSection">
            <h3 className="shippingSectionTitle">
              <FiClock color="#c22928" /> Estimated Delivery Timeframes
            </h3>
            <div className="shippingTableWrapper">
              <table className="shippingTable">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Production Time</th>
                    <th>Transit Time</th>
                    <th>Total Estimated Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Metro Cities (Delhi, Mumbai, BLR, etc.)</strong></td>
                    <td>1-2 Business Days</td>
                    <td>2-3 Business Days</td>
                    <td className="highlight">3-5 Business Days</td>
                  </tr>
                  <tr>
                    <td><strong>Rest of India (Tier 2 & 3 Cities)</strong></td>
                    <td>2 Business Days</td>
                    <td>4-5 Business Days</td>
                    <td>5-7 Business Days</td>
                  </tr>
                  <tr>
                    <td><strong>Special Custom Bulk Orders</strong></td>
                    <td>3-4 Business Days</td>
                    <td>3-5 Business Days</td>
                    <td>7-9 Business Days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Tracking */}
          <div className="shippingSection">
            <h3 className="shippingSectionTitle">
              <FiPackage color="#c22928" /> Real-time Order Tracking
            </h3>
            <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6" }}>
              As soon as your custom order is printed and packed, you will receive an automated SMS & Email with your unique Tracking ID and direct tracking link. You can also view live tracking anytime inside your <Link href="/account" style={{ color: "#c22928", fontWeight: "600" }}>Account Dashboard</Link>.
            </p>
          </div>

          {/* Shipping Charges */}
          <div className="shippingSection">
            <h3 className="shippingSectionTitle">
              <FiTruck color="#c22928" /> Shipping Fee Breakdown
            </h3>
            <ul className="shippingList">
              <li><strong>Orders above ₹499:</strong> Absolutely FREE standard shipping across India.</li>
              <li><strong>Orders below ₹499:</strong> Flat nominal shipping fee of ₹49 per order.</li>
              <li><strong>Cash on Delivery (COD):</strong> Optional flat handling fee of ₹30 applies to COD orders.</li>
            </ul>
          </div>

          {/* Alert Notice */}
          <div className="shippingNoticeBox">
            <FiAlertCircle size={20} />
            <div>
              <strong>Need urgent delivery for an event or gift?</strong> Contact our priority support before ordering at <a href="mailto:sale@printmyway.com" style={{ textDecoration: "underline" }}>sale@printmyway.com</a> or call +91 80 7123 4567.
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <Link href="/shop" className="shippingBackBtn">
              <FiArrowLeft /> Continue Shopping
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ShippingPage;
