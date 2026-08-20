import dynamic from "next/dynamic";

const HeroSection = dynamic(
  () => import("../Components/Home/Hero/HeroSection"),
  { ssr: false }
);
import CollectionBox from "../Components/Home/Collection/CollectionBox";
import Trendy from "../Components/Home/Trendy/Trendy";
import Banner from "../Components/Home/Banner/Banner";
import DealTimer from "../Components/Home/Deal/DealTimer";
import LimitedEdition from "../Components/Home/Limited/LimitedEdition";
import Services from "../Components/Home/Services/Services";
import Instagram from "../Components/Home/Instagram/Instagram";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CollectionBox />
      <Trendy />
      <Banner />
      <DealTimer />
      <LimitedEdition />
      <Services />
      <Instagram />
    </>
  );
}
