"use client";

import React, { useState } from "react";
import Link from "next/link";
import "./CustomerServicePage.css";
import { FiHeadphones, FiMessageSquare, FiPhoneCall, FiMail, FiChevronDown, FiSearch, FiHelpCircle } from "react-icons/fi";

const CustomerServicePage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      q: "How do I track my order status?",
      a: "Once your order is printed and shipped, you will receive a tracking link via SMS & Email. You can also view live tracking details inside your Account dashboard under 'My Orders'."
    },
    {
      q: "Can I customize a product with my own logo or image?",
      a: "Yes! Use our 'Customize Your Product' tool or upload your high-resolution PNG/JPEG graphics directly on product pages before adding to cart."
    },
    {
      q: "What payment methods are supported?",
      a: "We accept all major payment modes including Credit/Debit Cards, UPI (GPay, PhonePe, Paytm), Netbanking, and Cash on Delivery (COD)."
    },
    {
      q: "What is your return & replacement policy?",
      a: "We offer a 7-day hassle-free replacement if your custom apparel or merch arrives defective, damaged, or size mismatched. Simply email sale@printmyway.com with order details."
    },
    {
      q: "How long does shipping take across India?",
      a: "Printing takes 1-2 business days, followed by 2-5 days transit depending on your city. Metro cities usually receive orders within 3-4 days total."
    },
    {
      q: "Do you offer bulk or corporate discounts?",
      a: "Yes! For bulk printing requirements (over 20 items for events, teams, or corporate gifting), contact our sales team at sale@printmyway.com for custom wholesale quotes."
    }
  ];

  const filteredFaqs = faqs.filter(
    (f) => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="csPageWrapper">
      <div className="csContainer">
        
        {/* Banner */}
        <div className="csBanner">
          <div className="csBadge">
            <FiHeadphones /> 24/7 Dedicated Support
          </div>
          <h1>Customer Service Center</h1>
          <p>
            We are here to help with your orders, custom prints, shipping status, and product inquiries.
          </p>

          <div className="csSearchBox">
            <FiSearch className="csSearchIcon" />
            <input
              type="text"
              placeholder="Search help topics, tracking, returns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="csSearchInput"
            />
          </div>
        </div>

        {/* Quick Contact Cards */}
        <div className="csCardsGrid">
          <div className="csCard">
            <div className="csCardIcon">
              <FiPhoneCall />
            </div>
            <h3>Call Us</h3>
            <p>Mon - Sat (9am - 8pm IST)</p>
            <a href="tel:+918071234567" className="csCardLink">+91 80 7123 4567</a>
          </div>

          <div className="csCard">
            <div className="csCardIcon">
              <FiMail />
            </div>
            <h3>Email Support</h3>
            <p>Response within 2-4 hours</p>
            <a href="mailto:sale@printmyway.com" className="csCardLink">sale@printmyway.com</a>
          </div>

          <div className="csCard">
            <div className="csCardIcon">
              <FiMessageSquare />
            </div>
            <h3>Support Form</h3>
            <p>Direct support request</p>
            <Link href="/contact" className="csCardLink">Open Form &rarr;</Link>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="csFaqBox">
          <div className="csFaqHeader">
            <FiHelpCircle size={26} color="#c22928" />
            <h2>Frequently Asked Questions</h2>
          </div>

          {filteredFaqs.length > 0 ? (
            <div className="csFaqList">
              {filteredFaqs.map((faq, idx) => (
                <div key={idx} className="csFaqItem">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="csFaqBtn"
                  >
                    <span>{faq.q}</span>
                    <FiChevronDown
                      style={{
                        transform: openFaq === idx ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                        color: openFaq === idx ? "#c22928" : "#64748b"
                      }}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="csFaqAnswer">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>No matching questions found for "{searchQuery}".</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default CustomerServicePage;
