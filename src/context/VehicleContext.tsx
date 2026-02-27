"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Vehicle } from "@/types/vehicle";
import { getYearFromVIN, getModelFromVIN } from "@/lib/fitments";
import { TESLA_MODELS } from "@/types/vehicle";

type VehicleContextValue = {
  vehicle: Vehicle | null;
  setVehicle: (v: Vehicle | null) => void;
  setVehicleFromVIN: (vin: string) => { success: boolean; message?: string };
  clearVehicle: () => void;
};

const STORAGE_KEY = "mongoori-finds-vehicle";

function loadStored(): Vehicle | null {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return null;
    const v = JSON.parse(s) as Vehicle;
    if (v && typeof v.model === "string" && typeof v.year === "number") return v;
  } catch {}
  return null;
}

function save(v: Vehicle | null) {
  if (typeof window === "undefined") return;
  if (v) localStorage.setItem(STORAGE_KEY, JSON.stringify(v));
  else localStorage.removeItem(STORAGE_KEY);
}

const VehicleContext = createContext<VehicleContextValue | null>(null);

export function VehicleProvider({ children }: { children: React.ReactNode }) {
  const [vehicle, setVehicleState] = useState<Vehicle | null>(null);

  const setVehicle = useCallback((v: Vehicle | null) => {
    setVehicleState(v);
    save(v);
  }, []);

  const setVehicleFromVIN = useCallback((vin: string) => {
    const year = getYearFromVIN(vin);
    const model = getModelFromVIN(vin);
    if (year == null) {
      return { success: false, message: "Could not read year from VIN. Enter model and year manually." };
    }
    const modelLabel = model ? TESLA_MODELS.find((m) => m.value === model)?.value ?? model : null;
    if (modelLabel) {
      setVehicleState({ model: modelLabel as Vehicle["model"], year, productionDate: undefined });
      save({ model: modelLabel as Vehicle["model"], year });
      return { success: true };
    }
    setVehicleState({ model: "3", year } as Vehicle);
    save({ model: "3", year } as Vehicle);
    return { success: true, message: "Year detected. Please confirm your model below." };
  }, []);

  const clearVehicle = useCallback(() => {
    setVehicleState(null);
    save(null);
  }, []);

  useEffect(() => {
    setVehicleState(loadStored());
  }, []);

  return (
    <VehicleContext.Provider value={{ vehicle, setVehicle, setVehicleFromVIN, clearVehicle }}>
      {children}
    </VehicleContext.Provider>
  );
}

export function useVehicle() {
  const ctx = useContext(VehicleContext);
  if (!ctx) throw new Error("useVehicle must be used within VehicleProvider");
  return ctx;
}
