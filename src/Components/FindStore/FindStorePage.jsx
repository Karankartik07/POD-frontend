"use client";

import React, { useState } from "react";
import "./FindStorePage.css";
import { FiMapPin, FiPhone, FiClock, FiNavigation, FiHome } from "react-icons/fi";

const FindStorePage = () => {
  const [selectedCity, setSelectedCity] = useState("all");

  const stores = [
    {
      id: 1,
      name: "PrintMyWay Flagship Studio - Mumbai",
      city: "mumbai",
      address: "A-791, Bandra Reclamation Rd, Bandra West, Mumbai, Maharashtra 400050",
      phone: "+91 80 7123 4567",
      timing: "Mon - Sat: 10:00 AM - 9:00 PM",
      features: ["Custom Print Preview Studio", "Instant T-Shirt Printing", "Bulk Pickup"]
    },
    {
      id: 2,
      name: "PrintMyWay Experience Hub - Delhi NCR",
      city: "delhi",
      address: "Plot 42, Connaught Place, Inner Circle, New Delhi, Delhi 110001",
      phone: "+91 11 4123 9876",
      timing: "Mon - Sun: 10:30 AM - 9:30 PM",
      features: ["Custom Merch Studio", "Sample Fabric Touch & Feel", "Express Printing"]
    },
    {
      id: 3,
      name: "PrintMyWay Retail & Custom Hub - Bengaluru",
      city: "bengaluru",
      address: "100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038",
      phone: "+91 80 4987 6543",
      timing: "Mon - Sat: 10:00 AM - 8:30 PM",
      features: ["3D Merch Design Help", "Team Merchandise Studio"]
    }
  ];

  const filteredStores = stores.filter(
    (s) => selectedCity === "all" || s.city === selectedCity
  );

  return (
    <div className="fsPageWrapper">
      <div className="fsContainer">
        
        {/* Banner */}
        <div className="fsBanner">
          <div className="fsBadge">
            <FiHome /> Retail Outlets & Print Studios
          </div>
          <h1>Find a Store Near You</h1>
          <p>
            Visit our physical experience centers to touch fabrics, test custom designs, and consult with print specialists.
          </p>

          <div className="fsFilters">
            {[
              { id: "all", label: "All Locations" },
              { id: "mumbai", label: "Mumbai" },
              { id: "delhi", label: "Delhi NCR" },
              { id: "bengaluru", label: "Bengaluru" }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setSelectedCity(btn.id)}
                className={`fsFilterBtn ${selectedCity === btn.id ? "active" : "inactive"}`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Store Grid */}
        <div className="fsGrid">
          {filteredStores.map((store) => (
            <div key={store.id} className="fsCard">
              <div>
                <div className="fsCardHeader">
                  <div className="fsStoreIcon">
                    <FiHome />
                  </div>
                  <div>
                    <h3>{store.name}</h3>
                    <span className="fsCityTag">{store.city}</span>
                  </div>
                </div>

                <div className="fsDetails">
                  <div className="fsDetailRow">
                    <FiMapPin color="#c22928" style={{ marginTop: "3px", flexShrink: 0 }} />
                    <span>{store.address}</span>
                  </div>
                  <div className="fsDetailRow">
                    <FiPhone color="#c22928" style={{ flexShrink: 0 }} />
                    <a href={`tel:${store.phone}`} style={{ color: "inherit", textDecoration: "none" }}>{store.phone}</a>
                  </div>
                  <div className="fsDetailRow">
                    <FiClock color="#c22928" style={{ flexShrink: 0 }} />
                    <span>{store.timing}</span>
                  </div>
                </div>

                <div className="fsFeatures">
                  {store.features.map((feat, idx) => (
                    <span key={idx} className="fsFeatureBadge">
                      ✓ {feat}
                    </span>
                  ))}
                </div>
              </div>

              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(store.address)}`}
                target="_blank"
                rel="noreferrer"
                className="fsDirectionBtn"
              >
                <FiNavigation /> Get Directions
              </a>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default FindStorePage;
