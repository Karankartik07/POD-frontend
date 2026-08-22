import { Suspense } from "react";
import ShopDetails from "../../Components/Shop/ShopDetails/ShopDetails";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "60px", color: "#666" }}>Loading shop...</div>}>
      <ShopDetails />
    </Suspense>
  );
}
