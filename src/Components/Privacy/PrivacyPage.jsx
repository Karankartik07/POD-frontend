"use client";

import React from "react";
import Link from "next/link";
import "./PrivacyPage.css";
import { FiShield, FiLock, FiEye, FiFileText, FiBell, FiHelpCircle } from "react-icons/fi";

const PrivacyPage = () => {
  return (
    <div className="privacyPageWrapper">
      <div className="privacyContainer">
        
        {/* Header */}
        <div className="privacyHeader">
          <div className="privacyBadge">
            <FiShield /> Legal & Transparency
          </div>
          <h1>Privacy Policy</h1>
          <p>
            At PrintMyWay (POD), we prioritize your privacy and data security. Learn how we handle and protect your personal information.
          </p>
          <div className="privacyUpdated">Last updated: August 2026</div>
        </div>

        {/* Content Body */}
        <div className="privacyBody">

          {/* Section 1 */}
          <div className="privacyCard">
            <div className="privacyCardHeader">
              <div className="privacyIconBox">
                <FiEye />
              </div>
              <h2>1. Information We Collect</h2>
            </div>
            <p>We collect information to provide better custom print products and seamless shopping experiences.</p>
            <ul className="privacyList">
              <li><strong>Personal Data:</strong> Name, email address, phone number, shipping address, and billing details provided during checkout or account creation.</li>
              <li><strong>Design Uploads:</strong> Images, graphics, and custom text uploaded for print customization.</li>
              <li><strong>Technical Details:</strong> IP address, browser type, device information, and site interaction cookies.</li>
            </ul>
          </div>

          {/* Section 2 */}
          <div className="privacyCard">
            <div className="privacyCardHeader">
              <div className="privacyIconBox">
                <FiFileText />
              </div>
              <h2>2. How We Use Your Information</h2>
            </div>
            <p>Your data is strictly used for order fulfillment and platform enhancement:</p>
            <div className="privacyGrid">
              <div className="privacyMiniBox">
                <h4>Order Processing & Fulfillment</h4>
                <p>Printing custom merchandise, processing payments, and dispatching packages to your address.</p>
              </div>
              <div className="privacyMiniBox">
                <h4>Customer Support & Updates</h4>
                <p>Sending order status alerts, tracking links, and answering customer service inquiries.</p>
              </div>
              <div className="privacyMiniBox">
                <h4>Security & Fraud Prevention</h4>
                <p>Protecting transactions and monitoring suspicious activity on our payment gateways.</p>
              </div>
              <div className="privacyMiniBox">
                <h4>Personalized Experience</h4>
                <p>Recommending relevant merchandise and custom templates based on your preferences.</p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="privacyCard">
            <div className="privacyCardHeader">
              <div className="privacyIconBox">
                <FiLock />
              </div>
              <h2>3. Data Security & Third-Party Sharing</h2>
            </div>
            <p>We never sell or rent your personal data or artwork to third parties. We share limited necessary data only with trusted partners:</p>
            <ul className="privacyList">
              <li>Logistics & Courier services (Delhivery, BlueDart, Razorpay/Stripe payment processors).</li>
              <li>Encrypted cloud storage providers hosting custom print assets securely.</li>
              <li>Compliance with legal obligations or government mandates when strictly required.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="privacyCard">
            <div className="privacyCardHeader">
              <div className="privacyIconBox">
                <FiBell />
              </div>
              <h2>4. Your Rights & Choices</h2>
            </div>
            <p>You have total control over your information:</p>
            <ul className="privacyList">
              <li>Request a copy or deletion of your account and personal data.</li>
              <li>Unsubscribe from promotional emails at any time via the link in footer.</li>
              <li>Modify your saved addresses and profile preferences in your Account settings.</li>
            </ul>
          </div>

          {/* Contact Box */}
          <div className="privacyContactBox">
            <div className="privacyContactLeft">
              <div className="privacyHelpIcon">
                <FiHelpCircle />
              </div>
              <div>
                <h4>Have questions about your privacy?</h4>
                <p>Reach out to our Data Protection Officer at sale@printmyway.com</p>
              </div>
            </div>
            <Link href="/contact" className="privacyContactBtn">
              Contact Support
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
