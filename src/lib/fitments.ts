import type { Vehicle, ProductFitment } from "@/types/vehicle";

/**
 * Returns true if the given vehicle fits this fitment rule.
 */
export function vehicleMatchesFitment(vehicle: Vehicle, f: ProductFitment): boolean {
  if (f.model !== vehicle.model) return false;
  if (vehicle.year < f.yearFrom) return false;
  if (f.yearTo != null && vehicle.year > f.yearTo) return false;

  if (f.productionFrom) {
    const from = f.productionFrom; // "YYYY-MM"
    const vDate = vehicle.productionDate; // "YYYY-MM" or undefined
    if (!vDate) return false; // need production date to know
    if (vDate < from) return false;
  }
  if (f.productionBefore) {
    const before = f.productionBefore;
    const vDate = vehicle.productionDate;
    if (!vDate) return false;
    if (vDate >= before) return false;
  }
  return true;
}

/**
 * Parse Tesla VIN (17 chars) to get model year.
 * Position 10 (0-indexed: 9) = model year code. Does not decode model.
 * @see https://en.wikipedia.org/wiki/Vehicle_identification_number
 */
export function getYearFromVIN(vin: string): number | null {
  const v = vin.trim().toUpperCase();
  if (v.length !== 17) return null;
  const yearCode = v[9];
  const yearMap: Record<string, number> = {
    G: 2016, H: 2017, J: 2018, K: 2019, L: 2020, M: 2021, N: 2022, P: 2023, R: 2024, S: 2025,
  };
  return yearMap[yearCode] ?? null;
}

/**
 * Optional: try to infer model from Tesla VIN. Tesla VIN structure varies; this is best-effort.
 * Position 8 sometimes indicates model. Not all Tesla VINs are public; use with caution.
 */
export function getModelFromVIN(vin: string): string | null {
  const v = vin.trim().toUpperCase();
  if (v.length !== 17) return null;
  // Some sources: 8th char can be 3,Y,S,X,E (E for Cybertruck?). Not standardized; return null and let user pick.
  const modelChar = v[7];
  const map: Record<string, string> = {
    "3": "3",
    E: "3", // sometimes 3
    Y: "Y",
    S: "S",
    X: "X",
    C: "Cybertruck",
  };
  return map[modelChar] ?? null;
}
