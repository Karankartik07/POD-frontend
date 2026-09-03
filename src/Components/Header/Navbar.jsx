"use client";

import React, { useState } from "react";
import "./Navbar.css";

import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../Features/Auth/authSlice";
import { fetchWishlistThunk } from "../../Features/Wishlist/wishListSlice";

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

import { useRouter } from "next/navigation";
import { FiChevronRight } from "react-icons/fi";

const Navbar = () => {
  const router = useRouter();
  const { openCart, cartItems } = useCart();
  const cart = useSelector((state) => state.cart);
  const wishlist = useSelector((state) => state.wishlist);
  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  React.useEffect(() => {
    setIsMounted(true);
    if (dispatch) {
      dispatch(fetchWishlistThunk());
    }
  }, [dispatch]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => {
      const nextState = !prev;
      if (typeof document !== "undefined") {
        document.body.style.overflow = nextState ? "hidden" : "auto";
      }
      return nextState;
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (mobileMenuOpen) {
        toggleMobileMenu();
      }
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
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
                <Link href="/customize">
                  CUSTOMIZE
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
              badgeContent={!isMounted || cartItems.length === 0 ? "0" : cartItems.length}
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
              badgeContent={!isMounted || wishlist.items.length === 0 ? "0" : wishlist.items.length}
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

      {/* Mobile Menu Backdrop Overlay */}
      <div
        className={`mobile-menu-overlay ${mobileMenuOpen ? "open" : ""}`}
        onClick={toggleMobileMenu}
      />

      {/* Mobile Menu */}
      <nav>
        <div className="mobile-nav">
          <button className="mobile-toggle-btn" onClick={toggleMobileMenu} aria-label="Toggle Menu">
            {mobileMenuOpen ? (
              <MdOutlineClose size={24} />
            ) : (
              <RiMenu2Line size={24} />
            )}
          </button>
          <div className="logoContainer">
            <Link href="/">
              <img src={logo.src || logo} alt="Logo" style={{ maxWidth: "140px", height: "auto" }} />
            </Link>
          </div>
          <Link href="/cart">
            <Badge
              badgeContent={!isMounted || cartItems.length === 0 ? "0" : cartItems.length}
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
          <div className="mobile-menu-header">
            <div className="mobile-menu-brand">
              <Link href="/" onClick={toggleMobileMenu}>
                <img src={logo.src || logo} alt="POD Logo" />
              </Link>
            </div>
            <button className="mobile-menu-close-btn" onClick={toggleMobileMenu} aria-label="Close menu">
              <MdOutlineClose size={22} />
            </button>
          </div>

          <div className="mobile-menuTop">
            <form onSubmit={handleSearchSubmit} className="mobile-menuSearchBar">
              <div className="mobile-menuSearchBarContainer">
                <FiSearch className="mobile-search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button type="button" className="clear-search-btn" onClick={() => setSearchQuery("")}>
                    <MdOutlineClose size={16} />
                  </button>
                )}
              </div>
            </form>

            <div className="mobile-menuList">
              <ul>
                <li>
                  <Link href="/" onClick={toggleMobileMenu} className="mobile-nav-link">
                    <span>HOME</span>
                    <FiChevronRight size={18} />
                  </Link>
                </li>
                <li>
                  <Link href="/shop" onClick={toggleMobileMenu} className="mobile-nav-link">
                    <span>SHOP ALL</span>
                    <FiChevronRight size={18} />
                  </Link>
                </li>
                <li>
                  <Link href="/customize" onClick={toggleMobileMenu} className="mobile-nav-link highlight-link">
                    <span className="link-with-badge">
                      CUSTOMIZE
                      <span className="nav-badge-hot">HOT</span>
                    </span>
                    <FiChevronRight size={18} />
                  </Link>
                </li>

                <li className="menu-divider">CATEGORIES</li>
                <li>
                  <Link href="/shop?category=Men" onClick={toggleMobileMenu} className="mobile-nav-sublink">
                    <span>Men's Wear</span>
                    <FiChevronRight size={16} />
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Women" onClick={toggleMobileMenu} className="mobile-nav-sublink">
                    <span>Women's Wear</span>
                    <FiChevronRight size={16} />
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=Kids" onClick={toggleMobileMenu} className="mobile-nav-sublink">
                    <span>Kids' Wear</span>
                    <FiChevronRight size={16} />
                  </Link>
                </li>

                <li className="menu-divider">EXPLORE</li>
                <li>
                  <Link href="/wishlist" onClick={toggleMobileMenu} className="mobile-nav-link">
                    <span>WISHLIST</span>
                    <span className="mobile-wishlist-count">{!isMounted ? 0 : wishlist.items.length}</span>
                  </Link>
                </li>
                <li>
                  <Link href="/blog" onClick={toggleMobileMenu} className="mobile-nav-link">
                    <span>BLOG</span>
                    <FiChevronRight size={18} />
                  </Link>
                </li>
                <li>
                  <Link href="/about" onClick={toggleMobileMenu} className="mobile-nav-link">
                    <span>ABOUT US</span>
                    <FiChevronRight size={18} />
                  </Link>
                </li>
                <li>
                  <Link href="/contact" onClick={toggleMobileMenu} className="mobile-nav-link">
                    <span>CONTACT</span>
                    <FiChevronRight size={18} />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mobile-menuFooter">
            <div className="mobile-menuFooterLogin">
              {auth.user ? (
                <div className="mobile-user-card">
                  <div className="mobile-user-info">
                    <div className="mobile-user-avatar">
                      {auth.user.avatar ? (
                        <img src={auth.user.avatar} alt={auth.user.name} />
                      ) : (
                        <span>{auth.user.name ? auth.user.name[0].toUpperCase() : "U"}</span>
                      )}
                    </div>
                    <div className="mobile-user-details">
                      <span className="mobile-user-name">{auth.user.name}</span>
                      <Link href="/account" onClick={toggleMobileMenu} className="mobile-account-link">
                        My Account
                      </Link>
                    </div>
                  </div>
                  <button className="mobile-logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login-signup" onClick={toggleMobileMenu} className="mobile-login-card">
                  <div className="mobile-login-icon">
                    <FaRegUser size={16} />
                  </div>
                  <div className="mobile-login-text">
                    <strong>My Account / Login</strong>
                    <span>Access orders & profile</span>
                  </div>
                  <FiChevronRight size={16} />
                </Link>
              )}
            </div>

            <div className="mobile-menuFooterLangCurrency">
              <div className="mobile-select-wrapper">
                <label>Language</label>
                <select name="language" defaultValue="english">
                  <option value="english">English (US)</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Germany">German</option>
                  <option value="French">French</option>
                </select>
              </div>
              <div className="mobile-select-wrapper">
                <label>Currency</label>
                <select name="currency" defaultValue="INR">
                  <option value="INR">₹ INR</option>
                  <option value="USD">$ USD</option>
                  <option value="EUR">€ EUR</option>
                  <option value="GBP">£ GBP</option>
                </select>
              </div>
            </div>

            <div className="mobile-menuSocial_links">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Facebook"><FaFacebookF /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Twitter"><FaXTwitter /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Instagram"><FaInstagram /></a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="YouTube"><FaYoutube /></a>
              <a href="https://pinterest.com" target="_blank" rel="noreferrer" className="social-icon-btn" aria-label="Pinterest"><FaPinterest /></a>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
