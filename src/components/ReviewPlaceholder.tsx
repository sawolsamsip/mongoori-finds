type ReviewPlaceholderProps = {
  title?: string;
  className?: string;
};

/**
 * Placeholder for future review/ratings component.
 * Replace with real reviews (e.g. from API or CMS) when ready.
 */
export default function ReviewPlaceholder({
  title = "Customer reviews",
  className = "",
}: ReviewPlaceholderProps) {
  return (
    <section
      className={`border border-border rounded-xl p-6 bg-brand-white/50 dark:bg-brand-slate/10 ${className}`}
      aria-label={title}
    >
      <h3 className="text-sm font-semibold text-brand-slate dark:text-brand-silver mb-3">
        {title}
      </h3>
      <p className="text-sm text-brand-silver">
        Reviews will appear here. Integrate your preferred review provider (e.g. Judge.me, Yotpo) or custom API.
      </p>
      <div className="mt-4 flex gap-1" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="w-4 h-4 rounded-full border border-border bg-brand-white dark:bg-brand-charcoal"
          />
        ))}
      </div>
    </section>
  );
}
