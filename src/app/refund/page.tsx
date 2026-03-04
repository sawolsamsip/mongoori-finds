import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund & Returns",
  description: "Mongoori Finds refund and returns policy. How to request a refund or return.",
};

export default function RefundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <header className="mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-black dark:text-brand-white">
          Refund & Returns
        </h1>
        <p className="mt-2 text-sm text-brand-slate dark:text-brand-silver">
          Last updated: March 2026
        </p>
      </header>

      <section className="space-y-10 text-brand-slate dark:text-brand-silver">
        <div>
          <h2 className="text-xl font-semibold text-brand-black dark:text-brand-white mb-3">
            Refunds
          </h2>
          <p>
            We want you to be satisfied with your purchase. If there is a problem with your order—wrong item, defective product, or an error on our part—please contact us at{" "}
            <a href="mailto:contact@mongoori.com" className="text-brand-black dark:text-brand-white underline hover:no-underline">
              contact@mongoori.com
            </a>
            {" "}with your order details. We will work with you to resolve the issue and, where appropriate, process a refund to your original payment method via Stripe. Refunds typically appear within 5–10 business days depending on your bank.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-brand-black dark:text-brand-white mb-3">
            Eligibility
          </h2>
          <p>
            Refunds are considered on a case-by-case basis. We may require photos or a short description of the issue. Items that have been used, opened, or damaged by the customer may not be eligible for a full refund. We reserve the right to refuse refunds in cases of abuse or fraud.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-brand-black dark:text-brand-white mb-3">
            Shipping
          </h2>
          <p>
            Free shipping applies to orders over $50 (use code SHIP50 at checkout when applicable). For returns, we may ask you to ship the item back at your expense unless the error was ours. We will confirm return instructions and any prepaid labels by email.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-brand-black dark:text-brand-white mb-3">
            Questions
          </h2>
          <p>
            For refund requests, returns, or shipping questions, email{" "}
            <a href="mailto:contact@mongoori.com" className="text-brand-black dark:text-brand-white underline hover:no-underline">
              contact@mongoori.com
            </a>
            . We are based in California, USA and aim to respond within 1–2 business days.
          </p>
        </div>
      </section>

      <div className="mt-16 pt-8 border-t border-brand-border dark:border-brand-slate/30">
        <Link
          href="/"
          className="text-sm text-brand-slate dark:text-brand-silver hover:text-brand-black dark:hover:text-brand-white transition-colors"
        >
          ← Back to store
        </Link>
      </div>
    </div>
  );
}
