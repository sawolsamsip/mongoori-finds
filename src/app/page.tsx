import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import TrustBadge from "@/components/TrustBadge";
import HeroSlider from "@/components/HeroSlider";
import RidesCrossellBanner from "@/components/RidesCrossellBanner";

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <>
      <HeroSlider />

      <section aria-labelledby="featured-heading" className="py-20 sm:py-28 lg:py-32 border-t border-black/5 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm font-semibold text-[#3b82f6] dark:text-[#60a5fa] tracking-[0.2em] uppercase mb-4">
            Shop
          </p>
          <h2 id="featured-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-black dark:text-white tracking-tight mb-16">
            Featured products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-14">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-md border-2 border-black/20 dark:border-white/20 px-8 py-3.5 text-base font-semibold text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              View all products →
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="why-heading" className="py-20 sm:py-28 lg:py-32 bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs sm:text-sm font-semibold text-[#3b82f6] dark:text-[#60a5fa] tracking-[0.2em] uppercase mb-4">
            Why us
          </p>
          <h2 id="why-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center text-black dark:text-white tracking-tight mb-16">
            Why Mongoori Finds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <TrustBadge
              icon="fleet"
              title="Fleet-tested"
              description="Every product is used in our Tesla rental fleet. If it doesn’t hold up, we don’t sell it."
            />
            <TrustBadge
              icon="quality"
              title="Quality first"
              description="We choose reliability and fit over flash. Simple, proven essentials for your car."
            />
            <TrustBadge
              icon="support"
              title="Real support"
              description="Questions about fit or install? We’re Tesla people. We’ll help you get it right."
            />
            <TrustBadge
              icon="usa"
              title="Based in California"
              description="We’re a US-based Tesla rental company. Your order is handled here, not drop-shipped."
            />
          </div>
        </div>
      </section>

      <RidesCrossellBanner />

      <section aria-labelledby="trust-heading" className="py-20 sm:py-28 border-t border-black/5 dark:border-white/5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs sm:text-sm font-semibold text-[#3b82f6] dark:text-[#60a5fa] tracking-[0.2em] uppercase mb-4">
            Trust
          </p>
          <h2 id="trust-heading" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black dark:text-white tracking-tight mb-6">
            Trusted by Tesla owners
          </h2>
          <p className="text-lg text-black/65 dark:text-white/65 max-w-xl mx-auto mb-12 leading-relaxed">
            Model 3 and Model Y owners across the US rely on us for cabin filters, wipers, key cards, and cleaning kits. Same parts we use on our rental fleet—same quality you get at home.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center justify-center rounded-md bg-black dark:bg-white text-white dark:text-black px-10 py-4 text-base font-semibold hover:opacity-90 transition-opacity"
          >
            Our story
          </Link>
        </div>
      </section>
    </>
  );
}
