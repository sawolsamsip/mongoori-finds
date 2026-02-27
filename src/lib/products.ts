export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images: string[];
  compatibility: string[];
  benefits: string[];
  installationNote?: string;
  category: string;
  featured?: boolean;
};

export const products: Product[] = [
  {
    id: "1",
    slug: "tesla-cabin-air-filter",
    name: "Tesla Cabin Air Filter",
    shortDescription: "Premium HEPA cabin filter for Model 3 & Model Y. Easy install, better air quality.",
    description: "Keep your cabin air clean with our premium HEPA cabin air filter. Designed for Tesla Model 3 and Model Y, this filter captures pollen, dust, and fine particles. We run these in our rental fleet—they hold up to heavy use and are simple to replace.",
    price: 3499,
    compareAtPrice: 4299,
    image: "/images/airfilter.avif",
    images: ["/images/airfilter.avif", "/images/airfilter2.avif"],
    compatibility: ["Tesla Model 3", "Tesla Model Y"],
    benefits: [
      "HEPA-grade filtration for pollen and dust",
      "Easy 10-minute replacement",
      "Fleet-tested for durability",
      "OEM-compatible fit",
    ],
    installationNote: "No tools required. Access from glove box; swap in under 10 minutes.",
    category: "Maintenance",
    featured: true,
  },
  {
    id: "2",
    slug: "tesla-wiper-blade-set",
    name: "Tesla Wiper Blade Set",
    shortDescription: "OEM-style wiper set for Model 3 & Model Y. Quiet, streak-free.",
    description: "Replace worn wipers with our fleet-tested blade set. Matches OEM performance for Model 3 and Model Y—quiet, streak-free, and built to last through rain and washer fluid. Our rental cars use these; we only sell what we trust.",
    price: 2999,
    image: "/images/blade.avif",
    images: ["/images/blade.avif", "/images/blade2.avif", "/images/blade3.avif"],
    compatibility: ["Tesla Model 3", "Tesla Model Y"],
    benefits: [
      "OEM-style fit and performance",
      "Quiet operation",
      "Streak-free clarity",
      "Fleet-tested in all conditions",
    ],
    installationNote: "Simple clip-on design. Front pair only; install in minutes.",
    category: "Maintenance",
    featured: true,
  },
  {
    id: "3",
    slug: "tesla-key-card-replacement",
    name: "Tesla Key Card Replacement",
    shortDescription: "Backup key card for Model 3 & Model Y. Program with the app.",
    description: "A spare key card for peace of mind. Compatible with Tesla Model 3 and Model Y. Program it in the Tesla app and keep one in your wallet—no more worrying about phone battery or app issues. We keep these on hand for every rental.",
    price: 1999,
    image: "/images/key.avif",
    images: ["/images/key.avif", "/images/key2.avif", "/images/key3.avif"],
    compatibility: ["Tesla Model 3", "Tesla Model Y"],
    benefits: [
      "Official Tesla key card compatibility",
      "Program via Tesla app",
      "Slim, wallet-friendly",
      "Reliable backup access",
    ],
    installationNote: "Add and remove in Tesla app under Keys. No service visit needed.",
    category: "Accessories",
    featured: false,
  },
  {
    id: "4",
    slug: "tesla-interior-cleaning-kit",
    name: "Tesla Interior Cleaning Kit",
    shortDescription: "Everything you need to keep your Tesla interior like new.",
    description: "A curated kit for Tesla interiors: dash, seats, screens, and trim. Safe for vegan leather and touchscreens. We use these products in our rental fleet to keep every car looking and smelling fresh—now you can do the same at home.",
    price: 4499,
    compareAtPrice: 5499,
    image: "/images/cleaning.avif",
    images: ["/images/cleaning.avif", "/images/cleaning2.avif", "/images/cleaning3.avif"],
    compatibility: ["Tesla Model 3", "Tesla Model Y", "All Tesla interiors"],
    benefits: [
      "Screen-safe and vegan-leather safe",
      "No harsh chemicals",
      "Fleet-approved results",
      "Everything in one kit",
    ],
    installationNote: "Use as directed. Microfiber cloths and sprays included.",
    category: "Care",
    featured: true,
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}
