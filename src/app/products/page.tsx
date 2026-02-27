import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import VehicleSelector from "@/components/VehicleSelector";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Tesla maintenance essentials: cabin air filters, wiper blades, key cards, and interior cleaning kits for Model 3, Y, S, X, Cybertruck.",
};

export default function ProductsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-black dark:text-brand-white">
          Products
        </h1>
        <p className="mt-2 text-brand-slate dark:text-brand-silver">
          Maintenance essentials for Tesla. Select your vehicle to see which parts fit.
        </p>
      </header>

      <section aria-label="Vehicle selector" className="mb-10">
        <VehicleSelector variant="full" />
      </section>

      <section aria-label="Product grid">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
