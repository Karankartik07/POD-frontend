"use client";

import React, { useEffect } from "react";
import "./WishlistPage.css";
import { useSelector, useDispatch } from "react-redux";
import { removeFromWishList, fetchWishlistThunk } from "../../Features/Wishlist/wishListSlice";
import { useCart } from "../../context/CartContext";
import Link from "next/link";
import { MdOutlineClose } from "react-icons/md";
import toast from "react-hot-toast";
import api from "../../utils/api";

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { addToCart: addToCartContext, openCart } = useCart();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  useEffect(() => {
    dispatch(fetchWishlistThunk());
  }, [dispatch]);

  const handleRemove = async (product) => {
    const pId = product._id || product.productID || product.id;
    dispatch(removeFromWishList(product));
    toast.success("Item removed from wishlist");

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token && pId) {
      try {
        await api.removeFromWishlist(pId);
      } catch (e) {
        console.warn("Wishlist remove API error:", e);
      }
    }
  };

  const handleAddToCart = (product) => {
    const pId = product._id || product.productID || product.id;
    const pName = product.name || product.productName || "Product";
    const pPrice = product.salePrice || product.productPrice || product.price || 0;
    const pImg = product.mainImage || product.frontImg?.src || product.frontImg || (product.images && product.images[0]) || "";

    const addPayload = {
      _id: pId,
      id: pId,
      productId: pId,
      productID: pId,
      name: pName,
      productName: pName,
      price: pPrice,
      productPrice: pPrice,
      mainImage: pImg,
      frontImg: pImg,
    };

    addToCartContext(addPayload, 1);
    toast.success("Added to cart!");
    if (openCart) openCart();
  };

  return (
    <div className="wishlistPageSection">
      <div className="wishlistPageHeader">
        <h2>My Wishlist</h2>
        <p>Manage products you have saved for later.</p>
      </div>

      {wishlistItems.length > 0 ? (
        <div className="wishlistGrid">
          {wishlistItems.map((item) => {
            const id = item._id || item.productID || item.id;
            const name = item.name || item.productName || "Product";
            const price = item.salePrice || item.productPrice || item.price || 0;
            const image = item.mainImage || item.frontImg?.src || item.frontImg || (item.images && item.images[0]);

            return (
              <div key={id} className="wishlistCard">
                <div className="wishlistImgContainer">
                  <Link href={`/product?id=${id}`}>
                    <img src={image} alt={name} />
                  </Link>
                  <button className="removeWishlistBtn" onClick={() => handleRemove(item)}>
                    <MdOutlineClose size={18} />
                  </button>
                </div>
                <div className="wishlistCardInfo">
                  <Link href={`/product?id=${id}`} style={{ textDecoration: "none" }}>
                    <h4>{name}</h4>
                  </Link>
                  <p>₹{price}</p>
                  <button className="wishlistAddToCartBtn" onClick={() => handleAddToCart(item)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="wishlistEmpty">
          <h3>Your wishlist is currently empty</h3>
          <p style={{ color: "#666", marginBottom: "20px" }}>Explore our store and save your favorite items!</p>
          <Link href="/shop">
            <button>Explore Shop</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
