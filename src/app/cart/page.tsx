"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductImage from "@/components/ProductImage";
import { useCart } from "@/context/CartContext";
import { useHost } from "@/context/HostContext";
import { formatPrice } from "@/lib/products";

const FREE_SHIPPING_THRESHOLD = 5000; // $50.00 in cents for non-hosts

function HostBenefitPanel() {
  const { hostStatus, verifying, verifyHost, clearHost } = useHost();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "error" | "info" } | null>(null);

  if (hostStatus?.isHost) {
    return (
      <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            mongoori Host — Free shipping on all orders
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
            {hostStatus.email} · 1.5× points on this order
          </p>
        </div>
        <button
          type="button"
          onClick={clearHost}
          className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline whitespace-nowrap"
        >
          Remove
        </button>
      </div>
    );
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setMessage(null);
    const result = await verifyHost(email);
    if (!result.isHost) {
      setMessage({ text: result.message || "Not a registered host.", type: "error" });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-brand-white/50 dark:bg-white/5 px-4 py-4">
      <p className="text-sm font-medium text-brand-black dark:text-brand-white mb-1">
        mongoori Host? Unlock free shipping
      </p>
      <p className="text-xs text-brand-silver mb-3">
        Enter your mongoori Rides email for free shipping on all orders + 1.5× points.
      </p>
      <form onSubmit={handleVerify} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black/20 dark:focus:ring-brand-white/20"
        />
        <button
          type="submit"
          disabled={verifying || !email.trim()}
          className="rounded-lg bg-brand-black dark:bg-brand-white text-white dark:text-brand-black px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
        >
          {verifying ? "Checking…" : "Apply"}
        </button>
      </form>
      {message && (
        <p className={`mt-2 text-xs ${message.type === "error" ? "text-red-500" : "text-brand-silver"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}

function PointsPanel({
  customerEmail,
  pointsToRedeem,
  onPointsChange,
}: {
  customerEmail: string | null;
  pointsToRedeem: number;
  onPointsChange: (pts: number) => void;
}) {
  const [balance, setBalance] = useState<number | null>(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!customerEmail) return;
    fetch(`/api/points?email=${encodeURIComponent(customerEmail)}`)
      .then((r) => r.json())
      .then((d) => setBalance(d.balance ?? 0))
      .catch(() => {});
  }, [customerEmail]);

  if (!customerEmail || balance === null || balance === 0) return null;

  const maxRedeemable = Math.floor(balance / 100) * 100;
  const discountDollars = pointsToRedeem / 100;

  const handleApply = () => {
    const pts = parseInt(input, 10);
    if (isNaN(pts) || pts <= 0 || pts % 100 !== 0) return;
    onPointsChange(Math.min(pts, maxRedeemable));
    setInput("");
  };

  return (
    <div className="rounded-lg border border-border bg-brand-white/50 dark:bg-white/5 px-4 py-4">
      <p className="text-sm font-medium text-brand-black dark:text-brand-white mb-1">
        mongoori Points — {balance} pts available
      </p>
      <p className="text-xs text-brand-silver mb-3">
        100 points = $1 discount. Max redeemable: {maxRedeemable} pts (${maxRedeemable / 100})
      </p>
      {pointsToRedeem > 0 ? (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            Using {pointsToRedeem} pts → −${discountDollars.toFixed(2)}
          </span>
          <button
            type="button"
            onClick={() => onPointsChange(0)}
            className="text-xs text-brand-silver hover:text-red-500"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="number"
            value={input}
            min={100}
            step={100}
            max={maxRedeemable}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. 200"
            className="w-28 rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-black/20 dark:focus:ring-brand-white/20"
          />
          <button
            type="button"
            onClick={handleApply}
            disabled={!input}
            className="rounded-lg bg-brand-black dark:bg-brand-white text-white dark:text-brand-black px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const { hostStatus } = useHost();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const pointsDiscountCents = pointsToRedeem; // 1 pt = 1 cent (100 pts = $1)
  const total = Math.max(0, subtotal - pointsDiscountCents);
  const freeShipping = hostStatus?.isHost || subtotal >= FREE_SHIPPING_THRESHOLD;
  const customerEmail = hostStatus?.isHost ? hostStatus.email : null;

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
          ...(hostStatus?.isHost ? { hostEmail: hostStatus.email } : {}),
          ...(customerEmail ? { customerEmail } : {}),
          ...(pointsToRedeem > 0 ? { pointsToRedeem } : {}),
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

      {/* Host benefit panel */}
      <div className="mt-8">
        <HostBenefitPanel />
      </div>

      {/* Points redemption */}
      <div className="mt-3">
        <PointsPanel
          customerEmail={customerEmail}
          pointsToRedeem={pointsToRedeem}
          onPointsChange={setPointsToRedeem}
        />
      </div>

      {/* Order summary */}
      <div className="mt-6 pt-6 border-t border-border space-y-2 text-sm">
        <div className="flex justify-between text-brand-slate dark:text-brand-silver">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {pointsDiscountCents > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Points discount ({pointsToRedeem} pts)</span>
            <span>−{formatPrice(pointsDiscountCents)}</span>
          </div>
        )}
        <div className="flex justify-between text-brand-slate dark:text-brand-silver">
          <span>Shipping</span>
          <span>
            {freeShipping ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                {hostStatus?.isHost ? "Free (Host)" : "Free"}
              </span>
            ) : (
              "Calculated at checkout"
            )}
          </span>
        </div>
        <div className="flex justify-between text-xs text-brand-silver pt-1">
          <span>Points earned on this order</span>
          <span>
            +{Math.floor((subtotal / 100) * (hostStatus?.isHost ? 1.5 : 1))} pts
            {hostStatus?.isHost && " (1.5×)"}
          </span>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
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
