import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { notFound } from "next/navigation";
import { getProductBySlug, formatPrice } from "@/lib/products";
import AddToCartButton from "./AddToCartButton";
import ReviewSection from "@/components/ReviewSection";
import TrustBadge from "@/components/TrustBadge";
import RidesCrossellBanner from "@/components/RidesCrossellBanner";
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product" };
  const priceFormatted = (product.price / 100).toFixed(2);
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: {
      canonical: `https://finds.mongoori.com/products/${product.slug}`,
    },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      url: `https://finds.mongoori.com/products/${product.slug}`,
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.shortDescription,
      images: [product.image],
    },
    other: {
      "product:price:amount": priceFormatted,
      "product:price:currency": "USD",
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: `https://finds.mongoori.com${product.image}`,
    brand: {
      "@type": "Brand",
      name: "Mongoori Finds",
    },
    offers: {
      "@type": "Offer",
      url: `https://finds.mongoori.com/products/${product.slug}`,
      priceCurrency: "USD",
      price: (product.price / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Mongoori Finds",
      },
    },
    category: product.category,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
    <article className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16" itemScope itemType="https://schema.org/Product">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        <section aria-label="Product gallery" className="space-y-4">
          <div className="aspect-square relative rounded-2xl overflow-hidden bg-brand-white dark:bg-brand-slate/20">
            <ProductImage
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {product.images.slice(0, 3).map((img, i) => (
              <div key={i} className="aspect-square relative rounded-lg overflow-hidden bg-brand-white dark:bg-brand-slate/20">
                <ProductImage src={img} alt="" fill sizes="150px" className="object-cover" />
              </div>
            ))}
          </div>
        </section>

        <div>
          <p className="text-sm text-brand-silver uppercase tracking-wider">{product.category}</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-brand-black dark:text-brand-white" itemProp="name">
            {product.name}
          </h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold" itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <span itemProp="price" content={String(product.price / 100)}>
                {formatPrice(product.price)}
              </span>
            </span>
            {product.compareAtPrice && (
              <span className="text-lg text-brand-silver line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>

          <p className="mt-6 text-brand-slate dark:text-brand-silver" itemProp="description">
            {product.description}
          </p>

          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-slate dark:text-brand-silver mb-2">
              Compatibility
            </h2>
            <ul className="flex flex-wrap gap-2">
              {product.compatibility.map((c) => (
                <li key={c} className="px-3 py-1 rounded-full bg-brand-white dark:bg-brand-slate/20 text-sm">
                  {c}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-slate dark:text-brand-silver mb-3">
              Benefits
            </h2>
            <ul className="space-y-2">
              {product.benefits.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm">
                  <span className="text-accent mt-0.5" aria-hidden>✓</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {product.installationNote && (
            <div className="mt-8 p-4 rounded-xl bg-brand-white dark:bg-brand-slate/10 border border-border">
              <h3 className="text-sm font-semibold mb-1">Installation</h3>
              <p className="text-sm text-brand-slate dark:text-brand-silver">{product.installationNote}</p>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-4">
            <AddToCartButton product={product} />
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
            >
              Back to products
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <TrustBadge
              icon="fleet"
              title="Fleet-tested"
              description="Used in our Tesla rental fleet."
            />
            <TrustBadge
              icon="usa"
              title="Ships from USA"
              description="California-based."
            />
          </div>
        </div>
      </div>

      <section className="mt-16 pt-16 border-t border-border">
        <ReviewSection productId={product.id} productSlug={product.slug} />
      </section>

      <div className="mt-16 -mx-4 sm:-mx-6">
        <RidesCrossellBanner />
      </div>
    </article>
    </>
  );
}
