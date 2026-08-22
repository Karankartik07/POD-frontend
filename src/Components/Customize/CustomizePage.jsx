"use client";

import React, { useState } from "react";
import "./CustomizePage.css";
import { FiLayers, FiUpload, FiCheckCircle, FiShoppingBag, FiImage } from "react-icons/fi";
import { FaHatWizard, FaTshirt } from "react-icons/fa";
import toast from "react-hot-toast";

const CustomizePage = () => {
  const [customText, setCustomText] = useState("");
  const [selectedColor, setSelectedColor] = useState("#18181b");
  const [selectedProductType, setSelectedProductType] = useState("tshirt");
  const [uploadedFileName, setUploadedFileName] = useState("");

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      toast.success(`Design "${file.name}" uploaded successfully!`);
    }
  };

  const handleRequestQuote = (e) => {
    e.preventDefault();
    toast.success("Custom print request submitted! Our design team will contact you shortly.");
    setCustomText("");
    setUploadedFileName("");
  };

  return (
    <div className="custPageWrapper">
      <div className="custContainer">
        
        {/* Hero */}
        <div className="custHero">
          <div className="custBadge">
            <FaHatWizard /> Print Your Way
          </div>
          <h1>Customize Your Custom Merch</h1>
          <p>
            Upload your graphics, add personalized typography, and create high-quality printed apparel, mugs, hoodies, & accessories.
          </p>
        </div>

        {/* Interactive Studio */}
        <div className="custStudioCard">
          <div className="custStudioHeader">
            <FaTshirt size={26} color="#c22928" />
            <h2>Custom Merchandise Preview Studio</h2>
          </div>

          <div className="custStudioGrid">

            {/* Left Mockup Canvas */}
            <div className="custCanvasArea">
              <div
                className="custProductMockup"
                style={{ backgroundColor: selectedColor }}
              >
                <div className="custCollar"></div>

                <div className="custPrintBox">
                  {uploadedFileName ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <FiImage size={32} color="#fca5a5" />
                      <span style={{ fontSize: "11px", fontWeight: "700", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {uploadedFileName}
                      </span>
                      <span style={{ fontSize: "10px", opacity: 0.8 }}>Custom Graphic</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: "11px", opacity: 0.6 }}>Your Logo / Artwork Here</span>
                  )}

                  {customText && (
                    <div className="custMockupText">
                      {customText}
                    </div>
                  )}
                </div>
              </div>

              <div className="custCanvasTag">Live Interactive Preview Mockup</div>
            </div>

            {/* Right Controls */}
            <form onSubmit={handleRequestQuote} className="custForm">

              {/* 1. Base Product */}
              <div>
                <label className="custFormLabel">1. Select Base Product</label>
                <div className="custProductTypes">
                  {[
                    { id: "tshirt", label: "T-Shirt" },
                    { id: "hoodie", label: "Hoodie" },
                    { id: "mug", label: "Custom Mug" }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProductType(p.id)}
                      className={`custTypeBtn ${selectedProductType === p.id ? "active" : ""}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Color Selection */}
              <div>
                <label className="custFormLabel">2. Base Color</label>
                <div className="custColors">
                  {[
                    { name: "Black", code: "#18181b" },
                    { name: "Navy", code: "#1e3a8a" },
                    { name: "Red", code: "#c22928" },
                    { name: "Forest", code: "#14532d" },
                    { name: "White", code: "#e4e4e7" }
                  ].map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => setSelectedColor(c.code)}
                      style={{ backgroundColor: c.code }}
                      className={`custColorBtn ${selectedColor === c.code ? "active" : ""}`}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* 3. Text */}
              <div>
                <label className="custFormLabel">3. Add Custom Text</label>
                <input
                  type="text"
                  placeholder="e.g. SQUAD 2026 / CUSTOM BRAND"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="custInput"
                />
              </div>

              {/* 4. Upload */}
              <div>
                <label className="custFormLabel">4. Upload Artwork (PNG/JPG)</label>
                <label className="custUploadBox">
                  <FiUpload size={18} />
                  <span>{uploadedFileName || "Choose Artwork File..."}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} />
                </label>
              </div>

              {/* Submit */}
              <button type="submit" className="custSubmitBtn">
                <FiShoppingBag size={18} /> Submit Custom Print Order
              </button>

            </form>

          </div>
        </div>

        {/* Feature Boxes */}
        <div className="custFeaturesGrid">
          <div className="custFeatureBox">
            <div className="custFeatureIcon">
              <FiLayers />
            </div>
            <div>
              <h4>Premium DTG Printing</h4>
              <p>High-definition direct-to-garment prints that won't fade or crack after washing.</p>
            </div>
          </div>

          <div className="custFeatureBox">
            <div className="custFeatureIcon">
              <FaTshirt />
            </div>
            <div>
              <h4>100% Bio-Washed Cotton</h4>
              <p>Ultra-soft 180+ GSM combed cotton for max comfort and durability.</p>
            </div>
          </div>

          <div className="custFeatureBox">
            <div className="custFeatureIcon">
              <FiCheckCircle />
            </div>
            <div>
              <h4>No Minimum Quantity</h4>
              <p>Print 1 piece for personal style or 1,000+ pieces for team events & corporate merch.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomizePage;
