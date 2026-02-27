"use client";

import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/products";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      onClick={() => addItem(product)}
      className="inline-flex items-center justify-center rounded-lg bg-brand-black dark:bg-brand-white text-white dark:text-brand-black px-8 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
    >
      Add to cart
    </button>
  );
}
