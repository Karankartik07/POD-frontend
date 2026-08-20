"use client";

import React, { useEffect } from "react";
import "./WishlistPage.css";
import { useSelector, useDispatch } from "react-redux";
import { removeFromWishList, fetchWishlistThunk } from "../../Features/Wishlist/wishListSlice";
import { addToCart } from "../../Features/Cart/cartSlice";
import Link from "next/link";
import { MdOutlineClose } from "react-icons/md";
import toast from "react-hot-toast";

const WishlistPage = () => {
  const dispatch = useDispatch();
  const wishlistItems = useSelector((state) => state.wishlist.items);

  useEffect(() => {
    dispatch(fetchWishlistThunk());
  }, [dispatch]);

  const handleRemove = (product) => {
    dispatch(removeFromWishList(product));
    toast.success("Item removed from wishlist");
  };

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    toast.success("Added to cart!");
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
                  <p>${price}</p>
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
