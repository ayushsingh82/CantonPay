"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  allocateParty,
  partyToken,
  clearPartyCache,
} from "@/lib/canton";

type CantonAuthState = {
  partyId: string | null;
  hint: string | null;
  token: string | null;
  login: (hint: string) => Promise<void>;
  logout: () => void;
};

const CantonAuthContext = createContext<CantonAuthState | null>(null);

export function CantonAuthProvider({ children }: { children: ReactNode }) {
  const [partyId, setPartyId] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const raw =
      typeof window !== "undefined"
        ? sessionStorage.getItem("canton_party")
        : null;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as {
          partyId?: string;
          hint?: string;
        };
        if (parsed.partyId) {
          setPartyId(parsed.partyId);
          setHint(parsed.hint ?? null);
        }
      } catch {
        /* ignore */
      }
    }
  }, []);

  const login = useCallback(async (h: string) => {
    const pid = await allocateParty(h);
    setPartyId(pid);
    setHint(h);
    sessionStorage.setItem(
      "canton_party",
      JSON.stringify({ partyId: pid, hint: h }),
    );
  }, []);

  const logout = useCallback(() => {
    setPartyId(null);
    setHint(null);
    sessionStorage.removeItem("canton_party");
    clearPartyCache();
  }, []);

  const token = useMemo(
    () => (partyId ? partyToken(partyId) : null),
    [partyId],
  );

  const value = useMemo(
    () => ({ partyId, hint, token, login, logout }),
    [partyId, hint, token, login, logout],
  );

  return (
    <CantonAuthContext.Provider value={value}>
      {children}
    </CantonAuthContext.Provider>
  );
}

export function useCantonAuth() {
  const ctx = useContext(CantonAuthContext);
  if (!ctx) {
    throw new Error("useCantonAuth must be used within CantonAuthProvider");
  }
  return ctx;
}
