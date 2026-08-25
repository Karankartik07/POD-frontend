"use client";

import React, { useState, useEffect } from "react";
import "./RelatedProducts.css";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import { Navigation } from "swiper/modules";
import { FiHeart } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { addToWishList, removeFromWishList } from "../../../Features/Wishlist/wishListSlice";
import { useCart } from "../../../context/CartContext";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "../../../utils/api";

const RelatedProducts = () => {
  const searchParams = useSearchParams();
  const currentId = searchParams?.get("id");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();
  const { addToCart, openCart, cartItems } = useCart();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  useEffect(() => {
    async function loadRelated() {
      try {
        setLoading(true);
        const data = await api.getProducts({ limit: 12 });
        if (data.success && data.data && data.data.products) {
          const all = data.data.products;
          // Filter out current product
          const filtered = all.filter((p) => p._id !== currentId);
          setProducts(filtered);
        }
      } catch (err) {
        console.warn("Could not load related products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRelated();
  }, [currentId]);

  const handleWishlistClick = async (product) => {
    const pId = product._id || product.id || product.productID;
    const isWishlisted = wishlistItems.some((i) => (i._id || i.id || i.productID) === pId);
    if (isWishlisted) {
      dispatch(removeFromWishList(product));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishList(product));
      toast.success("Added to wishlist!");
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token && pId) {
      try {
        await api.toggleWishlist(pId);
      } catch (e) {
        console.warn("Wishlist toggle API error:", e);
      }
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success("Added to cart!");
    if (openCart) openCart();
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
        Loading related products...
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <>
      <div className="relatedProductSection">
        <div className="relatedProducts">
          <h2>
            RELATED <span>PRODUCTS</span>
          </h2>
        </div>
        <div className="relatedProductSlider">
          <div className="swiper-button image-swiper-button-next">
            <IoIosArrowForward />
          </div>
          <div className="swiper-button image-swiper-button-prev">
            <IoIosArrowBack />
          </div>
          <Swiper
            slidesPerView={4}
            slidesPerGroup={1}
            spaceBetween={30}
            loop={products.length > 4}
            navigation={{
              nextEl: ".image-swiper-button-next",
              prevEl: ".image-swiper-button-prev",
            }}
            modules={[Navigation]}
            breakpoints={{
              320: {
                slidesPerView: 2,
                slidesPerGroup: 1,
                spaceBetween: 14,
              },
              768: {
                slidesPerView: 3,
                slidesPerGroup: 1,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 4,
                slidesPerGroup: 1,
                spaceBetween: 30,
              },
            }}
          >
            {products.map((product) => {
              const id = product._id;
              const isWishlisted = wishlistItems.some((i) => (i._id || i.id) === id);
              const frontImg = product.mainImage || (product.images && product.images[0]) || "";
              const backImg = (product.images && product.images[1]) || frontImg;
              const calcRating = product.rating || 5;

              return (
                <SwiperSlide key={id}>
                  <div className="rpContainer">
                    <div className="rpImages">
                      <Link href={`/product?id=${id}`} onClick={scrollToTop}>
                        <img
                          src={frontImg}
                          alt={product.name}
                          className="rpFrontImg"
                        />
                        <img
                          src={backImg}
                          className="rpBackImg"
                          alt={product.name}
                        />
                      </Link>
                      <h4 onClick={() => handleAddToCart(product)}>Add to Cart</h4>
                    </div>

                    <div className="relatedProductInfo">
                      <div className="rpCategoryWishlist">
                        <p>{product.category?.name || "Handcrafted"}</p>
                        <FiHeart
                          onClick={() => handleWishlistClick(product)}
                          style={{
                            color: isWishlisted ? "red" : "#767676",
                            cursor: "pointer",
                          }}
                        />
                      </div>
                      <div className="productNameInfo">
                        <Link href={`/product?id=${id}`} onClick={scrollToTop}>
                          <h5>{product.name}</h5>
                        </Link>
                        <p>₹{product.salePrice || product.price}</p>
                        <div className="productRatingReviews">
                          <div className="productRatingStar">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                color={star <= calcRating ? "#FEC78A" : "#e0e0e0"}
                                size={10}
                              />
                            ))}
                          </div>

                          <span>({product.numReviews || 0} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </>
  );
};

export default RelatedProducts;
