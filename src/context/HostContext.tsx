"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type HostStatus = {
  isHost: boolean;
  email: string;
  orderCount: number;
  verifiedAt: number; // timestamp
};

type HostContextValue = {
  hostStatus: HostStatus | null;
  verifying: boolean;
  verifyHost: (email: string) => Promise<{ success: boolean; isHost: boolean; message?: string }>;
  clearHost: () => void;
};

const STORAGE_KEY = "mongoori-finds-host";
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function loadStored(): HostStatus | null {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return null;
    const parsed = JSON.parse(s) as HostStatus;
    if (Date.now() - parsed.verifiedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

const HostContext = createContext<HostContextValue | null>(null);

export function HostProvider({ children }: { children: React.ReactNode }) {
  const [hostStatus, setHostStatus] = useState<HostStatus | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    setHostStatus(loadStored());
  }, []);

  const verifyHost = useCallback(async (email: string) => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/host-verify?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (data.isHost) {
        const status: HostStatus = {
          isHost: true,
          email: email.trim().toLowerCase(),
          orderCount: data.orderCount ?? 0,
          verifiedAt: Date.now(),
        };
        setHostStatus(status);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
        return { success: true, isHost: true };
      } else {
        return { success: true, isHost: false, message: "This email is not registered as a mongoori host." };
      }
    } catch {
      return { success: false, isHost: false, message: "Verification failed. Please try again." };
    } finally {
      setVerifying(false);
    }
  }, []);

  const clearHost = useCallback(() => {
    setHostStatus(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <HostContext.Provider value={{ hostStatus, verifying, verifyHost, clearHost }}>
      {children}
    </HostContext.Provider>
  );
}

export function useHost() {
  const ctx = useContext(HostContext);
  if (!ctx) throw new Error("useHost must be used within HostProvider");
  return ctx;
}
