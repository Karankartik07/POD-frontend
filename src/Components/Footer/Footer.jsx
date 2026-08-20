"use client";

import React from "react";
import "./Footer.css";
const logo = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230546/pod_assets/logo.png";
const paymentIcon = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230550/pod_assets/paymentIcon.png";
import { FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaPinterest } from "react-icons/fa";

import Link from "next/link";

const Footer = () => {
  const handleSubscribe = (e) => {
    e.preventDefault();
    alert("Subscribed Successfully");
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  const getCurrentYear = () => new Date().getFullYear();

  return (
    <>
      <footer className="footer">
        <div className="footer__container">
          <div className="footer_left">
            <div className="footer_logo_container">
              <img src={logo.src || logo} alt="" />
            </div>

            <p>1418 River Drive, Suite 35 Cottonhall, CA 9622 United States</p>

            <div className="footer_address">
              <strong> sale@uomo.com </strong>
              <strong> +1 246-345-0695 </strong>
            </div>

            <div className="social_links">
              <FaFacebookF />
              <FaXTwitter />
              <FaInstagram />
              <FaYoutube />
              <FaPinterest />
            </div>
          </div>

          <div className="footer_content">
            <h5>Company</h5>
            <div className="links_container">
              <ul onClick={scrollToTop}>
                <li>
                  <Link href="/about">About Us</Link>
                </li>
                <li>
                  <Link href="/about">Career</Link>
                </li>
                <li>
                  <Link href="/terms">Affilates</Link>
                </li>
                <li>
                  <Link href="/blog">Blog</Link>
                </li>
                <li>
                  <Link href="/contact">Contact Us</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer_content">
            <h5>Shop</h5>
            <div className="links_container">
              <ul onClick={scrollToTop}>
                <li>
                  <Link href="/shop">New Arrivals</Link>
                </li>
                <li>
                  <Link href="/shop">Accessories</Link>
                </li>
                <li>
                  <Link href="/shop">Men</Link>
                </li>
                <li>
                  <Link href="/shop">Women</Link>
                </li>
                <li>
                  <Link href="/shop">Shop All</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer_content">
            <h5>Help</h5>
            <div className="links_container">
              <ul onClick={scrollToTop}>
                <li>
                  <Link href="/contact">Customer Service</Link>
                </li>
                <li>
                  <Link href="/login-signup">My Account</Link>
                </li>
                <li>
                  <Link href="/contact">Find a Store</Link>
                </li>
                <li>
                  <Link href="/terms">Legal & Privacy</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
                <li>
                  <Link href="/">Gift Card</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer_right">
            <h5>Subscribe</h5>
            <p>
              Be the first to get the latest news about trends, promotions, and
              much more!
            </p>

            <form onSubmit={handleSubscribe}>
              <input type="email" placeholder="Your email address" required />
              <button type="submit">Join</button>
            </form>

            <h6>Secure Payments</h6>
            <div className="paymentIconContainer">
              <img src={paymentIcon.src || paymentIcon} alt="" />
            </div>
          </div>
        </div>
        <div className="footer_bottom">
          <p>
            © {getCurrentYear()} POD. All Rights Reserved | Design and Developed By{" "}
            <a
              href="https://kusheldigi.com/"
              target="_blank"
              rel="noreferrer"
              style={{ color: "#C22928", textDecoration: "none" }}
            >
              Kushel Digi Solutions
            </a>{" "}
            
          </p>
          
        </div>
      </footer>
    </>
  );
};

export default Footer;
