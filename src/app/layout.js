import "./globals.css";
import Providers from "./providers";
import Navbar from "../Components/Header/Navbar";
import Footer from "../Components/Footer/Footer";
import ScrollToTop from "../Components/ScrollButton/ScrollToTop";

export const metadata = {
  title: "POD | Premium Fashion & Print On Demand Store",
  description: "Discover exclusive handcrafted apparel, customized print-on-demand fashion, trendy accessories, and premium lifestyle collections at POD.",
  keywords: ["POD", "Print on demand", "Fashion", "E-commerce", "Handcrafted", "Apparel", "Clothing"],
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon.ico" }
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "POD | Premium Fashion & Print On Demand Store",
    description: "Discover exclusive handcrafted apparel, customized print-on-demand fashion, and premium collections at POD.",
    siteName: "POD E-Commerce",
    type: "website",
  },
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
