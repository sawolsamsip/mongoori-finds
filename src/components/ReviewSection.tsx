import { getReviewsForProduct } from "@/lib/reviews";
import ReviewForm from "@/components/ReviewForm";

type ReviewSectionProps = {
  productId: string;
  productSlug: string;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={s <= rating ? "text-yellow-400" : "text-brand-slate/20 dark:text-brand-silver/20"}
          aria-hidden
        >
          ★
        </span>
      ))}
    </span>
  );
}

function AverageRating({ reviews }: { reviews: { rating: number }[] }) {
  if (reviews.length === 0) return null;
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return (
    <div className="flex items-center gap-2 mb-6">
      <StarRating rating={Math.round(avg)} />
      <span className="text-sm font-medium text-brand-black dark:text-brand-white">
        {avg.toFixed(1)}
      </span>
      <span className="text-sm text-brand-silver">
        ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
      </span>
    </div>
  );
}

export default async function ReviewSection({ productId, productSlug }: ReviewSectionProps) {
  const reviews = await getReviewsForProduct(productId);

  return (
    <section aria-label="Customer reviews">
      <h3 className="text-xl font-bold text-brand-black dark:text-brand-white mb-4">
        Customer reviews
      </h3>

      <AverageRating reviews={reviews} />

      {reviews.length === 0 ? (
        <p className="text-sm text-brand-silver">
          No reviews yet — be the first to leave one!
        </p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={String(review._id)}
              className="border-b border-border last:border-0 pb-6 last:pb-0"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                <div>
                  <div className="flex items-center gap-2">
                    <StarRating rating={review.rating} />
                    {review.verified && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✓ Verified purchase
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-semibold text-brand-black dark:text-brand-white text-sm">
                    {review.title}
                  </p>
                </div>
                <p className="text-xs text-brand-silver whitespace-nowrap">
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <p className="text-sm text-brand-slate dark:text-brand-silver mt-2 leading-relaxed">
                {review.body}
              </p>
              <p className="text-xs text-brand-silver mt-2">{review.customerName}</p>
            </div>
          ))}
        </div>
      )}

      <ReviewForm productId={productId} productSlug={productSlug} />
    </section>
  );
}
