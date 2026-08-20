import "./globals.css";
import Providers from "./providers";
import Navbar from "../Components/Header/Navbar";
import Footer from "../Components/Footer/Footer";
import ScrollToTop from "../Components/ScrollButton/ScrollToTop";

export const metadata = {
  title: "UOMO - Ecommerce Website",
  description: "UOMO Ecommerce Website built with Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ScrollToTop />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
