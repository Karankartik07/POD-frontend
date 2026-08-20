"use client";

import React from "react";
import "./AboutPage.css";

const about1 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230455/pod_assets/About/about-1.jpg";
const about2 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230457/pod_assets/About/about-2.jpg";

import Services from "../../Components/Home/Services/Services";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";

const brand1 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230467/pod_assets/Brands/brand1.png";
const brand2 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230467/pod_assets/Brands/brand2.png";
const brand3 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230468/pod_assets/Brands/brand3.png";
const brand4 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230469/pod_assets/Brands/brand4.png";
const brand5 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230470/pod_assets/Brands/brand5.png";
const brand6 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230471/pod_assets/Brands/brand6.png";
const brand7 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230471/pod_assets/Brands/brand7.png";

const AboutPage = () => {
  const brands = [brand1, brand2, brand3, brand4, brand5, brand6, brand7];

  return (
    <>
      <div className="aboutSection">
        <h2>About Uomo</h2>
        <img src={about1.src || about1} alt="" />
        <div className="aboutContent">
          <h3>Our Story</h3>
          <h4>
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </h4>
          <p>
            Saw wherein fruitful good days image them, midst, waters upon, saw.
            Seas lights seasons. Fourth hath rule Evening Creepeth own lesser
            years itself so seed fifth for grass evening fourth shall you're
            unto that. Had. Female replenish for yielding so saw all one to
            yielding grass you'll air sea it, open waters subdue, hath. Brought
            second Made. Be. Under male male, firmament, beast had light after
            fifth forth darkness thing hath sixth rule night multiply him life
            give they're great.
          </p>
          <div className="content1">
            <div className="contentBox">
              <h5>Our Mission</h5>
              <p>
                Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                commodo consequat.
              </p>
            </div>
            <div className="contentBox">
              <h5>Our Vision</h5>
              <p>
                Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                commodo consequat.
              </p>
            </div>
          </div>
          <div className="content2">
            <div className="imgContent">
              <img src={about2.src || about2} alt="" />
            </div>
            <div className="textContent">
              <h5>The Company</h5>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet
                sapien dignissim a elementum. Sociis metus, hendrerit mauris id
                in. Quis sit sit ultrices tincidunt euismod luctus diam. Turpis
                sodales orci etiam phasellus lacus id leo. Amet turpis nunc,
                nulla massa est viverra interdum. Praesent auctor nulla morbi
                non posuere mattis. Arcu eu id maecenas cras.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Services />
      <div className="companyPartners">
        <h5>Company Partners</h5>
        <Swiper
          slidesPerView={1}
          loop={true}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 5,
            },

            768: {
              slidesPerView: 4,
              spaceBetween: 40,
            },

            1024: {
              slidesPerView: 5,
              spaceBetween: 50,
            },
          }}
          spaceBetween={10}
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          modules={[Autoplay]}
        >
          {brands.map((brand, index) => (
            <SwiperSlide key={index}>
              <div className="aboutBrands">
                <img src={brand.src || brand} alt={`Brand ${index + 1}`} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
};

export default AboutPage;
