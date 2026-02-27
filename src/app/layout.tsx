import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { VehicleProvider } from "@/context/VehicleContext";
import PromoBanner from "@/components/PromoBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: {
    default: "Mongoori Finds | Tesla Maintenance Essentials",
    template: "%s | Mongoori Finds",
  },
  description:
    "Tesla maintenance essentials tested by a real rental fleet in California. Cabin filters, wipers, key cards, and cleaning kits for Model 3 & Model Y.",
  keywords: ["Tesla", "Model 3", "Model Y", "maintenance", "accessories", "California"],
  openGraph: {
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <CartProvider>
          <VehicleProvider>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Mongoori Finds",
                description: "Tesla maintenance essentials tested by a real rental fleet in California.",
                url: "https://mongoorifinds.com",
              }),
            }}
          />
          <PromoBanner
            title="Free shipping on orders over $50"
            description="Use code at checkout."
            code="SHIP50"
            ctaText="Shop now"
            ctaHref="/products"
          />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          </VehicleProvider>
        </CartProvider>
      </body>
    </html>
  );
}
