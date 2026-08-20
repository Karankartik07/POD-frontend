"use client";

import React, { useState, useEffect } from "react";
import "./LimitedEdition.css";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import { Navigation, Autoplay } from "swiper/modules";
import Link from "next/link";
import { FiHeart } from "react-icons/fi";
import { FaStar, FaCartPlus } from "react-icons/fa";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import toast from "react-hot-toast";
import api from "../../../utils/api";
import { useCart } from "../../../context/CartContext";
import { useDispatch, useSelector } from "react-redux";
import { addToWishList, removeFromWishList } from "../../../Features/Wishlist/wishListSlice";

const LimitedEdition = () => {
  const [products, setProducts] = useState([]);
  const { addToCart, openCart } = useCart();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  useEffect(() => {
    async function loadLimited() {
      try {
        const data = await api.getProducts({ limit: 10 });
        if (data.success && data.data && data.data.products) {
          setProducts(data.data.products);
        }
      } catch (err) {
        console.warn("Could not load limited edition products:", err);
      }
    }
    loadLimited();
  }, []);

  const handleWishlistClick = (product) => {
    const isWishlisted = wishlistItems.some((i) => (i._id || i.id) === product._id);
    if (isWishlisted) {
      dispatch(removeFromWishList(product));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishList(product));
      toast.success("Added to wishlist!");
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success(`${product.name || "Product"} added to cart!`);
    if (openCart) openCart();
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  if (products.length === 0) return null;

  return (
    <>
      <div className="limitedProductSection">
        <h2>
          Limited <span>Edition</span>
        </h2>
        <div className="limitedProductSlider">
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
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            modules={[Navigation, Autoplay]}
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
              const calcRating = product.rating || 5;

              return (
                <SwiperSlide key={id}>
                  <div className="lpContainer">
                    <div className="lpImageContainer">
                      <Link href={`/product?id=${id}`} onClick={scrollToTop}>
                        <img
                          src={frontImg}
                          alt={product.name}
                          className="lpImage"
                        />
                      </Link>
                      <h4 onClick={() => handleAddToCart(product)}>
                        Add to Cart
                      </h4>
                    </div>
                    <div
                      className="lpProductImagesCart"
                      onClick={() => handleAddToCart(product)}
                    >
                      <FaCartPlus />
                    </div>
                    <div className="limitedProductInfo">
                      <div className="lpCategoryWishlist">
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

export default LimitedEdition;
