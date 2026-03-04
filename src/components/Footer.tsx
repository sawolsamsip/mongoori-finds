import Link from "next/link";
import pkg from "../../package.json";

const shopLinks = [
  { href: "/products", label: "Products" },
  { href: "/bundle", label: "Maintenance Bundle" },
  { href: "/about", label: "About" },
];

const legalLinks = [
  { href: "/terms", label: "Terms of Use" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund", label: "Refund & Returns" },
];

export default function Footer() {
  return (
    <footer className="bg-brand-charcoal text-brand-white mt-24" role="contentinfo">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-3">Mongoori Finds</h2>
            <p className="text-brand-silver text-sm">
              Tesla maintenance essentials, tested by a real rental fleet in California.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-silver mb-3">
              Shop
            </h3>
            <ul className="space-y-2">
              {shopLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm hover:text-accent-light transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-silver mb-3">
              Legal
            </h3>
            <ul className="space-y-2">
              {legalLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm hover:text-accent-light transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-silver mb-3">
              Contact
            </h3>
            <p className="text-sm text-brand-silver">
              California, USA
              <br />
              <a
                href="mailto:contact@mongoori.com"
                className="hover:text-accent-light transition-colors"
              >
                contact@mongoori.com
              </a>
            </p>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-brand-slate text-center text-sm text-brand-silver">
          <p>
            &copy; {new Date().getFullYear()} Mongoori Finds v{pkg.version}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
