"use client";

import React, { useState, useEffect, useMemo } from "react";
import "./ShopDetails.css";

import { useDispatch, useSelector } from "react-redux";
import { addToWishList, removeFromWishList } from "../../../Features/Wishlist/wishListSlice";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import { getProductStockStatus } from "../../../utils/productUtils";

import Filter from "../Filters/Filter";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiHeart } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { IoFilterSharp, IoClose } from "react-icons/io5";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import toast from "react-hot-toast";
import api from "../../../utils/api";

const ShopDetails = () => {
  const dispatch = useDispatch();
  const { addToCart, openCart, cartItems } = useCart();
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState("default");

  // Dynamic filter states
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceOption, setSelectedPriceOption] = useState("all");
  const [selectedSize, setSelectedSize] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");

  // Sync selected category with URL query parameters (e.g. ?category=Men)
  useEffect(() => {
    if (searchParams) {
      const cat = searchParams.get("category");
      const search = searchParams.get("search");
      if (cat) {
        setSelectedCategory(cat);
      }
      if (search) {
        setSearchKeyword(search);
      }
    }
  }, [searchParams]);

  // Pagination state (6 products per page)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const [wishListMap, setWishListMap] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const wishlistItems = useSelector((state) => state.wishlist.items);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const data = await api.getProducts({ limit: 100 });
        if (data.success && data.data && data.data.products) {
          setProducts(data.data.products);
        } else if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.warn("Could not load database products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // Reset page to 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedPriceOption, selectedSize, searchKeyword, sortOption]);

  const handleWishlistClick = async (product) => {
    const id = product._id;
    const isWishlisted = wishListMap[id] || wishlistItems.some((i) => i._id === id);

    if (isWishlisted) {
      dispatch(removeFromWishList(product));
      setWishListMap((prev) => ({ ...prev, [id]: false }));
      toast.success("Removed from wishlist");
    } else {
      dispatch(addToWishList(product));
      setWishListMap((prev) => ({ ...prev, [id]: true }));
      toast.success("Added to wishlist!");
    }

    if (user) {
      try {
        await api.toggleWishlist(id);
      } catch (e) {
        console.warn("Backend wishlist sync error:", e);
      }
    }
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleAddToCart = (product) => {
    const status = getProductStockStatus(product, cartItems);
    if (status.isAlreadyInCart) {
      if (openCart) openCart();
      return;
    }
    if (status.isOutOfStock) {
      toast.error("Sorry, this item is currently out of stock.");
      return;
    }

    let addPayload = product;
    if (status.mainStock <= 0 && status.availableVariant) {
      addPayload = {
        ...product,
        selectedVariant: status.availableVariant,
        price: status.availableVariant.price || product.price,
        salePrice: status.availableVariant.salePrice || product.salePrice,
      };
    }

    addToCart(addPayload, 1);
    toast.success(`${product.name || "Product"} added to cart!`);
    if (openCart) {
      openCart();
    }
  };

  // Dynamic Filtering
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Category Filter
      if (selectedCategory && selectedCategory !== "all") {
        const catId = p.category?._id || p.category;
        const catName = typeof p.category === "object" && p.category?.name ? p.category.name.toLowerCase() : "";
        const selLower = selectedCategory.toLowerCase();

        const matchesId = catId === selectedCategory;
        const matchesName = catName && (catName === selLower || catName.includes(selLower) || selLower.includes(catName));
        const matchesProdName = p.name ? p.name.toLowerCase().includes(selLower) : false;
        const matchesDesc = p.description ? p.description.toLowerCase().includes(selLower) : false;

        if (!matchesId && !matchesName && !matchesProdName && !matchesDesc) {
          return false;
        }
      }

      // 2. Search Filter
      if (searchKeyword.trim()) {
        const query = searchKeyword.toLowerCase();
        const nameMatch = p.name ? p.name.toLowerCase().includes(query) : false;
        const descMatch = p.description ? p.description.toLowerCase().includes(query) : false;
        if (!nameMatch && !descMatch) return false;
      }

      // 3. Price Filter Preset Ranges
      const price = p.salePrice && p.salePrice > 0 ? p.salePrice : p.price || 0;
      if (selectedPriceOption === "under-499" && price >= 499) return false;
      if (selectedPriceOption === "499-1499" && (price < 499 || price > 1499)) return false;
      if (selectedPriceOption === "1499-2999" && (price < 1499 || price > 2999)) return false;
      if (selectedPriceOption === "above-2999" && price <= 2999) return false;

      // 4. Single-Select Size Filter
      if (selectedSize !== "all") {
        const hasSizesArr = p.sizes && Array.isArray(p.sizes) && p.sizes.some(s => (s.size || s).toString().toUpperCase() === selectedSize.toUpperCase());
        const hasVariantsArr = p.variants && Array.isArray(p.variants) && p.variants.some(v => v.size && v.size.toString().toUpperCase() === selectedSize.toUpperCase());
        const hasAttrSize = p.attributes && Array.isArray(p.attributes) && p.attributes.some(a => a.key && a.key.toLowerCase() === "size" && a.value && a.value.toString().toUpperCase() === selectedSize.toUpperCase());
        
        if (!hasSizesArr && !hasVariantsArr && !hasAttrSize) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedCategory, searchKeyword, selectedPriceOption, selectedSize]);

  // Dynamic Sorting
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortOption === "lowToHigh") {
      return list.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    }
    if (sortOption === "highToLow") {
      return list.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    }
    if (sortOption === "a-z") {
      return list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    if (sortOption === "z-a") {
      return list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    }
    return list;
  }, [filteredProducts, sortOption]);

  // Pagination (6 products per page)
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  return (
    <>
      <div className="shopDetails">
        <div className="shopDetailMain">
          <div className="shopDetails__left">
            <Filter
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedPriceOption={selectedPriceOption}
              setSelectedPriceOption={setSelectedPriceOption}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              searchKeyword={searchKeyword}
              setSearchKeyword={setSearchKeyword}
            />
          </div>
          <div className="shopDetails__right">
            <div className="shopDetailsSorting">
              <div className="shopDetailsBreadcrumbLink">
                <Link href="/" onClick={scrollToTop}>
                  Home
                </Link>
                &nbsp;/&nbsp;
                <Link href="/shop">The Shop</Link>
              </div>
              <div className="filterLeft" onClick={toggleDrawer}>
                <IoFilterSharp />
                <p>Filter</p>
              </div>
              <div className="shopDetailsSort">
                <select
                  name="sort"
                  id="sort"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="default">Default Sorting</option>
                  <option value="lowToHigh">Price, Low to high</option>
                  <option value="highToLow">Price, High to low</option>
                  <option value="a-z">Alphabetically, A-Z</option>
                  <option value="z-a">Alphabetically, Z-A</option>
                </select>
                <div className="filterRight" onClick={toggleDrawer}>
                  <div className="filterSeprator"></div>
                  <IoFilterSharp />
                  <p>Filter</p>
                </div>
              </div>
            </div>

            <div className="shopDetailsProducts">
              {loading ? (
                <div style={{ textAlign: "center", padding: "60px", fontSize: "18px", color: "#666" }}>
                  Loading database products...
                </div>
              ) : currentProducts.length > 0 ? (
                <div className="shopDetailsProductsContainer">
                  {currentProducts.map((product) => {
                    const id = product._id;
                    const isWishlisted =
                      wishListMap[id] || wishlistItems.some((i) => i._id === id);
                    const frontImg =
                      product.mainImage ||
                      (product.images && product.images[0]) ||
                      "https://res.cloudinary.com/dlzxiy0tl/image/upload/v1781525765/Rectangle_23_10_roxkwo.png";
                    const backImg =
                      (product.images && product.images[1]) || frontImg;

                    // Dynamic Rating calculation
                    const reviewCount = product.numReviews || (product.reviews ? product.reviews.length : 0);
                    const calcRating = product.rating || (product.reviews && product.reviews.length > 0
                      ? Math.round(product.reviews.reduce((a, b) => a + b.rating, 0) / product.reviews.length)
                      : 5);

                    // Dynamic Stock & Cart Status
                    const stockStatus = getProductStockStatus(product, cartItems);

                    return (
                      <div className="sdProductContainer" key={id}>
                        <div className="sdProductImages">
                          <Link href={`/product?id=${id}`} onClick={scrollToTop}>
                            <img
                              src={frontImg}
                              alt={product.name}
                              className="sdProduct_front"
                            />
                            <img
                              src={backImg}
                              alt={product.name}
                              className="sdProduct_back"
                            />
                          </Link>

                          {/* Dynamic Action Button: View Cart / Out of Stock / Add to Cart */}
                          {stockStatus.isAlreadyInCart ? (
                            <Link href="/cart" className="actionBtnBox" style={{ background: "#16a34a", color: "#fff" }}>
                              View Cart
                            </Link>
                          ) : stockStatus.isOutOfStock ? (
                            <h4 style={{ background: "#e5e5e5", color: "#999", cursor: "not-allowed" }}>
                              Out of Stock
                            </h4>
                          ) : (
                            <h4 onClick={() => handleAddToCart(product)}>
                              Add to Cart
                            </h4>
                          )}
                        </div>

                        <div className="sdProductInfo">
                          <div className="sdProductCategoryWishlist">
                            <p>{product.category?.name || "Handcrafted"}</p>
                            <FiHeart
                              onClick={() => handleWishlistClick(product)}
                              style={{
                                color: isWishlisted ? "red" : "#767676",
                                cursor: "pointer",
                              }}
                            />
                          </div>
                          <div className="sdProductNameInfo">
                            <Link href={`/product?id=${id}`} onClick={scrollToTop}>
                              <h5>{product.name}</h5>
                            </Link>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {product.salePrice && product.salePrice < product.price ? (
                                <>
                                  <span style={{ textDecoration: "line-through", color: "#999", fontSize: "14px" }}>
                                    ₹{product.price}
                                  </span>
                                  <span style={{ fontWeight: "700", color: "#1b1b1b" }}>
                                    ₹{product.salePrice}
                                  </span>
                                </>
                              ) : (
                                <span style={{ fontWeight: "700", color: "#1b1b1b" }}>
                                  ₹{product.price}
                                </span>
                              )}
                            </div>

                            {/* Dynamic Rating Stars & Review Count */}
                            <div className="sdProductRatingReviews">
                              <div className="sdProductRatingStar">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <FaStar
                                    key={star}
                                    color={star <= calcRating ? "#FEC78A" : "#e0e0e0"}
                                    size={11}
                                  />
                                ))}
                              </div>
                              <span>({reviewCount} reviews)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "60px", color: "#777" }}>
                  No products found matching your selected filters.
                </div>
              )}
            </div>

            {/* Pagination Controls (6 products per page) */}
            {sortedProducts.length > 0 && (
              <div className="shopDetailsPagination">
                <div className="sdPaginationPrev">
                  <p
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                        scrollToTop();
                      }
                    }}
                    style={{
                      opacity: currentPage === 1 ? 0.4 : 1,
                      cursor: currentPage === 1 ? "default" : "pointer",
                    }}
                  >
                    <FaAngleLeft />
                    Prev
                  </p>
                </div>

                <div className="sdPaginationNumber" style={{ display: "flex", gap: "6px" }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <div
                      key={pageNum}
                      className={`paginationNum ${currentPage === pageNum ? "active" : ""}`}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        scrollToTop();
                      }}
                      style={{
                        padding: "6px 12px",
                        background: currentPage === pageNum ? "#1b1b1b" : "#f0f0f0",
                        color: currentPage === pageNum ? "#fff" : "#333",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      <p style={{ margin: 0 }}>{pageNum}</p>
                    </div>
                  ))}
                </div>

                <div className="sdPaginationNext">
                  <p
                    onClick={() => {
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1);
                        scrollToTop();
                      }
                    }}
                    style={{
                      opacity: currentPage === totalPages ? 0.4 : 1,
                      cursor: currentPage === totalPages ? "default" : "pointer",
                    }}
                  >
                    Next
                    <FaAngleRight />
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Drawer */}
      <div className={`filterDrawer ${isDrawerOpen ? "open" : ""}`}>
        <div className="drawerHeader">
          <p>Filter By</p>
          <IoClose onClick={closeDrawer} className="closeButton" size={26} />
        </div>
        <div className="drawerContent">
          <Filter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedPriceOption={selectedPriceOption}
            setSelectedPriceOption={setSelectedPriceOption}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            searchKeyword={searchKeyword}
            setSearchKeyword={setSearchKeyword}
          />
        </div>
      </div>
    </>
  );
};

export default ShopDetails;
