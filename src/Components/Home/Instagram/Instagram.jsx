import React from "react";
import "./Instagram.css";
const insta1 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230475/pod_assets/Instagram/insta1.jpg";
const insta2 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230478/pod_assets/Instagram/insta2.jpg";
const insta3 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230479/pod_assets/Instagram/insta3.jpg";
const insta4 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230480/pod_assets/Instagram/insta4.jpg";
const insta5 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230481/pod_assets/Instagram/insta5.jpg";
const insta6 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230482/pod_assets/Instagram/insta6.jpg";
const insta7 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230483/pod_assets/Instagram/insta7.jpg";
const insta8 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230484/pod_assets/Instagram/insta8.jpg";
const insta9 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230484/pod_assets/Instagram/insta9.jpg";
const insta10 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230476/pod_assets/Instagram/insta10.jpg";
const insta11 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230477/pod_assets/Instagram/insta11.jpg";
const insta12 = "https://res.cloudinary.com/usn1yap2/image/upload/v1787230478/pod_assets/Instagram/insta12.jpg";

const Instagram = () => {
  const images = [
    insta1,
    insta2,
    insta3,
    insta4,
    insta5,
    insta6,
    insta7,
    insta8,
    insta9,
    insta10,
    insta11,
    insta12,
  ];

  return (
    <>
      <div className="instagram">
        <h2>@UOMO</h2>
        <div className="instagramTiles">
          {images.map((img, index) => (
            <div className="instagramtile" key={index}>
              <img src={img.src || img} alt={`Instagram ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Instagram;
