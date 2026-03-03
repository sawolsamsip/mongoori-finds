# Mongoori Finds

Modern ecommerce site for **Mongoori Finds** — Tesla-focused accessories and maintenance products, operated by a Tesla rental company in California.

## Tech stack

- **Next.js 14** (App Router)
- **Tailwind CSS** (mobile-first, responsive)
- **TypeScript**
- Stripe-ready cart and checkout structure (no API keys in repo)

## Getting started

```bash
cd mongoori-finds
npm install
npm run dev
```

Open [http://localhost:4173](http://localhost:4173).

## Project structure

```
mongoori-finds/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── layout.tsx          # Root layout, SEO, CartProvider
│   │   ├── page.tsx            # Homepage
│   │   ├── products/           # Product listing & detail
│   │   ├── products/[slug]/    # Dynamic product page
│   │   ├── bundle/             # Maintenance bundle
│   │   ├── about/              # About page
│   │   └── cart/               # Cart page
│   ├── components/             # Reusable UI
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── PromoBanner.tsx     # Promo/discount banner
│   │   ├── TrustBadge.tsx
│   │   └── ReviewPlaceholder.tsx
│   ├── context/
│   │   └── CartContext.tsx     # Cart state, Stripe-ready shape
│   ├── lib/
│   │   └── products.ts        # Product data, helpers
│   └── types/
│       └── cart.ts            # Cart & checkout types
├── public/
├── tailwind.config.ts
└── next.config.mjs
```

## Pages

| Route       | Description                          |
|------------|--------------------------------------|
| `/`        | Home — hero, featured products, trust |
| `/products`| Product grid with quick add to cart   |
| `/products/[slug]` | Product detail, gallery, compatibility, reviews placeholder |
| `/bundle`  | Maintenance bundle with savings      |
| `/about`   | Story, fleet testing, quality focus  |
| `/cart`    | Cart summary, checkout (Stripe-ready)|

## Adding products

Edit `src/lib/products.ts`: add entries to the `products` array. Each product needs `id`, `slug`, `name`, `shortDescription`, `description`, `price` (cents), `image`, `images`, `compatibility`, `benefits`, `category`, and optional `compareAtPrice`, `installationNote`, `featured`.

## Stripe checkout

Cart context and types are set up for Stripe. To go live:

1. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (use `.env.local`).
2. Create an API route (e.g. `app/api/checkout/route.ts`) that creates a Stripe Checkout Session from cart items.
3. Wire the cart page “Checkout” button to redirect to that session or your payment page.

## Promo banner

Configure the top promo in `src/app/layout.tsx` via `<PromoBanner />` (title, description, code, ctaHref). Toggle or remove for no banner.

## Design

- Clean, minimal, premium tech (Tesla/Apple feel)
- Generous whitespace, subtle animations
- Semantic HTML, structured headings, SEO-friendly metadata
- Mobile-first responsive layout

## License

Private — Mongoori Finds.
