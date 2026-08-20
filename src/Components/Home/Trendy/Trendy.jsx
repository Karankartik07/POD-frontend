"use client";

import React, { useState, useEffect } from "react";
import "./Trendy.css";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../../Features/Cart/cartSlice";
import { addToWishList, removeFromWishList } from "../../../Features/Wishlist/wishListSlice";
import Link from "next/link";
import StoreData from "../../../Data/StoreData";
import { FiHeart } from "react-icons/fi";
import { FaStar, FaCartPlus } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../../../utils/api";

const Trendy = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("tab1");
  const [products, setProducts] = useState([]);
  const [wishListMap, setWishListMap] = useState({});

  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await api.getProducts({ limit: 20 });
        if (data.success && data.data && data.data.products) {
          const formatted = data.data.products.map(p => ({
            productID: p._id,
            _id: p._id,
            frontImg: p.mainImage || (p.images && p.images[0]) || "",
            backImg: (p.images && p.images[1]) || p.mainImage || "",
            productName: p.name,
            productPrice: p.salePrice || p.price,
            productReviews: `${p.numReviews || 0} reviews`,
            categoryName: p.category?.name || "Handcrafted",
            rating: p.rating || 5,
            salesCount: p.salesCount || 0
          }));
          setProducts(formatted);
        }
      } catch (err) {
        console.warn("Could not load products for Trendy component:", err);
      }
    }
    loadProducts();
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  const handleWishlistClick = (product) => {
    const id = product.productID || product._id;
    const isWishlisted = wishListMap[id] || wishlistItems.some(i => (i._id || i.productID) === id);

    if (isWishlisted) {
      dispatch(removeFromWishList(product));
      setWishListMap(prev => ({ ...prev, [id]: false }));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishList(product));
      setWishListMap(prev => ({ ...prev, [id]: true }));
      toast.success("Added to wishlist!");
    }
  };

  const handleAddToCart = (product) => {
    const id = product.productID || product._id;
    const productInCart = cartItems.find(
      (item) => (item.productID || item._id) === id
    );

    if (productInCart && productInCart.quantity >= 20) {
      toast.error("Product limit reached", {
        duration: 2000,
        style: {
          backgroundColor: "#ff4b4b",
          color: "white",
        },
      });
    } else {
      dispatch(addToCart(product));
      toast.success(`Added to cart!`, {
        duration: 2000,
        style: {
          backgroundColor: "#07bc0c",
          color: "white",
        },
      });
    }
  };

  let displayedProducts = [...products];
  if (activeTab === "tab2") {
    displayedProducts = [...products].reverse();
  } else if (activeTab === "tab3") {
    displayedProducts = [...products].sort((a, b) => b.salesCount - a.salesCount);
  } else if (activeTab === "tab4") {
    displayedProducts = [...products].sort((a, b) => b.rating - a.rating);
  }

  return (
    <>
      <div className="trendyProducts">
        <h2>
          Our Trendy <span>Products</span>
        </h2>
        <div className="trendyTabs">
          <div className="tabs">
            <p
              onClick={() => handleTabClick("tab1")}
              className={activeTab === "tab1" ? "active" : ""}
            >
              All
            </p>
            <p
              onClick={() => handleTabClick("tab2")}
              className={activeTab === "tab2" ? "active" : ""}
            >
              New Arrivals
            </p>
            <p
              onClick={() => handleTabClick("tab3")}
              className={activeTab === "tab3" ? "active" : ""}
            >
              Best Seller
            </p>
            <p
              onClick={() => handleTabClick("tab4")}
              className={activeTab === "tab4" ? "active" : ""}
            >
              Top Rated
            </p>
          </div>
          <div className="trendyTabContent">
            <div className="trendyMainContainer">
              {displayedProducts.slice(0, 8).map((product) => {
                const id = product.productID || product._id;
                const isWishlisted = wishListMap[id] || wishlistItems.some(i => (i._id || i.productID) === id);
                return (
                  <div className="trendyProductContainer" key={id}>
                    <div className="trendyProductImages">
                      <Link href={`/product?id=${id}`} onClick={scrollToTop}>
                        <img
                          src={product.frontImg?.src || product.frontImg}
                          alt={product.productName}
                          className="trendyProduct_front"
                        />
                        <img
                          src={product.backImg?.src || product.backImg}
                          alt={product.productName}
                          className="trendyProduct_back"
                        />
                      </Link>
                      <h4 onClick={() => handleAddToCart(product)}>
                        Add to Cart
                      </h4>
                    </div>
                    <div
                      className="trendyProductImagesCart"
                      onClick={() => handleAddToCart(product)}
                    >
                      <FaCartPlus />
                    </div>
                    <div className="trendyProductInfo">
                      <div className="trendyProductCategoryWishlist">
                        <p>{product.categoryName || "Apparel"}</p>
                        <FiHeart
                          onClick={() => handleWishlistClick(product)}
                          style={{
                            color: isWishlisted ? "red" : "#767676",
                            cursor: "pointer",
                          }}
                        />
                      </div>
                      <div className="trendyProductNameInfo">
                        <Link href={`/product?id=${id}`} onClick={scrollToTop}>
                          <h5>{product.productName}</h5>
                        </Link>

                        <p>${product.productPrice}</p>
                        <div className="trendyProductRatingReviews">
                          <div className="trendyProductRatingStar">
                            <FaStar color="#FEC78A" size={10} />
                            <FaStar color="#FEC78A" size={10} />
                            <FaStar color="#FEC78A" size={10} />
                            <FaStar color="#FEC78A" size={10} />
                            <FaStar color="#FEC78A" size={10} />
                          </div>
                          <span>{product.productReviews}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="discoverMore">
          <Link href="/shop" onClick={scrollToTop}>
            <p>Discover More</p>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Trendy;
