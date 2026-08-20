"use client";

import React, { useState, useEffect } from "react";
import "./AdditionalInfo.css";
import { FaStar } from "react-icons/fa";
import Rating from "@mui/material/Rating";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import api from "../../../utils/api";

const AdditionalInfo = () => {
  const searchParams = useSearchParams();
  const productId = searchParams?.get("id");

  const [productData, setProductData] = useState(null);
  const [activeTab, setActiveTab] = useState("aiTab1");
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      if (productId) {
        try {
          const data = await api.getProductById(productId);
          if (data.success && data.data) {
            setProductData(data.data);
          }
        } catch (err) {
          console.warn("Could not fetch product detail for additional info:", err);
        }
      }
    }
    fetchProduct();
  }, [productId]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Please enter a review comment.");
      return;
    }
    if (!productId) return;

    try {
      setSubmitting(true);
      const res = await api.createProductReview(productId, {
        rating: newRating,
        comment: newComment,
      });
      toast.success("Review submitted successfully!");
      setNewComment("");

      // Refresh product data
      const updated = await api.getProductById(productId);
      if (updated.success && updated.data) {
        setProductData(updated.data);
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit review. Make sure you are logged in.");
    } finally {
      setSubmitting(false);
    }
  };

  const reviews = productData?.reviews || [];
  const reviewCount = productData?.numReviews || reviews.length;

  return (
    <div className="productAdditionalInfo">
      <div className="productAdditonalInfoContainer">
        <div className="productAdditionalInfoTabs">
          <div className="aiTabs">
            <p
              onClick={() => handleTabClick("aiTab1")}
              className={activeTab === "aiTab1" ? "aiActive" : ""}
            >
              Description
            </p>
            <p
              onClick={() => handleTabClick("aiTab2")}
              className={activeTab === "aiTab2" ? "aiActive" : ""}
            >
              Additional Information
            </p>
            <p
              onClick={() => handleTabClick("aiTab3")}
              className={activeTab === "aiTab3" ? "aiActive" : ""}
            >
              Reviews ({reviewCount})
            </p>
          </div>
        </div>

        <div className="productAdditionalInfoContent">
          {/* TAB 1: DYNAMIC DESCRIPTION */}
          {activeTab === "aiTab1" && (
            <div className="aiTabDescription">
              <div className="descriptionPara">
                <h3>Product Overview</h3>
                <p>
                  {productData?.description || "No description provided for this product."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: DYNAMIC ADDITIONAL INFORMATION FROM DB */}
          {activeTab === "aiTab2" && (
            <div className="aiTabAdditionalInfo">
              {productData?.category?.name && (
                <div className="additionalInfoContainer">
                  <h6>Category</h6>
                  <p>{productData.category.name}</p>
                </div>
              )}

              {productData?.sku && (
                <div className="additionalInfoContainer">
                  <h6>SKU / Model</h6>
                  <p>{productData.sku}</p>
                </div>
              )}

              <div className="additionalInfoContainer">
                <h6>Stock Availability</h6>
                <p>{(productData?.inventory ?? 0) > 0 ? `${productData.inventory} in stock` : "Out of Stock"}</p>
              </div>

              {/* Dynamic DB Attributes */}
              {productData?.attributes &&
                Array.isArray(productData.attributes) &&
                productData.attributes.map((attr, idx) => (
                  <div key={idx} className="additionalInfoContainer">
                    <h6>{attr.key}</h6>
                    <p>{attr.value}</p>
                  </div>
                ))}

              {/* Dynamic DB Sizes */}
              {productData?.sizes &&
                Array.isArray(productData.sizes) &&
                productData.sizes.length > 0 && (
                  <div className="additionalInfoContainer">
                    <h6>Available Sizes</h6>
                    <p>
                      {productData.sizes
                        .map((s) => (typeof s === "object" ? s.size : s))
                        .join(", ")}
                    </p>
                  </div>
                )}

              {/* Dynamic DB Colors */}
              {productData?.colorImages &&
                Array.isArray(productData.colorImages) &&
                productData.colorImages.length > 0 && (
                  <div className="additionalInfoContainer">
                    <h6>Colors</h6>
                    <p>{productData.colorImages.map((c) => c.color).join(", ")}</p>
                  </div>
                )}
            </div>
          )}

          {/* TAB 3: DYNAMIC REVIEWS FROM DB */}
          {activeTab === "aiTab3" && (
            <div className="aiTabReview">
              <div className="aiTabReviewContainer">
                <h3>Customer Reviews ({reviewCount})</h3>

                {reviews.length > 0 ? (
                  <div className="userReviews">
                    {reviews.map((rev, idx) => (
                      <div
                        key={rev._id || idx}
                        className="userReview"
                        style={{ borderBottom: "1px solid #e4e4e4", padding: "16px 0" }}
                      >
                        <div className="userReviewContent">
                          <div className="userReviewTopContent">
                            <div className="userNameRating">
                              <h6>{rev.name || "Verified Buyer"}</h6>
                              <div className="userRating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <FaStar
                                    key={star}
                                    color={star <= rev.rating ? "#FEC78A" : "#e0e0e0"}
                                    size={11}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="userDate">
                              <p>
                                {rev.createdAt
                                  ? new Date(rev.createdAt).toLocaleDateString()
                                  : "Recently"}
                              </p>
                            </div>
                          </div>
                          <div className="userReviewBottomContent">
                            <p>{rev.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#777", margin: "20px 0" }}>
                    No reviews yet for this product. Be the first to leave a review!
                  </p>
                )}

                {/* Review Submission Form */}
                <div className="userNewReview" style={{ marginTop: "30px" }}>
                  <div className="userNewReviewMessage">
                    <h5>Write a Review</h5>
                    <p>Share your feedback about this product.</p>
                  </div>
                  <form onSubmit={handleReviewSubmit}>
                    <div className="userNewReviewRating" style={{ marginBottom: "15px" }}>
                      <label style={{ marginRight: "10px", fontWeight: "600" }}>Your Rating *</label>
                      <Rating
                        name="productRatingInput"
                        value={newRating}
                        onChange={(e, val) => setNewRating(val || 5)}
                        size="medium"
                      />
                    </div>
                    <div className="userNewReviewForm">
                      <textarea
                        cols={30}
                        rows={5}
                        placeholder="Write your review comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                        style={{
                          width: "100%",
                          padding: "12px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                          marginBottom: "15px",
                        }}
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        style={{
                          padding: "12px 24px",
                          background: "#1b1b1b",
                          color: "#fff",
                          border: "none",
                          borderRadius: "4px",
                          fontWeight: "600",
                          cursor: submitting ? "not-allowed" : "pointer",
                        }}
                      >
                        {submitting ? "Submitting..." : "Submit Review"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdditionalInfo;
