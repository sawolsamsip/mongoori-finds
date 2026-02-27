"use client";

import type { Product } from "@/lib/products";
import VehicleSelector from "@/components/VehicleSelector";
import FitBadge, { CompatibilityTable } from "@/components/FitBadge";

export default function ProductFitSection({ product }: { product: Product }) {
  return (
    <div className="space-y-6">
      <VehicleSelector variant="full" />
      <FitBadge product={product} variant="banner" />
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-slate dark:text-brand-silver mb-2">
          Compatibility by model & year
        </h2>
        <CompatibilityTable product={product} />
      </div>
    </div>
  );
}
