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

export type LoginResult = {
  partyId: string;
  /** True when the party id is a local mock because the JSON API was
   * unreachable. Real ledger calls will fail under a demo party. */
  demo: boolean;
};

type CantonAuthState = {
  partyId: string | null;
  hint: string | null;
  token: string | null;
  network: NetworkConfig;
  networkId: NetworkId;
  apiUrl: string;
  accounts: WalletAccount[];
  isHydrated: boolean;
  /** True if the active account was minted in demo (offline) mode. */
  isDemo: boolean;
  /** Resolves to a LoginResult so the caller knows whether real or demo
   * mode took effect. Network-unreachable errors auto-fall-back to demo. */
  login: (hint: string, label?: string) => Promise<LoginResult>;
  loginDemo: (hint: string, label?: string) => void;
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

  const isDemo = useMemo(() => {
    if (!partyId) return false;
    return (
      accounts.find(
        (a) => a.partyId === partyId && a.networkId === networkId,
      )?.demo === true
    );
  }, [accounts, partyId, networkId]);

  const isUnreachable = (e: unknown) => {
    if (e instanceof TypeError) return true;
    const msg = e instanceof Error ? e.message : String(e);
    return /Failed to fetch|NetworkError|ECONNREFUSED|ENOTFOUND|fetch failed/i.test(
      msg,
    );
  };

  const mintDemoPartyId = (cleaned: string, nid: NetworkId) => {
    // Deterministic-ish per (network, hint) so reloads keep the same id.
    const seed = `${nid}::${cleaned}`;
    let h = 5381;
    for (let i = 0; i < seed.length; i++) {
      h = ((h << 5) + h + seed.charCodeAt(i)) >>> 0;
    }
    return `${cleaned}::cantonpay-demo-${h.toString(16)}`;
  };

  const persistAccount = (account: WalletAccount) => {
    const next = saveActiveAccount(account);
    setAccounts(next.accounts);
    setPartyId(account.partyId);
    setHint(account.hint);
  };

  const login = useCallback<CantonAuthState["login"]>(
    async (rawHint, label) => {
      const cleaned = rawHint.trim() || "Employer";
      let pid: string;
      let demo = false;
      try {
        pid = await allocateParty(cleaned, {
          apiUrl: network.jsonApiUrl,
          networkId,
        });
      } catch (e) {
        if (!isUnreachable(e)) throw e;
        // JSON API not reachable — fall back to a deterministic demo party
        // so the user can still tour the UI. Real ledger calls will fail
        // under this party; the wallet flags `demo: true` so the rest of
        // the app can disable / warn appropriately.
        pid = mintDemoPartyId(cleaned, networkId);
        demo = true;
      }
      const account: WalletAccount = {
        partyId: pid,
        hint: cleaned,
        networkId,
        label: label?.trim() || (demo ? `${cleaned} (demo)` : cleaned),
        demo,
        createdAt: Date.now(),
      };
      persistAccount(account);
      return { partyId: pid, demo };
    },
    [network.jsonApiUrl, networkId],
  );

  const loginDemo = useCallback(
    (rawHint: string, label?: string) => {
      const cleaned = rawHint.trim() || "Employer";
      const account: WalletAccount = {
        partyId: mintDemoPartyId(cleaned, networkId),
        hint: cleaned,
        networkId,
        label: label?.trim() || `${cleaned} (demo)`,
        demo: true,
        createdAt: Date.now(),
      };
      persistAccount(account);
    },
    [networkId],
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
      isDemo,
      login,
      loginDemo,
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
      isDemo,
      login,
      loginDemo,
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
