import React from "react";
import "./Instagram.css";
import insta1 from "../../../Assets/Instagram/insta1.jpg";
import insta2 from "../../../Assets/Instagram/insta2.jpg";
import insta3 from "../../../Assets/Instagram/insta3.jpg";
import insta4 from "../../../Assets/Instagram/insta4.jpg";
import insta5 from "../../../Assets/Instagram/insta5.jpg";
import insta6 from "../../../Assets/Instagram/insta6.jpg";
import insta7 from "../../../Assets/Instagram/insta7.jpg";
import insta8 from "../../../Assets/Instagram/insta8.jpg";
import insta9 from "../../../Assets/Instagram/insta9.jpg";
import insta10 from "../../../Assets/Instagram/insta10.jpg";
import insta11 from "../../../Assets/Instagram/insta11.jpg";
import insta12 from "../../../Assets/Instagram/insta12.jpg";

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
