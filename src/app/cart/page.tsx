"use client";

import { useState } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/products";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckoutError(null);
    setCheckoutLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            name: i.name,
            price: i.price,
            image: i.image,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) {
        clearCart();
        window.location.href = data.url;
        return;
      }
      throw new Error("No checkout URL returned");
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout failed");
      setCheckoutLoading(false);
    }
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-brand-black dark:text-brand-white">Your cart is empty</h1>
        <p className="mt-2 text-brand-slate dark:text-brand-silver">Add products from the shop to get started.</p>
        <Link
          href="/products"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand-black dark:bg-brand-white text-white dark:text-brand-black px-6 py-3 text-sm font-medium"
        >
          Shop products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <h1 className="text-3xl font-bold text-brand-black dark:text-brand-white mb-8">Cart</h1>

      <ul className="space-y-6 divide-y divide-border">
        {items.map((item) => (
          <li key={item.productId} className="flex flex-col sm:flex-row gap-4 py-6 first:pt-0">
            <div className="relative w-full sm:w-24 aspect-square rounded-lg overflow-hidden bg-brand-white dark:bg-brand-slate/20 flex-shrink-0">
              <ProductImage src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/products/${item.slug}`} className="font-medium hover:underline">
                {item.name}
              </Link>
              <p className="text-sm text-brand-silver mt-0.5">{formatPrice(item.price)} each</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="px-3 py-1.5 text-sm w-8 text-center" aria-live="polite">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-sm text-brand-silver hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="sm:text-right font-medium">
              {formatPrice(item.price * item.quantity)}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <p className="text-xl font-semibold">
          Total: <span className="text-2xl">{formatPrice(total)}</span>
        </p>
        <div className="flex gap-4">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 text-sm font-medium"
          >
            Continue shopping
          </Link>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="inline-flex items-center justify-center rounded-lg bg-brand-black dark:bg-brand-white text-white dark:text-brand-black px-8 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {checkoutLoading ? "Redirecting to checkout…" : "Checkout with Stripe"}
          </button>
        </div>
      </div>

      {checkoutError && (
        <p className="mt-4 text-sm text-red-600 dark:text-red-400" role="alert">
          {checkoutError}
        </p>
      )}
    </div>
  );
}
