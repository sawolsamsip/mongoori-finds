import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Mongoori Finds. How we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <header className="mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-black dark:text-brand-white">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-brand-slate dark:text-brand-silver">
          Last updated: March 2026
        </p>
      </header>

      <section className="space-y-10 text-brand-slate dark:text-brand-silver">
        <div>
          <h2 className="text-xl font-semibold text-brand-black dark:text-brand-white mb-3">
            1. Information We Collect
          </h2>
          <p>
            When you shop at Mongoori Finds we collect information needed to process your order: name, email, shipping address, and payment information. Payment details are handled by Stripe; we do not store your full card number on our servers. We may also collect usage data (e.g. pages visited) to improve the site.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-brand-black dark:text-brand-white mb-3">
            2. Payment & Security
          </h2>
          <p>
            All payments are processed securely through Stripe. Mongoori Finds does not store your full credit card information. Stripe’s use of your data is governed by their Privacy Policy (stripe.com). We rely on their PCI-compliant infrastructure to keep your payment data safe.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-brand-black dark:text-brand-white mb-3">
            3. How We Use Your Data
          </h2>
          <p>
            We use your information to fulfill orders, send order confirmations, update you on shipping, and respond to support requests. We do not sell or rent your personal information to third parties for marketing.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-brand-black dark:text-brand-white mb-3">
            4. Data Sharing
          </h2>
          <p>
            We share data only as needed to run the store: with Stripe for payment processing and with shipping carriers for delivery. We do not sell, rent, or trade your personal information.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-brand-black dark:text-brand-white mb-3">
            5. Your Rights (CCPA)
          </h2>
          <p>
            Under the California Consumer Privacy Act (CCPA), you have the right to request access to your data, request deletion, and opt out of the sale of your data (we do not sell personal information). To exercise these rights or ask questions, contact us at{" "}
            <a href="mailto:contact@mongoori.com" className="text-brand-black dark:text-brand-white underline hover:no-underline">
              contact@mongoori.com
            </a>
            .
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
