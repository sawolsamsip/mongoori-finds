import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "Mongoori Finds is run by a Tesla rental fleet in California. Real-world testing, reliability, and quality for Model 3 and Model Y owners.",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <header className="mb-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-black dark:text-brand-white">
          About Mongoori Finds
        </h1>
        <p className="mt-4 text-lg text-brand-slate dark:text-brand-silver">
          Tesla maintenance essentials from a team that runs a rental fleet—so every product is real-world tested.
        </p>
      </header>

      <section className="space-y-10 text-brand-slate dark:text-brand-silver">
        <div>
          <h2 className="text-xl font-semibold text-brand-black dark:text-brand-white mb-3">
            Our story
          </h2>
          <p>
            Mongoori Finds is operated by a Tesla rental company based in California. We maintain a fleet of Model 3 and Model Y vehicles for daily rentals. That means we’re constantly replacing cabin filters, wipers, key cards, and cleaning interiors. We got tired of guessing which parts were worth buying—so we started selling the ones we actually use and trust.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-brand-black dark:text-brand-white mb-3">
            Real-world testing
          </h2>
          <p>
            Every product we offer is used in our rental fleet. If it doesn’t hold up to heavy use, doesn’t fit right, or doesn’t perform as expected, we don’t sell it. That’s our filter: real cars, real miles, real California weather. You get the same parts we rely on to keep our cars safe and comfortable for every customer.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-brand-black dark:text-brand-white mb-3">
            Reliability & quality
          </h2>
          <p>
            We’re not trying to be the biggest catalog. We focus on essential maintenance items—the stuff Model 3 and Model Y owners actually need. Quality and reliability come first. We’d rather carry fewer products that we’re confident in than a long list of things we wouldn’t put on our own cars.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-brand-black dark:text-brand-white mb-3">
            For Tesla owners in the US
          </h2>
          <p>
            We’re built for Tesla Model 3 and Model Y owners in the United States. Our inventory is chosen for fit, performance, and ease of installation. If you have questions about compatibility or installation, we’re here to help—we’re Tesla people, and we want you to get the right part the first time.
          </p>
        </div>
      </section>
    </div>
  );
}
