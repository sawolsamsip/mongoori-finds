import Link from "next/link";

export default function RidesCrossellBanner() {
  return (
    <section
      aria-labelledby="rides-crossell-heading"
      className="relative overflow-hidden bg-[#000000] py-16 sm:py-20 lg:py-24"
    >
      {/* Subtle red gradient accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, #e81922 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* Icon */}
          <div className="shrink-0 flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#e81922]/10 border border-[#e81922]/20">
            <svg
              aria-hidden
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-10 h-10 sm:w-12 sm:h-12 text-[#e81922]"
            >
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5z" />
              <circle cx="7.5" cy="14.5" r="1.5" />
              <circle cx="16.5" cy="14.5" r="1.5" />
            </svg>
          </div>

          {/* Copy */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-xs sm:text-sm font-semibold text-[#e81922] tracking-[0.2em] uppercase mb-3">
              Mongoori Rides
            </p>
            <h2
              id="rides-crossell-heading"
              className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4"
            >
              Own the accessories.
              <br className="hidden sm:block" /> Rent the car.
            </h2>
            <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Already kitted out your Tesla? Experience one on your next trip — no commitment, no
              insurance headaches. Tesla Model 3 &amp; Model Y rentals, delivered by the same team
              behind Mongoori Finds.
            </p>
          </div>

          {/* CTA */}
          <div className="shrink-0 flex flex-col items-center gap-3">
            <Link
              href="https://rides.mongoori.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-[#e81922] hover:bg-[#c8141e] active:bg-[#b01219] text-white px-8 py-4 text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e81922]"
            >
              Book a Tesla
            </Link>
            <span className="text-white/30 text-xs">rides.mongoori.com</span>
          </div>
        </div>
      </div>
    </section>
  );
}
