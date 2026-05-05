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
  getNetwork,
  type NetworkConfig,
  type NetworkId,
  DEFAULT_NETWORK_ID,
  readWallet,
  saveActiveAccount,
  disconnect as walletDisconnect,
  removeAccount as walletRemoveAccount,
  setActiveAccount as walletSetActive,
  type WalletAccount,
} from "@/lib/canton";

type CantonAuthState = {
  partyId: string | null;
  hint: string | null;
  token: string | null;
  network: NetworkConfig;
  networkId: NetworkId;
  apiUrl: string;
  accounts: WalletAccount[];
  isHydrated: boolean;
  login: (hint: string, label?: string) => Promise<void>;
  switchAccount: (partyId: string, networkId: NetworkId) => void;
  switchNetwork: (networkId: NetworkId) => void;
  removeAccount: (partyId: string, networkId: NetworkId) => void;
  logout: () => void;
};

const CantonAuthContext = createContext<CantonAuthState | null>(null);

export function CantonAuthProvider({ children }: { children: ReactNode }) {
  const [partyId, setPartyId] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [networkId, setNetworkId] = useState<NetworkId>(DEFAULT_NETWORK_ID);
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const state = readWallet();
    setAccounts(state.accounts);
    if (state.active) {
      setPartyId(state.active.partyId);
      setHint(state.active.hint);
      setNetworkId(state.active.networkId);
    }
    setIsHydrated(true);
  }, []);

  const network = useMemo(() => getNetwork(networkId), [networkId]);

  const login = useCallback(
    async (rawHint: string, label?: string) => {
      const cleaned = rawHint.trim() || "Employer";
      const pid = await allocateParty(cleaned, {
        apiUrl: network.jsonApiUrl,
        networkId,
      });
      const account: WalletAccount = {
        partyId: pid,
        hint: cleaned,
        networkId,
        label: label?.trim() || cleaned,
        createdAt: Date.now(),
      };
      const next = saveActiveAccount(account);
      setAccounts(next.accounts);
      setPartyId(pid);
      setHint(cleaned);
    },
    [network.jsonApiUrl, networkId],
  );

  const switchAccount = useCallback(
    (pid: string, nid: NetworkId) => {
      const next = walletSetActive(pid, nid);
      setAccounts(next.accounts);
      if (next.active) {
        setPartyId(next.active.partyId);
        setHint(next.active.hint);
        setNetworkId(next.active.networkId);
      }
    },
    [],
  );

  const switchNetwork = useCallback(
    (nid: NetworkId) => {
      setNetworkId(nid);
      // If we already have an account on this network, surface it.
      const state = readWallet();
      const onTarget = state.accounts.find((a) => a.networkId === nid);
      if (onTarget) {
        const next = walletSetActive(onTarget.partyId, nid);
        if (next.active) {
          setPartyId(next.active.partyId);
          setHint(next.active.hint);
          setAccounts(next.accounts);
        }
      } else {
        // No account yet on the new network — clear active session but keep accounts.
        const cleared = walletDisconnect();
        setAccounts(cleared.accounts);
        setPartyId(null);
        setHint(null);
      }
      clearPartyCache();
    },
    [],
  );

  const removeAccount = useCallback(
    (pid: string, nid: NetworkId) => {
      const next = walletRemoveAccount(pid, nid);
      setAccounts(next.accounts);
      if (!next.active) {
        setPartyId(null);
        setHint(null);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    const next = walletDisconnect();
    setAccounts(next.accounts);
    setPartyId(null);
    setHint(null);
    clearPartyCache();
  }, []);

  const token = useMemo(
    () => (partyId ? partyToken(partyId, networkId) : null),
    [partyId, networkId],
  );

  const value = useMemo<CantonAuthState>(
    () => ({
      partyId,
      hint,
      token,
      network,
      networkId,
      apiUrl: network.jsonApiUrl,
      accounts,
      isHydrated,
      login,
      switchAccount,
      switchNetwork,
      removeAccount,
      logout,
    }),
    [
      partyId,
      hint,
      token,
      network,
      networkId,
      accounts,
      isHydrated,
      login,
      switchAccount,
      switchNetwork,
      removeAccount,
      logout,
    ],
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
