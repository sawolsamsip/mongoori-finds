import { vehicleMatchesFitment } from "@/lib/fitments";
import type { Vehicle } from "@/types/vehicle";
import { TESLA_MODELS } from "@/types/vehicle";
import type { ProductFitment } from "@/types/vehicle";

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
  /** Optional detailed fitments; when absent, fit is derived from compatibility. */
  fitments?: ProductFitment[];
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
  {
    id: "5",
    slug: "tesla-all-weather-floor-mats",
    name: "Tesla All-Weather Floor Mats (Model 3/Y)",
    shortDescription: "Heavy-duty all-weather floor mats for Model 3 & Model Y. Waterproof, easy to clean.",
    description: "Protect your Tesla's floor from mud, water, and wear with these all-weather mats. Custom-fit for Model 3 and Model Y, these mats feature deep channels that trap dirt and liquids, keeping your interior clean. We use these in our rental fleet—they hold up to daily use and clean up in seconds.",
    price: 8999,
    compareAtPrice: 10999,
    image: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    compatibility: ["Tesla Model 3", "Tesla Model Y"],
    benefits: [
      "Custom-fit for Model 3 and Model Y",
      "Waterproof deep-channel design",
      "Easy to remove and rinse clean",
      "Fleet-tested for heavy daily use",
    ],
    installationNote: "Drop-in fit, no tools required. Front and rear set included.",
    category: "Accessories",
    featured: true,
  },
  {
    id: "6",
    slug: "tesla-center-console-organizer",
    name: "Tesla Center Console Organizer",
    shortDescription: "Keep your Model 3 & Model Y console tidy with this custom organizer tray.",
    description: "End the clutter in your center console. This organizer tray fits perfectly inside the Model 3 and Model Y console, adding compartments for your phone, cards, cables, and everyday items. Soft-lined to protect surfaces and reduce rattle. A small upgrade that makes a big daily difference.",
    price: 3499,
    image: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    compatibility: ["Tesla Model 3", "Tesla Model Y"],
    benefits: [
      "Custom-fit for Model 3 and Model Y console",
      "Multiple compartments for organization",
      "Soft lining to prevent scratches and rattle",
      "Easy to remove and clean",
    ],
    installationNote: "Drop-in installation. No modifications required.",
    category: "Accessories",
    featured: true,
  },
  {
    id: "7",
    slug: "tesla-screen-protector",
    name: "Tesla 15.4\" Screen Protector (Tempered Glass)",
    shortDescription: "Tempered glass screen protector for the Model Y/3 15.4\" touchscreen.",
    description: "Protect your Tesla's centerpiece—the 15.4\" touchscreen—from fingerprints, scratches, and glare. This tempered glass protector offers 9H hardness with anti-glare coating while maintaining full touch sensitivity. Precise cutouts ensure full compatibility with all on-screen controls.",
    price: 2499,
    image: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    compatibility: ["Tesla Model 3", "Tesla Model Y"],
    benefits: [
      "9H hardness tempered glass",
      "Anti-glare coating reduces reflections",
      "Maintains full touchscreen sensitivity",
      "Bubble-free installation kit included",
    ],
    installationNote: "Clean screen thoroughly before applying. Alignment frame included for perfect positioning.",
    category: "Accessories",
    featured: false,
  },
  {
    id: "8",
    slug: "tesla-sentry-mode-usb-hub",
    name: "Tesla Sentry Mode USB Hub",
    shortDescription: "Dedicated USB hub for Sentry Mode & Dashcam. Always-on, plug-and-play.",
    description: "Stop burning out flash drives with this purpose-built Sentry Mode USB hub. Designed to handle Tesla's continuous write cycles, it plugs into the center console USB-A port and provides reliable storage for Sentry Mode footage and dashcam recordings. Compatible with Model 3 and Model Y.",
    price: 4499,
    compareAtPrice: 5499,
    image: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    compatibility: ["Tesla Model 3", "Tesla Model Y"],
    benefits: [
      "Designed for continuous Sentry Mode writes",
      "Plug-and-play, no formatting needed",
      "Compact low-profile design",
      "Protects against data loss during recording",
    ],
    installationNote: "Plug into center console USB-A port. Format as FAT32 or exFAT if prompted.",
    category: "Accessories",
    featured: false,
  },
  {
    id: "9",
    slug: "tesla-tire-sealant-inflator-kit",
    name: "Tesla Tire Sealant & Inflator Kit",
    shortDescription: "Emergency tire repair kit for Teslas with no spare. Get back on the road fast.",
    description: "Tesla vehicles have no spare tire—this kit is your roadside safety net. The sealant and electric inflator can seal and re-inflate most punctures in minutes, getting you back on the road without waiting for a tow. Compact enough to store in the Model 3/Y front trunk.",
    price: 3999,
    image: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    compatibility: ["Tesla Model 3", "Tesla Model Y", "All Tesla models"],
    benefits: [
      "Seals most punctures in minutes",
      "Electric inflator included—no manual pumping",
      "Fits in the front trunk or under-seat storage",
      "Essential safety item for no-spare Tesla owners",
    ],
    installationNote: "For temporary repair only. Drive to a tire shop after use. See kit instructions for max speed and distance.",
    category: "Maintenance",
    featured: false,
  },
  {
    id: "10",
    slug: "tesla-trunk-cargo-organizer",
    name: "Tesla Trunk Cargo Organizer",
    shortDescription: "Collapsible cargo organizer for the Model Y & Model 3 trunk. Keep gear in place.",
    description: "Stop cargo from sliding around your Tesla's trunk. This collapsible organizer divides your trunk into sections, keeping groceries, gear, and luggage secure during cornering and braking. Folds flat when not in use. Works with the Model Y's split-fold rear seats too.",
    price: 4999,
    image: "/images/placeholder.svg",
    images: ["/images/placeholder.svg"],
    compatibility: ["Tesla Model 3", "Tesla Model Y"],
    benefits: [
      "Collapsible—folds flat when not needed",
      "Non-slip base keeps organizer in place",
      "Multiple compartments for flexible loading",
      "Works with split-fold rear seat configuration",
    ],
    installationNote: "No installation needed. Place in trunk and adjust dividers as needed.",
    category: "Accessories",
    featured: false,
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

/** Returns true if the product fits the given vehicle (uses fitments when present, else compatibility). */
export function productFitsVehicle(product: Product, vehicle: Vehicle): boolean {
  if (product.fitments?.length) {
    return product.fitments.some((f) => vehicleMatchesFitment(vehicle, f));
  }
  const modelLabel = TESLA_MODELS.find((m) => m.value === vehicle.model)?.label;
  if (!modelLabel) return false;
  return product.compatibility.some((c) => c.includes(modelLabel));
}
