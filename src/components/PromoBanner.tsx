"use client";

import Link from "next/link";

type PromoBannerProps = {
  title?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  code?: string;
  dismissible?: boolean;
};

export default function PromoBanner({
  title = "Limited time offer",
  description = "Save on maintenance essentials. Use code at checkout.",
  ctaText = "Shop now",
  ctaHref = "/products",
  code,
  dismissible = true,
}: PromoBannerProps) {
  return (
    <aside
      role="banner"
      aria-label="Promotion"
      className="bg-brand-charcoal text-brand-white py-2.5 px-4 text-center text-sm animate-fade-in"
    >
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-2">
        <span className="font-medium">{title}</span>
        {description && <span className="text-brand-silver">{description}</span>}
        {code && (
          <code className="bg-brand-slate px-2 py-0.5 rounded font-mono text-accent-light">
            {code}
          </code>
        )}
        {ctaHref && (
          <Link
            href={ctaHref}
            className="underline underline-offset-2 hover:text-accent-light transition-colors"
          >
            {ctaText}
          </Link>
        )}
      </div>
    </aside>
  );
}
