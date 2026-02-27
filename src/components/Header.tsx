"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const nav = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/bundle", label: "Bundle" },
];

export default function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#0a0a0a] border-b border-black/[0.08] dark:border-white/[0.08]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-[1.1rem] sm:text-[1.25rem] font-semibold tracking-tight text-black dark:text-white"
            aria-label="Mongoori Finds home"
          >
            Mongoori Finds
          </Link>

          {/* Desktop nav - center */}
          <nav aria-label="Main navigation" className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`text-[13px] sm:text-sm tracking-wide transition-colors ${
                  pathname === href
                    ? "text-black dark:text-white font-medium"
                    : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right: cart + mobile menu button */}
          <div className="flex items-center gap-1">
            <Link
              href="/cart"
              className="relative p-2 -m-2 text-black dark:text-white hover:opacity-70 transition-opacity"
              aria-label={`Cart, ${count} items`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[1rem] px-1 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-medium">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 -m-2 text-black dark:text-white hover:opacity-70 transition-opacity"
              aria-expanded={mobileOpen}
              aria-label="Menu"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 top-14 sm:top-16 bg-white dark:bg-[#0a0a0a] z-40 border-t border-black/[0.08] dark:border-white/[0.08]"
          aria-hidden={!mobileOpen}
        >
          <nav className="px-6 py-6 flex flex-col gap-1">
            {nav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`py-3 text-base font-medium ${
                  pathname === href ? "text-black dark:text-white" : "text-black/60 dark:text-white/60"
                }`}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/about"
              onClick={() => setMobileOpen(false)}
              className="py-3 text-base text-black/60 dark:text-white/60"
            >
              About
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
