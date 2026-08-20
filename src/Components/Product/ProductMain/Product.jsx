"use client";

import React, { useState, useEffect, useMemo } from "react";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";

import { useDispatch, useSelector } from "react-redux";
import { addToWishList, removeFromWishList } from "../../../Features/Wishlist/wishListSlice";
import { useSearchParams } from "next/navigation";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import { getProductStockStatus } from "../../../utils/productUtils";

import { GoChevronLeft, GoChevronRight } from "react-icons/go";
import { FaStar } from "react-icons/fa";
import { FiHeart } from "react-icons/fi";
import { PiShareNetworkLight } from "react-icons/pi";

import Link from "next/link";
import toast from "react-hot-toast";
import api from "../../../utils/api";

import "./Product.css";

const Product = () => {
  const searchParams = useSearchParams();
  const productId = searchParams?.get("id");

  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productImg, setProductImg] = useState([]);
  const [currentImg, setCurrentImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [clicked, setClicked] = useState(false);

  const [selectSize, setSelectSize] = useState("");
  const [highlightedColor, setHighlightedColor] = useState("");

  const dispatch = useDispatch();
  const { cartItems, addToCart, openCart } = useCart();
  const { user } = useAuth();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  useEffect(() => {
    async function fetchProduct() {
      if (productId) {
        try {
          setLoading(true);
          const data = await api.getProductById(productId);
          if (data.success && data.data) {
            const p = data.data;
            setProductData(p);
            if (p.images && p.images.length > 0) {
              setProductImg(p.images);
            } else if (p.mainImage) {
              setProductImg([p.mainImage]);
            }
          }
        } catch (err) {
          console.warn("Could not fetch product detail by id:", err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  // Dynamic Sizes derivation (Strictly DB data, no static fallback)
  const dynamicSizes = useMemo(() => {
    if (!productData) return [];
    if (productData.sizes && Array.isArray(productData.sizes) && productData.sizes.length > 0) {
      return productData.sizes.map((s) => (typeof s === "object" ? s.size : s)).filter(Boolean);
    }
    if (productData.variants && Array.isArray(productData.variants) && productData.variants.length > 0) {
      const vSizes = productData.variants.map((v) => v.size).filter(Boolean);
      if (vSizes.length > 0) return Array.from(new Set(vSizes));
    }
    return [];
  }, [productData]);

  // Dynamic Colors derivation (Strictly DB data, no static fallback)
  const dynamicColors = useMemo(() => {
    if (!productData) return [];
    if (productData.colorImages && Array.isArray(productData.colorImages) && productData.colorImages.length > 0) {
      return productData.colorImages.map((c) => ({
        name: c.color,
        value: c.color ? c.color.toLowerCase() : "#222222",
      }));
    }
    if (productData.color) {
      return [{ name: productData.color, value: productData.color.toLowerCase() }];
    }
    return [];
  }, [productData]);

  useEffect(() => {
    if (dynamicSizes.length > 0 && !selectSize) {
      setSelectSize(dynamicSizes[0]);
    }
    if (dynamicColors.length > 0 && !highlightedColor) {
      setHighlightedColor(dynamicColors[0].value);
    }
  }, [dynamicSizes, dynamicColors, selectSize, highlightedColor]);

  const stockStatus = useMemo(() => {
    return getProductStockStatus(productData, cartItems);
  }, [productData, cartItems]);

  const isWishlisted = useMemo(() => {
    if (!productData) return clicked;
    return wishlistItems.some((item) => (item._id || item.id) === productData._id);
  }, [productData, wishlistItems, clicked]);

  const prevImg = () => {
    if (productImg.length === 0) return;
    setCurrentImg(currentImg === 0 ? productImg.length - 1 : currentImg - 1);
  };

  const nextImg = () => {
    if (productImg.length === 0) return;
    setCurrentImg(currentImg === productImg.length - 1 ? 0 : currentImg + 1);
  };

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleInputChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
    }
  };

  const handleWishClick = async () => {
    if (!productData) return;
    const id = productData._id;

    if (isWishlisted) {
      dispatch(removeFromWishList(productData));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishList(productData));
      toast.success("Added to wishlist!");
    }

    if (user) {
      try {
        await api.toggleWishlist(id);
      } catch (err) {
        console.warn("Wishlist toggle API error:", err);
      }
    }
  };

  const handleAddToCart = () => {
    if (!productData) return;
    if (stockStatus.isOutOfStock) {
      toast.error("Sorry, this item is currently out of stock.");
      return;
    }

    let payload = productData;
    if (stockStatus.mainStock <= 0 && stockStatus.availableVariant) {
      payload = {
        ...productData,
        selectedVariant: stockStatus.availableVariant,
        price: stockStatus.availableVariant.price || productData.price,
        salePrice: stockStatus.availableVariant.salePrice || productData.salePrice,
      };
    }

    addToCart(payload, quantity);
    toast.success(`Added ${quantity} item(s) to cart!`);
    if (openCart) openCart();
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0", fontSize: "18px", color: "#666", fontWeight: "500" }}>
        Loading product details...
      </div>
    );
  }

  if (!productData) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0", fontSize: "18px", color: "#666", fontWeight: "500" }}>
        Product not found.
      </div>
    );
  }

  const title = productData.name;
  const price = productData.salePrice || productData.price || 0;
  const description = productData.description || "No description provided for this item.";
  const sku = productData.sku || "N/A";
  const categoryName = productData.category?.name || "Handcrafted";

  // Dynamic Rating calculation
  const reviewCount = productData.numReviews || (productData.reviews ? productData.reviews.length : 0);
  const calcRating = productData.rating || (productData.reviews && productData.reviews.length > 0
    ? Math.round(productData.reviews.reduce((a, b) => a + b.rating, 0) / productData.reviews.length)
    : 5);

  const mainDisplayImg = productImg[currentImg] || productData.mainImage || (productData.images && productData.images[0]) || "";

  return (
    <>
      <div className="productSection">
        <div className="productShowCase">
          <div className="productGallery">
            <div className="productThumb">
              {productImg.slice(0, 4).map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl?.src || imgUrl}
                  onClick={() => setCurrentImg(idx)}
                  alt=""
                  style={{ border: currentImg === idx ? "2px solid black" : "none" }}
                />
              ))}
            </div>
            <div className="productFullImg">
              <img src={mainDisplayImg} alt={title} />
              {productImg.length > 1 && (
                <div className="buttonsGroup">
                  <button onClick={prevImg} className="directionBtn">
                    <GoChevronLeft size={18} />
                  </button>
                  <button onClick={nextImg} className="directionBtn">
                    <GoChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="productDetails">
            <div className="productBreadcrumb">
              <div className="breadcrumbLink">
                <Link href="/">Home</Link>&nbsp;/&nbsp;
                <Link href="/shop">The Shop</Link>
              </div>
              <div className="prevNextLink">
                <Link href="/shop">
                  <GoChevronLeft />
                  <p>Back to Shop</p>
                </Link>
              </div>
            </div>
            <div className="productName">
              <h1>{title}</h1>
            </div>

            {/* Dynamic Stars Rating & Review Count */}
            <div className="productRating">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar
                  key={star}
                  color={star <= calcRating ? "#FEC78A" : "#e0e0e0"}
                  size={12}
                />
              ))}
              <p>({reviewCount} reviews)</p>
            </div>

            <div className="productPrice">
              <h3>₹{price}</h3>
            </div>
            <div className="productDescription">
              <p>{description}</p>
            </div>

            {(dynamicSizes.length > 0 || dynamicColors.length > 0) && (
              <div className="productSizeColor">
                {/* Dynamic Sizes */}
                {dynamicSizes.length > 0 && (
                  <div className="productSize">
                    <p>Sizes</p>
                    <div className="sizeBtn">
                      {dynamicSizes.map((size) => (
                        <button
                          key={size}
                          style={{
                            borderColor: selectSize === size ? "#000" : "#e0e0e0",
                            background: selectSize === size ? "#000" : "#fff",
                            color: selectSize === size ? "#fff" : "#333",
                          }}
                          onClick={() => setSelectSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamic Colors */}
                {dynamicColors.length > 0 && (
                  <div className="productColor">
                    <p>Color</p>
                    <div className="colorBtn">
                      {dynamicColors.map((colorObj, index) => (
                        <Tooltip
                          key={index}
                          title={colorObj.name || "Color"}
                          placement="top"
                          enterTouchDelay={0}
                          TransitionComponent={Zoom}
                          arrow
                        >
                          <button
                            className={
                              highlightedColor === colorObj.value ? "highlighted" : ""
                            }
                            style={{
                              backgroundColor: colorObj.value || "#222222",
                              border:
                                highlightedColor === colorObj.value
                                  ? "2px solid #000"
                                  : "1px solid #ccc",
                              padding: "10px",
                              margin: "5px",
                              borderRadius: "50%",
                              cursor: "pointer",
                            }}
                            onClick={() => setHighlightedColor(colorObj.value)}
                          />
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="productCartQuantity">
              <div className="productQuantity">
                <button onClick={decrement}>-</button>
                <input
                  type="text"
                  value={quantity}
                  onChange={handleInputChange}
                />
                <button onClick={increment}>+</button>
              </div>

              {/* Action Button: View Cart / Out of Stock / Add to Cart */}
              <div className="productCartBtn">
                {stockStatus.isAlreadyInCart ? (
                  <Link
                    href="/cart"
                    style={{
                      display: "block",
                      padding: "14px 28px",
                      background: "#16a34a",
                      color: "#fff",
                      textDecoration: "none",
                      borderRadius: "4px",
                      fontWeight: "600",
                      textAlign: "center",
                    }}
                  >
                    View Cart
                  </Link>
                ) : stockStatus.isOutOfStock ? (
                  <button
                    disabled
                    style={{
                      background: "#e5e5e5",
                      color: "#999",
                      cursor: "not-allowed",
                    }}
                  >
                    Out of Stock
                  </button>
                ) : (
                  <button onClick={handleAddToCart}>Add to Cart</button>
                )}
              </div>
            </div>

            <div className="productWishShare">
              <div className="productWishList">
                <button onClick={handleWishClick}>
                  <FiHeart color={isWishlisted ? "red" : ""} size={17} />
                  <p>{isWishlisted ? "In Wishlist" : "Add to Wishlist"}</p>
                </button>
              </div>
              <div className="productShare">
                <PiShareNetworkLight size={22} />
                <p>Share</p>
              </div>
            </div>

            <div className="productTags">
              <p>
                <span>SKU: </span>{sku}
              </p>
              <p>
                <span>CATEGORY: </span>{categoryName}
              </p>
              <p>
                <span>TAGS: </span>apparel, fashion, print-on-demand
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Product;
