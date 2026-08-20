import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import Home from "./pages_legacy/Home";
import About from "./pages_legacy/About";
import Shop from "./pages_legacy/Shop";
import Contact from "./pages_legacy/Contact";
import Blog from "./pages_legacy/Blog";
import Header from "../src/Components/Header/Navbar";
import Footer from "../src/Components/Footer/Footer";
import ProductDetails from "./pages_legacy/ProductDetails";
import NotFound from "./pages_legacy/NotFound";
import ScrollToTop from "./Components/ScrollButton/ScrollToTop";
import Authentication from "./pages_legacy/Authentication";
import ResetPass from "./Components/Authentication/Reset/ResetPass";
import BlogDetails from "./Components/Blog/BlogDetails/BlogDetails";
import TermsConditions from "./pages_legacy/TermsConditions";
import ShoppingCart from "./Components/ShoppingCart/ShoppingCart";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <>
      <ScrollToTop />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/product" element={<ProductDetails />} />
          <Route path="/login-signup" element={<Authentication />} />
          <Route path="/reset-password" element={<ResetPass />} />
          <Route path="/blog-details" element={<BlogDetails />} />
          <Route path="/terms" element={<TermsConditions />} />
          <Route path="/cart" element={<ShoppingCart />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
        <Toaster />
      </BrowserRouter>
    </>
  );
};

export default App;
