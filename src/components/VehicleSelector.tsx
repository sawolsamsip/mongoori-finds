"use client";

import { useState } from "react";
import { useVehicle } from "@/context/VehicleContext";
import { TESLA_MODELS, MODEL_YEARS } from "@/types/vehicle";
import type { TeslaModel } from "@/types/vehicle";

type Props = {
  /** Compact = single row; full = with labels and VIN */
  variant?: "compact" | "full";
  className?: string;
};

export default function VehicleSelector({ variant = "full", className = "" }: Props) {
  const { vehicle, setVehicle, setVehicleFromVIN, clearVehicle } = useVehicle();
  const [vin, setVin] = useState("");
  const [vinMessage, setVinMessage] = useState<string | null>(null);

  const handleVIN = () => {
    setVinMessage(null);
    const r = setVehicleFromVIN(vin);
    if (r.success && r.message) setVinMessage(r.message);
    if (!r.success && r.message) setVinMessage(r.message);
  };

  const handleModel = (model: TeslaModel) => {
    if (!vehicle) setVehicle({ model, year: new Date().getFullYear() });
    else setVehicle({ ...vehicle, model });
  };

  const handleYear = (year: number) => {
    if (!vehicle) setVehicle({ model: "3", year });
    else setVehicle({ ...vehicle, year });
  };

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        <span className="text-sm text-brand-slate dark:text-brand-silver">My Tesla:</span>
        <select
          value={vehicle?.model ?? ""}
          onChange={(e) => e.target.value && handleModel(e.target.value as TeslaModel)}
          className="rounded-lg border border-border bg-white dark:bg-brand-charcoal px-3 py-1.5 text-sm"
          aria-label="Select model"
        >
          <option value="">Model</option>
          {TESLA_MODELS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <select
          value={vehicle?.year ?? ""}
          onChange={(e) => e.target.value && handleYear(Number(e.target.value))}
          className="rounded-lg border border-border bg-white dark:bg-brand-charcoal px-3 py-1.5 text-sm"
          aria-label="Select year"
        >
          <option value="">Year</option>
          {MODEL_YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        {vehicle && (
          <button
            type="button"
            onClick={clearVehicle}
            className="text-sm text-brand-silver hover:text-brand-black dark:hover:text-brand-white"
          >
            Clear
          </button>
        )}
      </div>
    );
  }

  return (
    <section
      className={`rounded-xl border border-border bg-white dark:bg-brand-charcoal p-4 sm:p-5 ${className}`}
      aria-labelledby="vehicle-selector-heading"
    >
      <h2 id="vehicle-selector-heading" className="text-sm font-semibold text-brand-black dark:text-brand-white mb-3">
        Check fit for your vehicle
      </h2>
      <p className="text-sm text-brand-slate dark:text-brand-silver mb-4">
        Enter your VIN or select model and year. We’ll show which parts fit your car.
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        <input
          type="text"
          placeholder="VIN (17 characters)"
          value={vin}
          onChange={(e) => setVin(e.target.value.toUpperCase().slice(0, 17))}
          className="flex-1 min-w-[140px] rounded-lg border border-border bg-white dark:bg-brand-slate/20 px-3 py-2 text-sm font-mono placeholder:text-brand-silver"
          maxLength={17}
          aria-label="Vehicle Identification Number"
        />
        <button
          type="button"
          onClick={handleVIN}
          className="rounded-lg bg-brand-black dark:bg-brand-white text-white dark:text-brand-black px-4 py-2 text-sm font-medium hover:opacity-90"
        >
          Use VIN
        </button>
      </div>
      {vinMessage && (
        <p className="text-sm text-brand-silver mb-3" role="status">{vinMessage}</p>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
        <span className="text-sm text-brand-silver">Or select:</span>
        <select
          value={vehicle?.model ?? ""}
          onChange={(e) => e.target.value && handleModel(e.target.value as TeslaModel)}
          className="rounded-lg border border-border bg-white dark:bg-brand-charcoal px-3 py-2 text-sm"
          aria-label="Model"
        >
          <option value="">Model</option>
          {TESLA_MODELS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        <select
          value={vehicle?.year ?? ""}
          onChange={(e) => e.target.value && handleYear(Number(e.target.value))}
          className="rounded-lg border border-border bg-white dark:bg-brand-charcoal px-3 py-2 text-sm"
          aria-label="Year"
        >
          <option value="">Year</option>
          {MODEL_YEARS.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        {vehicle && (
          <span className="text-sm text-brand-silver">
            Your vehicle: <strong className="text-brand-black dark:text-brand-white">{TESLA_MODELS.find((m) => m.value === vehicle.model)?.label} {vehicle.year}</strong>
          </span>
        )}
        {vehicle && (
          <button type="button" onClick={clearVehicle} className="text-sm text-brand-silver hover:underline">
            Clear
          </button>
        )}
      </div>
    </section>
  );
}
