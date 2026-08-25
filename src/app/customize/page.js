import { Suspense } from "react";
import CustomizePage from "../../Components/Customize/CustomizePage";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "60px", color: "#666" }}>Loading visualizer...</div>}>
      <CustomizePage />
    </Suspense>
  );
}

