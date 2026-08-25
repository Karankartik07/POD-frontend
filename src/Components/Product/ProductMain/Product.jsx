"use client";

import React, { useState, useEffect, useMemo } from "react";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";

import { useDispatch, useSelector } from "react-redux";
import { addToWishList, removeFromWishList } from "../../../Features/Wishlist/wishListSlice";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import { getProductStockStatus } from "../../../utils/productUtils";

import { GoChevronLeft, GoChevronRight } from "react-icons/go";
import { FaStar } from "react-icons/fa";
import { FiHeart, FiRefreshCw } from "react-icons/fi";
import { PiShareNetworkLight } from "react-icons/pi";
import { BiCustomize } from "react-icons/bi";

import Link from "next/link";
import toast from "react-hot-toast";
import api from "../../../utils/api";

import "./Product.css";

const Product = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams?.get("id");
  const autoCustomize = searchParams?.get("customize");

  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productImg, setProductImg] = useState([]);
  const [currentImg, setCurrentImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [clicked, setClicked] = useState(false);

  const [selectSize, setSelectSize] = useState("");
  const [highlightedColor, setHighlightedColor] = useState("");

  // Customizer plugin states
  const [customizerEnabled, setCustomizerEnabled] = useState(false);
  const [customizerId, setCustomizerId] = useState(null);
  const [designLoading, setDesignLoading] = useState(false);

  const dispatch = useDispatch();
  const { cartItems, addToCart, openCart } = useCart();
  const { user } = useAuth();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  // Fetch Product Details
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

  // Fetch customizer product ID mapping
  useEffect(() => {
    async function fetchCustomizerProducts() {
      if (!productId) return;
      try {
        const res = await fetch("https://backend.krcustomizer.com/api/layerdesigns/custom/kartik1234");
        if (res.ok) {
          const data = await res.json();
          const matched = data.find(
            (item) =>
              String(item.customproductId) === String(productId) ||
              String(item.productId) === String(productId) ||
              String(item.id) === String(productId)
          );
          if (matched) {
            setCustomizerId(matched.productId);
          } else {
            setCustomizerId(data[0]?.productId || productId);
          }
        }
      } catch (err) {
        console.warn("Error fetching customizer product mapping:", err);
        setCustomizerId(productId);
      }
    }
    fetchCustomizerProducts();
  }, [productId]);

  // Auto-enable customizer if search param `customize=true`
  useEffect(() => {
    if (autoCustomize === "true") {
      setCustomizerEnabled(true);
    }
  }, [autoCustomize]);

  // Mount customizer plugin when enabled
  useEffect(() => {
    if (!customizerEnabled) return;
    const currentHash = "kartik1234";
    if (typeof window.mountProductCustomizer === "function") {
      try {
        window.mountProductCustomizer("#customizer-root", {
          productId: customizerId || productId,
          storeHash: currentHash,
          // currency: "INR",
          // productQty: quantity,
        });
      } catch (e) {
        console.error("Mount product customizer error:", e);
      }
    } 
  }, [customizerEnabled, customizerId, productId]);

  // MutationObserver for customizer plugin buttons (.kr-close-button and .kr-addtocart-custom)
  useEffect(() => {
    if (!customizerEnabled) return;

    const observer = new MutationObserver(() => {
      const addToCartBtns = document.querySelectorAll(".kr-addtocart-custom");
      const closeBtns = document.querySelectorAll(".kr-close-button");

      closeBtns.forEach((btn) => {
        btn.onclick = () => {
          setCustomizerEnabled(false);
          const rootEl = document.querySelector("#customizer-root");
          if (rootEl) rootEl.innerHTML = "";
        };
      });

      addToCartBtns.forEach((btn) => {
        if (!btn.dataset.listenerAttached) {
          btn.dataset.listenerAttached = "true";

          btn.addEventListener("click", async () => {
            try {
              setDesignLoading(true);

              const designDataLocal = JSON.parse(localStorage.getItem("krDesignData") || "{}");
              const krDesignId = designDataLocal?.krDesignId;

              let fetchedDesignDetails = null;
              if (krDesignId) {
                try {
                  const res = await fetch(`https://backend.krcustomizer.com/api/product-saved/${krDesignId}`, {
                    headers: {
                      Authorization:
                        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjMwLCJzdG9yZUhhc2giOiJ2bDVlNW42ZzR4Iiwicm9sZSI6InN1cGVyYWRtaW4iLCJpYXQiOjE3NTYxMDA5NTgsImV4cCI6MTc1NjE4NzM1OH0.jpl87itv8-s4JIGjgiilD55iHvZtnp3CYzJ7Zkiu3TM",
                    },
                  });
                  if (res.ok) {
                    fetchedDesignDetails = await res.json();
                  }
                } catch (e) {
                  console.warn("Failed to fetch design details from Shikhar API:", e);
                }
              }

              const previewImg =
                fetchedDesignDetails?.previewUrl ||
                fetchedDesignDetails?.image ||
                productData?.mainImage ||
                (productData?.images && productData?.images[0]) ||
                "/no-image.png";

              const customCartItem = {
                ...productData,
                _id: `custom_${productId}_${Date.now()}`,
                id: `custom_${productId}_${Date.now()}`,
                productId: productId,
                name: `${productData?.name || "Product"} (Customized)`,
                productName: `${productData?.name || "Product"} (Customized)`,
                price: Number(productData?.salePrice || productData?.price || 999),
                productPrice: Number(productData?.salePrice || productData?.price || 999),
                image: previewImg,
                mainImage: previewImg,
                isCustom: true,
                krDesignId: krDesignId || `DESIGN_${Date.now()}`,
                designData: fetchedDesignDetails || designDataLocal,
                quantity: quantity || 1,
              };

              await addToCart(customCartItem, quantity || 1);
              toast.success("Custom design added to cart!");
              setCustomizerEnabled(false);
              if (openCart) openCart();
              router.push("/cart");
            } catch (err) {
              console.error("Error adding custom design to cart:", err);
              toast.error("Failed to add custom design to cart");
            } finally {
              setDesignLoading(false);
            }
          });
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [customizerEnabled, customizerId, productId, productData, quantity, addToCart, openCart, router]);

  // Dynamic Sizes derivation
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

  // Dynamic Colors derivation
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

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (user || token) {
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

  const reviewCount = productData.numReviews || (productData.reviews ? productData.reviews.length : 0);
  const calcRating =
    productData.rating ||
    (productData.reviews && productData.reviews.length > 0
      ? Math.round(productData.reviews.reduce((a, b) => a + b.rating, 0) / productData.reviews.length)
      : 5);

  const mainDisplayImg = productImg[currentImg] || productData.mainImage || (productData.images && productData.images[0]) || "";

  return (
    <>
      {/* Saving / Processing Spinner Overlay */}
      {designLoading && (
        <div className="custOverlaySpinner">
          <div className="custSpinnerBox">
            <FiRefreshCw className="custSpinIcon" />
            <p>Saving custom design & updating cart...</p>
          </div>
        </div>
      )}

      {/* Full Screen KRCustomizer Modal Root */}
      {customizerEnabled && <div id="customizer-root"></div>}

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

            <div className="productRating">
              {[1, 2, 3, 4, 5].map((star) => (
                <FaStar key={star} color={star <= calcRating ? "#FEC78A" : "#e0e0e0"} size={12} />
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
                            className={highlightedColor === colorObj.value ? "highlighted" : ""}
                            style={{
                              backgroundColor: colorObj.value || "#222222",
                              border: highlightedColor === colorObj.value ? "2px solid #000" : "1px solid #ccc",
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
                <input type="text" value={quantity} onChange={handleInputChange} />
                <button onClick={increment}>+</button>
              </div>

              {/* Action Buttons Group: Customize & Add to Cart */}
              <div className="productCartBtnGroup">
                <button
                  type="button"
                  className="customizeBtn"
                  onClick={() => setCustomizerEnabled(true)}
                >
                  <BiCustomize size={18} /> Customize
                </button>

                <div className="productCartBtn">
                  {stockStatus.isAlreadyInCart ? (
                    <Link
                      href="/cart"
                      style={{
                        display: "block",
                        padding: "18px 32px",
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
                <span>SKU: </span>
                {sku}
              </p>
              <p>
                <span>CATEGORY: </span>
                {categoryName}
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
