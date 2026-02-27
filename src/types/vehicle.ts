/**
 * Tesla model codes. Add new models (e.g. "2" for next-gen) here when Tesla releases.
 */
export type TeslaModel = "3" | "Y" | "S" | "X" | "Cybertruck";

export type Vehicle = {
  model: TeslaModel;
  year: number;
  /** Optional: YYYY-MM for mid-year part changes (e.g. "2025-06" = June 2025+) */
  productionDate?: string;
};

/**
 * One fitment rule: this product fits this model/year (and optional production date range).
 * When Tesla changes a part mid-year, use productionFrom / productionBefore.
 */
export type ProductFitment = {
  model: TeslaModel;
  yearFrom: number;
  /** Through this year; omit for "through present" */
  yearTo?: number | null;
  /** If set: only vehicles built from this month (YYYY-MM) */
  productionFrom?: string;
  /** If set: only vehicles built before this month (YYYY-MM) */
  productionBefore?: string;
  /** Optional note, e.g. "2024 refresh" */
  note?: string;
};

export const TESLA_MODELS: { value: TeslaModel; label: string }[] = [
  { value: "3", label: "Model 3" },
  { value: "Y", label: "Model Y" },
  { value: "S", label: "Model S" },
  { value: "X", label: "Model X" },
  { value: "Cybertruck", label: "Cybertruck" },
];

const currentYear = new Date().getFullYear();
export const MODEL_YEARS = Array.from({ length: currentYear - 2016 }, (_, i) => currentYear - i);
