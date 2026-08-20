import { Suspense } from "react";
import Product from "../../Components/Product/ProductMain/Product";
import AdditionalInfo from "../../Components/Product/AdditonInfo/AdditionalInfo";
import RelatedProducts from "../../Components/Product/RelatedProducts/RelatedProducts";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "100px 0", fontSize: "18px", color: "#666", fontWeight: "500" }}>
          Loading product page...
        </div>
      }
    >
      <Product />
      <AdditionalInfo />
      <RelatedProducts />
    </Suspense>
  );
}
