"use client";

import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <article
      className="group flex flex-col bg-white dark:bg-white/[0.03] rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden hover:border-black/15 dark:hover:border-white/15 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 animate-slide-up"
      itemScope
      itemType="https://schema.org/Product"
    >
      <Link href={`/products/${product.slug}`} className="block aspect-square relative bg-black/[0.03] dark:bg-white/[0.05] overflow-hidden">
        <ProductImage
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </Link>
      <div className="p-5 sm:p-6 flex flex-col flex-1">
        <h2 className="font-semibold text-lg text-black dark:text-white mb-1.5">
          <Link href={`/products/${product.slug}`} className="hover:underline">
            <span itemProp="name">{product.name}</span>
          </Link>
        </h2>
        <p className="text-sm text-black/65 dark:text-white/65 mb-4 line-clamp-2 leading-relaxed" itemProp="description">
          {product.shortDescription}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-black dark:text-white" itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <span itemProp="price" content={String(product.price / 100)}>
                {formatPrice(product.price)}
              </span>
            </span>
            {product.compareAtPrice && (
              <span className="text-sm text-black/50 dark:text-white/50 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => addItem(product)}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-black dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
            aria-label={`Add ${product.name} to cart`}
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}
