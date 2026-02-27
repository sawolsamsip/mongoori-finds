import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { products, formatPrice } from "@/lib/products";
import AddToCartButton from "@/app/products/[slug]/AddToCartButton";

const bundleSlugs = [
  "tesla-cabin-air-filter",
  "tesla-wiper-blade-set",
  "tesla-interior-cleaning-kit",
];

export const metadata = {
  title: "Maintenance Bundle",
  description:
    "Save when you buy the complete maintenance set: cabin filter, wiper blades, and interior cleaning kit for Tesla Model 3 & Model Y.",
};

export default function BundlePage() {
  const bundleProducts = bundleSlugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter(Boolean) as typeof products;

  const totalRegular = bundleProducts.reduce((sum, p) => sum + (p.compareAtPrice ?? p.price), 0);
  const totalBundle = bundleProducts.reduce((sum, p) => sum + p.price, 0);
  const savings = totalRegular - totalBundle;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <header className="text-center mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-black dark:text-brand-white">
          Maintenance Bundle
        </h1>
        <p className="mt-4 text-lg text-brand-slate dark:text-brand-silver max-w-xl mx-auto">
          Everything you need for routine Tesla maintenance in one set. Fleet-tested; save when you buy together.
        </p>
      </header>

      <section className="rounded-2xl border-2 border-accent/30 bg-brand-white/50 dark:bg-brand-slate/10 p-6 sm:p-10 mb-12">
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <span className="text-brand-silver line-through text-lg">{formatPrice(totalRegular)}</span>
          <span className="text-3xl font-bold text-brand-black dark:text-brand-white">{formatPrice(totalBundle)}</span>
          <span className="rounded-full bg-accent/20 text-accent px-4 py-1.5 text-sm font-semibold">
            Save {formatPrice(savings)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          {bundleProducts.map((product) => (
            <div
              key={product.id}
              className="flex flex-col rounded-xl border border-border bg-white dark:bg-brand-charcoal overflow-hidden"
            >
              <div className="aspect-square relative bg-brand-white dark:bg-brand-slate/20">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-brand-black dark:text-brand-white">{product.name}</h2>
                <p className="text-sm text-brand-slate dark:text-brand-silver mt-1">{product.shortDescription}</p>
                <p className="mt-2 font-medium">{formatPrice(product.price)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          {bundleProducts.map((product) => (
            <AddToCartButton key={product.id} product={product} />
          ))}
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
          >
            Shop individually
          </Link>
        </div>
      </section>

      <section className="text-center text-brand-slate dark:text-brand-silver text-sm">
        <p>Add each item to cart from this page, or shop individual products. No promo code needed for bundle pricing when buying the set.</p>
      </section>
    </div>
  );
}
