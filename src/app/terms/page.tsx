import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of Use for Mongoori Finds. By using our store you agree to these terms.",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <header className="mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-black dark:text-brand-white">
          Terms of Use
        </h1>
        <p className="mt-2 text-sm text-brand-slate dark:text-brand-silver">
          Last updated: March 2026
        </p>
      </header>

      <section className="space-y-10 text-brand-slate dark:text-brand-silver">
        <div>
          <h2 className="text-xl font-semibold text-brand-black dark:text-brand-white mb-3">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing and using Mongoori Finds, you agree to be bound by these Terms of Use and all applicable laws and regulations in the State of California and the United States.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-brand-black dark:text-brand-white mb-3">
            2. Products & Orders
          </h2>
          <p>
            We sell Tesla maintenance and accessory products. Product availability and pricing are subject to change. By placing an order you agree to pay the total shown at checkout, including any applicable taxes and shipping. We reserve the right to refuse or cancel orders in case of errors, fraud, or stock issues.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-brand-black dark:text-brand-white mb-3">
            3. Payment
          </h2>
          <p>
            All payments are processed securely through Stripe. We do not store your full card details. By completing a purchase you authorize us to charge the payment method you provide for the order total.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-brand-black dark:text-brand-white mb-3">
            4. Shipping & Delivery
          </h2>
          <p>
            We ship within the United States. Delivery times are estimates and not guaranteed. You are responsible for providing an accurate shipping address. Risk of loss passes to you upon delivery to the carrier. See our Refund & Returns page for return and refund eligibility.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-brand-black dark:text-brand-white mb-3">
            5. Contact
          </h2>
          <p>
            For questions about these terms, orders, or our products, contact us at{" "}
            <a href="mailto:contact@mongoori.com" className="text-brand-black dark:text-brand-white underline hover:no-underline">
              contact@mongoori.com
            </a>
            . We are based in California, USA.
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
