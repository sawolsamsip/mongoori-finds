"use client";

import type { Product } from "@/lib/products";
import { productFitsVehicle } from "@/lib/products";
import { useVehicle } from "@/context/VehicleContext";
import { TESLA_MODELS } from "@/types/vehicle";

type Props = {
  product: Product;
  /** "inline" for card; "banner" for detail page */
  variant?: "inline" | "banner";
};

export default function FitBadge({ product, variant = "inline" }: Props) {
  const { vehicle } = useVehicle();

  if (!vehicle) {
    if (variant === "banner") {
      return (
        <p className="text-sm text-brand-silver">
          Select your vehicle above to see if this part fits your car.
        </p>
      );
    }
    return (
      <span className="text-xs text-brand-silver">Select vehicle to check fit</span>
    );
  }

  const fits = productFitsVehicle(product, vehicle);
  const modelLabel = TESLA_MODELS.find((m) => m.value === vehicle.model)?.label;

  if (variant === "banner") {
    return (
      <div
        className={`rounded-xl border p-4 ${
          fits
            ? "border-green-500/50 bg-green-500/10 text-green-800 dark:text-green-200"
            : "border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-200"
        }`}
        role="status"
      >
        {fits ? (
          <p className="font-medium">✓ Fits your {modelLabel} {vehicle.year}</p>
        ) : (
          <p className="font-medium">This part does not fit your {modelLabel} {vehicle.year}. See compatibility below.</p>
        )}
      </div>
    );
  }

  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${
        fits ? "bg-green-500/20 text-green-700 dark:text-green-300" : "bg-brand-slate/20 text-brand-silver"
      }`}
      role="status"
    >
      {fits ? `Fits your ${modelLabel} ${vehicle.year}` : "Does not fit"}
    </span>
  );
}

export function CompatibilityTable({ product }: { product: Product }) {
  const fitments = product.fitments ?? [];
  if (!fitments.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="py-2 pr-4 font-semibold text-brand-black dark:text-brand-white">Model</th>
            <th className="py-2 pr-4 font-semibold text-brand-black dark:text-brand-white">Years</th>
            {fitments.some((f) => f.note) && (
              <th className="py-2 font-semibold text-brand-black dark:text-brand-white">Note</th>
            )}
          </tr>
        </thead>
        <tbody>
          {fitments.map((f, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className="py-2 pr-4">{TESLA_MODELS.find((m) => m.value === f.model)?.label ?? f.model}</td>
              <td className="py-2 pr-4">
                {f.yearFrom}
                {f.yearTo != null ? ` – ${f.yearTo}` : "+"}
                {f.productionFrom && ` (from ${f.productionFrom})`}
                {f.productionBefore && ` (before ${f.productionBefore})`}
              </td>
              {fitments.some((x) => x.note) && <td className="py-2">{f.note ?? "—"}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
