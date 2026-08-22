"use client";

import React, { useState } from "react";
import "./Navbar.css";

import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../Features/Auth/authSlice";

const logo = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230546/pod_assets/logo.png";
import Link from "next/link";

import { RiMenu2Line } from "react-icons/ri";
import { FiSearch } from "react-icons/fi";
import { FaRegUser } from "react-icons/fa6";
import { RiShoppingBagLine } from "react-icons/ri";
import { MdOutlineClose } from "react-icons/md";
import { FiHeart } from "react-icons/fi";
import { FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaInstagram } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";
import { FaPinterest } from "react-icons/fa";

import Badge from "@mui/material/Badge";
import toast from "react-hot-toast";

import { useCart } from "../../context/CartContext";

const Navbar = () => {
  const { openCart, cartItems } = useCart();
  const cart = useSelector((state) => state.cart);
  const wishlist = useSelector((state) => state.wishlist);
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (typeof document !== "undefined") {
      document.body.style.overflow = mobileMenuOpen ? "auto" : "hidden";
    }
  };

  const scrollToTop = () => {
    setMobileMenuOpen(false);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "auto";
    }
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
  };

  return (
    <>
      {/* Desktop Menu */}
      <nav className="navBar">
        <div className="logoLinkContainer">
          <div className="logoContainer">
            <Link href="/">
              <img src={logo.src || logo} alt="Logo" style={{ maxWidth: "160px", height: "auto" }} />
            </Link>
          </div>
          <div className="linkContainer">
            <ul>
              <li>
                <Link href="/">
                  HOME
                </Link>
              </li>
              <li>
                <Link href="/shop">
                  SHOP
                </Link>
              </li>
              <li>
                <Link href="/blog">
                  BLOG
                </Link>
              </li>
              <li>
                <Link href="/about">
                  ABOUT
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  CONTACT
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="iconContainer">
          <Link href="/shop">
            <FiSearch size={22} />
          </Link>
          {auth.user ? (
            <Link href="/account" className="navUserProfile">
              {auth.user.avatar ? (
                <img src={auth.user.avatar} alt={auth.user.name} className="navAvatarImg" />
              ) : (
                <div className="navAvatarBadge">
                  {auth.user.name ? auth.user.name[0].toUpperCase() : "U"}
                </div>
              )}
              <span className="navUserName">Hi, {auth.user.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link href="/login-signup">
              <FaRegUser size={22} />
            </Link>
          )}
          <Link href="/cart">
            <Badge
              badgeContent={cartItems.length === 0 ? "0" : cartItems.length}
              color="primary"
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
            >
              <RiShoppingBagLine size={22} />
            </Badge>
          </Link>
          <Link href="/wishlist">
            <Badge
              badgeContent={wishlist.items.length === 0 ? "0" : wishlist.items.length}
              color="secondary"
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
            >
              <FiHeart size={22} />
            </Badge>
          </Link>
        </div>
      </nav>

      {/* Mobile Menu */}
      <nav>
        <div className="mobile-nav">
          {mobileMenuOpen ? (
            <MdOutlineClose size={22} onClick={toggleMobileMenu} />
          ) : (
            <RiMenu2Line size={22} onClick={toggleMobileMenu} />
          )}
          <div className="logoContainer">
            <Link href="/">
              <img src={logo.src || logo} alt="Logo" style={{ maxWidth: "160px", height: "auto" }} />
            </Link>
          </div>
          <Link href="/cart">
            <Badge
              badgeContent={cart.items.length === 0 ? "0" : cart.items.length}
              color="primary"
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
            >
              <RiShoppingBagLine size={22} color="black" />
            </Badge>
          </Link>
        </div>
        <div className={`mobile-menu ${mobileMenuOpen ? "open" : ""}`}>
          <div className="mobile-menuTop">
            <div className="mobile-menuSearchBar">
              <div className="mobile-menuSearchBarContainer">
                <input type="text" placeholder="Search products" />
                <Link href="/shop">
                  <FiSearch size={22} onClick={toggleMobileMenu} />
                </Link>
              </div>
            </div>
            <div className="mobile-menuList">
              <ul>
                <li>
                  <Link href="/" onClick={toggleMobileMenu}>
                    HOME
                  </Link>
                </li>
                <li>
                  <Link href="/shop" onClick={toggleMobileMenu}>
                    SHOP ALL
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Men" onClick={toggleMobileMenu}>
                    MEN
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Women" onClick={toggleMobileMenu}>
                    WOMEN
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Kids" onClick={toggleMobileMenu}>
                    KIDS
                  </Link>
                </li>
                <li>
                  <Link href="/wishlist" onClick={toggleMobileMenu}>
                    WISHLIST ({wishlist.items.length})
                  </Link>
                </li>
                <li>
                  <Link href="/blog" onClick={toggleMobileMenu}>
                    BLOG
                  </Link>
                </li>
                <li>
                  <Link href="/about" onClick={toggleMobileMenu}>
                    ABOUT
                  </Link>
                </li>
                <li>
                  <Link href="/contact" onClick={toggleMobileMenu}>
                    CONTACT
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mobile-menuFooter">
            <div className="mobile-menuFooterLogin">
              {auth.user ? (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Link href="/account" onClick={toggleMobileMenu} style={{ textDecoration: "none", color: "inherit", fontWeight: "600" }}>
                    My Account ({auth.user.name})
                  </Link>
                  <button onClick={handleLogout} style={{ padding: "4px 8px", cursor: "pointer" }}>Logout</button>
                </div>
              ) : (
                <Link href="/login-signup" onClick={toggleMobileMenu}>
                  <FaRegUser />
                  <p>My Account / Login</p>
                </Link>
              )}
            </div>
            <div className="mobile-menuFooterLangCurrency">
              <div className="mobile-menuFooterLang">
                <p>Language</p>
                <select name="language" id="language">
                  <option value="english">United States | English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Germany">Germany</option>
                  <option value="French">French</option>
                </select>
              </div>
              <div className="mobile-menuFooterCurrency">
                <p>Currency</p>
                <select name="currency" id="currency">
                  <option value="USD">$ USD</option>
                  <option value="INR">₹ INR</option>
                  <option value="EUR">€ EUR</option>
                  <option value="GBP">£ GBP</option>
                </select>
              </div>
            </div>
            <div className="mobile-menuSocial_links">
              <FaFacebookF />
              <FaXTwitter />
              <FaInstagram />
              <FaYoutube />
              <FaPinterest />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
