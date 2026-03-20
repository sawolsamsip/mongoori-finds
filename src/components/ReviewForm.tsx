"use client";

import { useState } from "react";

type ReviewFormProps = {
  productId: string;
  productSlug: string;
};

export default function ReviewForm({ productId, productSlug }: ReviewFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await fetch("/api/reviews/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        productSlug,
        customerName: name,
        customerEmail: email,
        rating,
        title,
        body,
        checkoutSessionId: sessionId,
      }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to submit review. Please try again.");
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <div className="mt-8 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-6">
        <p className="font-semibold text-green-800 dark:text-green-300">Thank you for your review!</p>
        <p className="mt-1 text-sm text-green-700 dark:text-green-400">
          Your review has been submitted and will appear here after approval.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="mt-8">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          Write a review
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-xl border border-border bg-brand-white/50 dark:bg-brand-slate/10 p-6">
      <h4 className="font-semibold text-brand-black dark:text-brand-white mb-4">Write a review</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star rating */}
        <div>
          <label className="block text-sm font-medium text-brand-black dark:text-brand-white mb-1">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-1" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star} star${star > 1 ? "s" : ""}`}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
                className="text-2xl leading-none transition-colors focus:outline-none"
              >
                <span
                  className={
                    star <= (hovered || rating)
                      ? "text-yellow-400"
                      : "text-brand-slate/30 dark:text-brand-silver/30"
                  }
                >
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-brand-black dark:text-brand-white mb-1">
              Your name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane D."
              className="w-full rounded-lg border border-border bg-white dark:bg-brand-slate/10 px-3 py-2 text-sm text-brand-black dark:text-brand-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-brand-black dark:text-brand-white mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full rounded-lg border border-border bg-white dark:bg-brand-slate/10 px-3 py-2 text-sm text-brand-black dark:text-brand-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-black dark:text-brand-white mb-1">
            Review title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Great product!"
            maxLength={120}
            className="w-full rounded-lg border border-border bg-white dark:bg-brand-slate/10 px-3 py-2 text-sm text-brand-black dark:text-brand-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-black dark:text-brand-white mb-1">
            Review <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share your experience with this product…"
            rows={4}
            maxLength={2000}
            className="w-full rounded-lg border border-border bg-white dark:bg-brand-slate/10 px-3 py-2 text-sm text-brand-black dark:text-brand-white resize-none"
          />
          <p className="mt-1 text-xs text-brand-silver">{body.length}/2000</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-black dark:text-brand-white mb-1">
            Order confirmation ID{" "}
            <span className="text-brand-silver text-xs font-normal">(optional — verifies your purchase)</span>
          </label>
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="cs_live_…"
            className="w-full rounded-lg border border-border bg-white dark:bg-brand-slate/10 px-3 py-2 text-sm font-mono text-brand-black dark:text-brand-white"
          />
          <p className="mt-1 text-xs text-brand-silver">
            Found in your order confirmation email — used to verify your purchase.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-black dark:bg-brand-white text-white dark:text-brand-black px-5 py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Submitting…" : "Submit review"}
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
