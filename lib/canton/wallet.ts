/**
 * Browser-only wallet store for CantonPay.
 *
 * A "wallet" here is just a persisted (party id, network id, hint, label)
 * tuple plus a generated dev JWT. We don't custody any secret material —
 * Canton's party-based auth model means the participant's IdP / signed JWTs
 * are the real auth boundary. This wallet exists so the UX feels like the
 * EVM wallets users are familiar with: connect, switch network, disconnect.
 *
 * Storage layout (localStorage):
 *   cantonpay:wallet         → { active: WalletAccount; accounts: WalletAccount[] }
 */
import type { NetworkId } from "./networks";

export type WalletAccount = {
  partyId: string;
  hint: string;
  networkId: NetworkId;
  label?: string;
  /** True if this account was minted client-side because the JSON API was
   * unreachable. Real-ledger operations will fail under a demo party. */
  demo?: boolean;
  createdAt: number;
};

type WalletState = {
  active: WalletAccount | null;
  accounts: WalletAccount[];
};

const STORAGE_KEY = "cantonpay:wallet";

function safeRead(): WalletState {
  if (typeof window === "undefined") return { active: null, accounts: [] };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { active: null, accounts: [] };
    const parsed = JSON.parse(raw) as Partial<WalletState>;
    return {
      active: parsed.active ?? null,
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
    };
  } catch {
    return { active: null, accounts: [] };
  }
}

function safeWrite(state: WalletState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / disabled storage — ignore */
  }
}

export function readWallet(): WalletState {
  return safeRead();
}

export function saveActiveAccount(account: WalletAccount): WalletState {
  const state = safeRead();
  const id = `${account.networkId}::${account.partyId}`;
  const others = state.accounts.filter(
    (a) => `${a.networkId}::${a.partyId}` !== id,
  );
  const next: WalletState = {
    active: account,
    accounts: [account, ...others].slice(0, 8),
  };
  safeWrite(next);
  return next;
}

export function setActiveAccount(
  partyId: string,
  networkId: NetworkId,
): WalletState {
  const state = safeRead();
  const found = state.accounts.find(
    (a) => a.partyId === partyId && a.networkId === networkId,
  );
  if (!found) return state;
  const next: WalletState = { ...state, active: found };
  safeWrite(next);
  return next;
}

export function removeAccount(
  partyId: string,
  networkId: NetworkId,
): WalletState {
  const state = safeRead();
  const accounts = state.accounts.filter(
    (a) => !(a.partyId === partyId && a.networkId === networkId),
  );
  const wasActive =
    state.active &&
    state.active.partyId === partyId &&
    state.active.networkId === networkId;
  const next: WalletState = {
    active: wasActive ? null : state.active,
    accounts,
  };
  safeWrite(next);
  return next;
}

export function disconnect(): WalletState {
  const state = safeRead();
  const next: WalletState = { active: null, accounts: state.accounts };
  safeWrite(next);
  return next;
}

export function clearWallet(): WalletState {
  safeWrite({ active: null, accounts: [] });
  return { active: null, accounts: [] };
}

export function shortParty(partyId: string, head = 10, tail = 6): string {
  if (!partyId) return "";
  if (partyId.length <= head + tail + 1) return partyId;
  return `${partyId.slice(0, head)}…${partyId.slice(-tail)}`;
}
