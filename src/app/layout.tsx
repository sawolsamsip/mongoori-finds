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
  metadataBase: new URL("https://finds.mongoori.com"),
  title: {
    default: "Mongoori Finds | Tesla Maintenance Essentials",
    template: "%s | Mongoori Finds",
  },
  description:
    "Tesla maintenance essentials tested by a real rental fleet in California. Cabin filters, wipers, key cards, and cleaning kits for Model 3 & Model Y.",
  keywords: ["Tesla", "Model 3", "Model Y", "maintenance", "accessories", "California", "cabin filter", "wiper blades", "key card"],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Mongoori Finds",
    url: "https://finds.mongoori.com",
    title: "Mongoori Finds | Tesla Maintenance Essentials",
    description:
      "Tesla maintenance essentials tested by a real rental fleet in California. Cabin filters, wipers, key cards, and cleaning kits for Model 3 & Model Y.",
    images: [
      {
        url: "/images/airfilter.avif",
        width: 1200,
        height: 630,
        alt: "Mongoori Finds — Tesla Maintenance Essentials",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mongoori Finds | Tesla Maintenance Essentials",
    description:
      "Tesla maintenance essentials tested by a real rental fleet in California.",
    images: ["/images/airfilter.avif"],
  },
  alternates: {
    canonical: "https://finds.mongoori.com",
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
                url: "https://finds.mongoori.com",
                logo: "https://finds.mongoori.com/favicon.ico",
                sameAs: ["https://mongoori.com"],
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
