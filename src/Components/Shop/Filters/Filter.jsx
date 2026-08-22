"use client";

import React, { useState, useEffect } from "react";
import "./Filter.css";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { IoIosArrowDown } from "react-icons/io";
import { BiSearch } from "react-icons/bi";
import api from "../../../utils/api";

const Filter = ({
  selectedCategory = "all",
  setSelectedCategory = () => {},
  selectedPriceOption = "all",
  setSelectedPriceOption = () => {},
  selectedSize = "all",
  setSelectedSize = () => {},
  searchKeyword = "",
  setSearchKeyword = () => {},
}) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const data = await api.getCategories();
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        } else if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (err) {
        console.warn("Could not load categories dynamically:", err);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const handleSizeClick = (size) => {
    if (selectedSize === size) {
      setSelectedSize("all");
    } else {
      setSelectedSize(size);
    }
  };

  const priceOptions = [
    { id: "all", label: "All Prices" },
    { id: "under-499", label: "Under ₹499" },
    { id: "499-1499", label: "₹499 - ₹1,499" },
    { id: "1499-2999", label: "₹1,499 - ₹2,999" },
    { id: "above-2999", label: "Above ₹2,999" },
  ];

  const filterSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  return (
    <div className="filterSection">
      {/* Search Input */}
      <div className="filterSearchBox" style={{ marginBottom: "20px" }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 36px 10px 14px",
              border: "1px solid #e0e0e0",
              borderRadius: "6px",
              fontSize: "14px",
              outline: "none",
            }}
          />
          <BiSearch
            size={18}
            style={{ position: "absolute", right: "12px", color: "#888" }}
          />
        </div>
      </div>

      {/* Dynamic Categories */}
      <div className="filterCategories">
        <Accordion defaultExpanded disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<IoIosArrowDown size={20} />}
            aria-controls="panel1-content"
            id="panel1-header"
            sx={{ padding: 0, marginBottom: 2 }}
          >
            <h5 className="filterHeading">Product Categories</h5>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0 }}>
            <p
              onClick={() => setSelectedCategory("all")}
              style={{
                fontWeight: selectedCategory === "all" ? "700" : "400",
                color: selectedCategory === "all" ? "#1b1b1b" : "#555",
                cursor: "pointer",
                padding: "4px 0",
              }}
            >
              All Categories
            </p>

            {/* Men, Women, Kids quick category filters */}
            {["Men", "Women", "Kids"].map((catName) => {
              const isSelected = selectedCategory?.toLowerCase() === catName.toLowerCase();
              return (
                <p
                  key={catName}
                  onClick={() => setSelectedCategory(catName)}
                  style={{
                    fontWeight: isSelected ? "700" : "400",
                    color: isSelected ? "#c22928" : "#555",
                    cursor: "pointer",
                    padding: "4px 0",
                  }}
                >
                  {catName}
                </p>
              );
            })}

            {loadingCategories ? (
              <p style={{ fontSize: "13px", color: "#888" }}>Loading backend categories...</p>
            ) : categories.length > 0 ? (
              categories
                .filter((cat) => !["men", "women", "kids"].includes(cat.name?.toLowerCase()))
                .map((cat) => {
                  const isSelected = selectedCategory === cat._id || selectedCategory === cat.name;
                  return (
                    <p
                      key={cat._id}
                      onClick={() => setSelectedCategory(cat._id)}
                      style={{
                        fontWeight: isSelected ? "700" : "400",
                        color: isSelected ? "#c22928" : "#555",
                        cursor: "pointer",
                        padding: "4px 0",
                      }}
                    >
                      {cat.name}
                    </p>
                  );
                })
            ) : null}
          </AccordionDetails>
        </Accordion>
      </div>

      {/* Preset Price Ranges */}
      <div className="filterPrice" style={{ marginTop: "15px" }}>
        <Accordion defaultExpanded disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<IoIosArrowDown size={20} />}
            aria-controls="panel2-content"
            id="panel2-header"
            sx={{ padding: 0, marginBottom: 2 }}
          >
            <h5 className="filterHeading">Filter By Price</h5>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {priceOptions.map((opt) => (
                <label
                  key={opt.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                    color: selectedPriceOption === opt.id ? "#1b1b1b" : "#555",
                    fontWeight: selectedPriceOption === opt.id ? "600" : "400",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="priceFilterRadio"
                    checked={selectedPriceOption === opt.id}
                    onChange={() => setSelectedPriceOption(opt.id)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </AccordionDetails>
        </Accordion>
      </div>

      {/* Filter By Size (Single Select) */}
      <div className="filterSizes" style={{ marginTop: "20px" }}>
        <Accordion defaultExpanded disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<IoIosArrowDown size={20} />}
            aria-controls="panel3-content"
            id="panel3-header"
            sx={{ padding: 0, marginBottom: 2 }}
          >
            <h5 className="filterHeading">Filter By Size</h5>
          </AccordionSummary>
          <AccordionDetails sx={{ padding: 0 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {filterSizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeClick(size)}
                    style={{
                      padding: "6px 14px",
                      border: isSelected ? "2px solid #1b1b1b" : "1px solid #ccc",
                      background: isSelected ? "#1b1b1b" : "#fff",
                      color: isSelected ? "#fff" : "#333",
                      borderRadius: "4px",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontWeight: "600",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            {selectedSize !== "all" && (
              <p
                onClick={() => setSelectedSize("all")}
                style={{
                  fontSize: "12px",
                  color: "#c32929",
                  marginTop: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Clear Size Filter ({selectedSize})
              </p>
            )}
          </AccordionDetails>
        </Accordion>
      </div>
    </div>
  );
};

export default Filter;
