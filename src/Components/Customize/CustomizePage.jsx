"use client";

import React, { useState, useEffect, useMemo } from "react";
import "./CustomizePage.css";
import { useDispatch, useSelector } from "react-redux";
import { addToWishList, removeFromWishList } from "../../Features/Wishlist/wishListSlice";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { getProductStockStatus } from "../../utils/productUtils";
import Filter from "../Shop/Filters/Filter";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FiHeart, FiLayers, FiCheckCircle } from "react-icons/fi";
import { FaStar, FaTshirt, FaHatWizard } from "react-icons/fa";
import { BiCustomize } from "react-icons/bi";
import { IoFilterSharp, IoClose } from "react-icons/io5";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";
import toast from "react-hot-toast";
import api from "../../utils/api";

const CUSTOMIZER_API_URL = "https://backend.krcustomizer.com/api/layerdesigns/custom/kartik1234";

const CustomizePage = () => {
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

  useEffect(() => {
    if (searchParams) {
      const cat = searchParams.get("category");
      const search = searchParams.get("search");
      if (cat) setSelectedCategory(cat);
      if (search) setSearchKeyword(search);
    }
  }, [searchParams]);

  // Pagination state (6 products per page)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const [wishListMap, setWishListMap] = useState({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const wishlistItems = useSelector((state) => state.wishlist.items);

  // Fetch KRCustomizer products API and match with Shop Products API by ID
  useEffect(() => {
    async function loadAndMatchProducts() {
      try {
        setLoading(true);

        // 1. Fetch KRCustomizer layer designs API
        let customizerItems = [];
        try {
          const custRes = await fetch(CUSTOMIZER_API_URL);
          if (custRes.ok) {
            customizerItems = await custRes.json();
            console.log("Customizer layer designs fetched:", customizerItems);
          }
        } catch (e) {
          console.warn("Could not fetch customizer layer designs:", e);
        }

        // Collect customizer product IDs and map of details
        const customizerProductIds = new Set();
        const customizerMap = new Map();

        if (Array.isArray(customizerItems)) {
          customizerItems.forEach((item) => {
            const cId = String(item.customproductId || item.productId || item.id || item._id);
            customizerProductIds.add(cId);
            if (item.customproductId) customizerProductIds.add(String(item.customproductId));
            if (item.productId) customizerProductIds.add(String(item.productId));
            if (item.id) customizerProductIds.add(String(item.id));
            if (item._id) customizerProductIds.add(String(item._id));

            customizerMap.set(cId, item);
          });
        }

        // 2. Fetch Shop Products API
        let allShopProducts = [];
        try {
          const data = await api.getProducts({ limit: 100 });
          if (data.success && data.data && data.data.products) {
            allShopProducts = data.data.products;
          } else if (Array.isArray(data)) {
            allShopProducts = data;
          }
        } catch (err) {
          console.warn("Could not load shop database products:", err);
        }

        // 3. Filter Shop products whose _id / id matches customizer API product IDs
        let filteredCustomizableProducts = allShopProducts.filter((p) => {
          const pId = String(p._id || p.id || "");
          return customizerProductIds.has(pId);
        });

        // 4. Fallback if shop DB product IDs don't match customizer IDs directly:
        // Use customizer products as the source list so only valid customizable products are displayed
        if (filteredCustomizableProducts.length === 0 && Array.isArray(customizerItems) && customizerItems.length > 0) {
          filteredCustomizableProducts = customizerItems.map((item) => {
            const matchedShopItem = allShopProducts.find(
              (sp) =>
                String(sp._id) === String(item.customproductId) ||
                String(sp._id) === String(item.productId) ||
                sp.name?.toLowerCase() === item.productName?.toLowerCase()
            );

            if (matchedShopItem) return matchedShopItem;

            return {
              _id: item.customproductId || String(item.productId || item.id),
              name: item.productName || `Customizable Product #${item.productId}`,
              price: 999,
              salePrice: 799,
              mainImage: item.productImage || "https://res.cloudinary.com/dlzxiy0tl/image/upload/v1781525765/Rectangle_23_10_roxkwo.png",
              images: [item.productImage || "https://res.cloudinary.com/dlzxiy0tl/image/upload/v1781525765/Rectangle_23_10_roxkwo.png"],
              description: "Customizable 3D apparel item. Personalize print layers, colors, and graphics live in browser.",
              category: { name: "Custom Apparel" },
              rating: 5,
              numReviews: 10,
              customizerId: item.productId,
            };
          });
        }

        setProducts(filteredCustomizableProducts);
      } catch (err) {
        console.error("Error loading customizable products:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAndMatchProducts();
  }, []);

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
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Dynamic Filtering
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
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

      if (searchKeyword.trim()) {
        const query = searchKeyword.toLowerCase();
        const nameMatch = p.name ? p.name.toLowerCase().includes(query) : false;
        const descMatch = p.description ? p.description.toLowerCase().includes(query) : false;
        if (!nameMatch && !descMatch) return false;
      }

      const price = p.salePrice && p.salePrice > 0 ? p.salePrice : p.price || 0;
      if (selectedPriceOption === "under-499" && price >= 499) return false;
      if (selectedPriceOption === "499-1499" && (price < 499 || price > 1499)) return false;
      if (selectedPriceOption === "1499-2999" && (price < 1499 || price > 2999)) return false;
      if (selectedPriceOption === "above-2999" && price <= 2999) return false;

      if (selectedSize !== "all") {
        const hasSizesArr = p.sizes && Array.isArray(p.sizes) && p.sizes.some((s) => (s.size || s).toString().toUpperCase() === selectedSize.toUpperCase());
        const hasVariantsArr = p.variants && Array.isArray(p.variants) && p.variants.some((v) => v.size && v.size.toString().toUpperCase() === selectedSize.toUpperCase());
        const hasAttrSize = p.attributes && Array.isArray(p.attributes) && p.attributes.some((a) => a.key && a.key.toLowerCase() === "size" && a.value && a.value.toString().toUpperCase() === selectedSize.toUpperCase());

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

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
  const currentProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  return (
    <div className="custPageWrapper">
      <div className="custContainer" style={{ marginBottom: "40px" }}>
        {/* Banner Section */}
        <div className="custHero">
          <div className="custBadge">
            <FaHatWizard /> 3D Interactive Design Studio
          </div>
          <h1>Customizable Apparel & Merchandise</h1>
          <p>
            Browse verified customizable products. Select any item to open its product details page and customize live with full 3D preview.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="custFeaturesGrid">
          <div className="custFeatureBox">
            <div className="custFeatureIcon">
              <FiLayers />
            </div>
            <div>
              <h4>3D Live Preview</h4>
              <p>Personalize apparel with instant 3D rendering and full color control.</p>
            </div>
          </div>

          <div className="custFeatureBox">
            <div className="custFeatureIcon">
              <FaTshirt />
            </div>
            <div>
              <h4>Premium Quality</h4>
              <p>100% Combed Cotton, bio-washed fabric engineered for long-lasting prints.</p>
            </div>
          </div>

          <div className="custFeatureBox">
            <div className="custFeatureIcon">
              <FiCheckCircle />
            </div>
            <div>
              <h4>No Minimum Quantity</h4>
              <p>Order individual custom items or print in bulk for teams and events.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dynamic Product Listing (Shop style) */}
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
                <Link href="/customize">Customize Studio</Link>
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
                  Loading customizable products...
                </div>
              ) : currentProducts.length > 0 ? (
                <div className="shopDetailsProductsContainer">
                  {currentProducts.map((product) => {
                    const id = product._id;
                    const isWishlisted = wishListMap[id] || wishlistItems.some((i) => i._id === id);
                    const frontImg =
                      product.mainImage ||
                      (product.images && product.images[0]) ||
                      "https://res.cloudinary.com/dlzxiy0tl/image/upload/v1781525765/Rectangle_23_10_roxkwo.png";
                    const backImg = (product.images && product.images[1]) || frontImg;

                    const reviewCount = product.numReviews || (product.reviews ? product.reviews.length : 0);
                    const calcRating =
                      product.rating ||
                      (product.reviews && product.reviews.length > 0
                        ? Math.round(product.reviews.reduce((a, b) => a + b.rating, 0) / product.reviews.length)
                        : 5);

                    return (
                      <div className="sdProductContainer" key={id}>
                        <div className="sdProductImages">
                          <Link href={`/product?id=${id}`} onClick={scrollToTop}>
                            <img src={frontImg} alt={product.name} className="sdProduct_front" />
                            <img src={backImg} alt={product.name} className="sdProduct_back" />
                          </Link>

                          {/* Action Button: View Details & Customize on PDP */}
                          <Link
                            href={`/product?id=${id}`}
                            onClick={scrollToTop}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                              background: "#3559C7",
                              color: "#fff",
                              textDecoration: "none",
                              padding: "10px",
                              fontSize: "13px",
                              fontWeight: "700",
                              textTransform: "uppercase",
                              borderRadius: "0 0 4px 4px",
                            }}
                          >
                            <BiCustomize size={16} /> View & Customize
                          </Link>
                        </div>

                        <div className="sdProductInfo">
                          <div className="sdProductCategoryWishlist">
                            <p>{product.category?.name || "Custom Apparel"}</p>
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
                                  <span style={{ fontWeight: "700", color: "#1b1b1b" }}>₹{product.salePrice}</span>
                                </>
                              ) : (
                                <span style={{ fontWeight: "700", color: "#1b1b1b" }}>₹{product.price}</span>
                              )}
                            </div>

                            <div className="sdProductRatingReviews">
                              <div className="sdProductRatingStar">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <FaStar key={star} color={star <= calcRating ? "#FEC78A" : "#e0e0e0"} size={11} />
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
                  No customizable products found matching your selected filters.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
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

      {/* Filter Drawer for Mobile */}
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
    </div>
  );
};

export default CustomizePage;
