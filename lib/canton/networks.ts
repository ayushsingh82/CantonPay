/**
 * Canton network presets used by the wallet + landing page.
 *
 * - `sandbox`     — local Daml/Canton sandbox, JSON API on http://localhost:7575
 * - `cc-testnet`  — Canton Coin DevNet via a participant the user runs/operates.
 *                   The Splice / Canton Network does not expose a single public
 *                   JSON API; you point this at *your* participant connected to
 *                   the global synchronizer DevNet.
 *
 * The wallet stores the active network alongside the party, so every JSON-API
 * call uses the right base URL even after a refresh.
 */
export type NetworkId = "sandbox" | "cc-testnet";

export type NetworkConfig = {
  id: NetworkId;
  label: string;
  shortLabel: string;
  jsonApiUrl: string;
  ledgerId: string;
  applicationId: string;
  currency: string;
  faucet?: { kind: "operator" | "external"; hint: string; url?: string };
  description: string;
  testnet: boolean;
};

const ENV_TESTNET_URL =
  process.env.NEXT_PUBLIC_CANTON_TESTNET_JSON_API_URL ??
  "http://localhost:7585";

const ENV_SANDBOX_URL =
  process.env.NEXT_PUBLIC_CANTON_JSON_API_URL ?? "http://localhost:7575";

export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  sandbox: {
    id: "sandbox",
    label: "Local sandbox",
    shortLabel: "Sandbox",
    jsonApiUrl: ENV_SANDBOX_URL,
    ledgerId:
      process.env.NEXT_PUBLIC_CANTON_LEDGER_ID ?? "sandbox",
    applicationId:
      process.env.NEXT_PUBLIC_CANTON_APPLICATION_ID ?? "cantonpay",
    currency: "DEV",
    description:
      "Daml sandbox JSON API for local development. Parties are allocated on demand; treasury balances are off-asset Decimals on the PayrollOrganization template.",
    testnet: false,
  },
  "cc-testnet": {
    id: "cc-testnet",
    label: "Canton Coin · DevNet",
    shortLabel: "CC DevNet",
    jsonApiUrl: ENV_TESTNET_URL,
    ledgerId:
      process.env.NEXT_PUBLIC_CANTON_TESTNET_LEDGER_ID ?? "participant1",
    applicationId:
      process.env.NEXT_PUBLIC_CANTON_APPLICATION_ID ?? "cantonpay",
    currency: "CC",
    faucet: {
      kind: "external",
      hint: "Use the Splice DevNet validator faucet to fund your party with Canton Coin Amulets, then mirror the balance into PayrollOrganization.treasuryBalance.",
      url: "https://docs.sync.global/app_dev/testnet_overview.html",
    },
    description:
      "Point this at your participant node connected to the Global Synchronizer DevNet. Party allocation goes through your participant; CC balances are tracked off-template, mirrored into the org treasury.",
    testnet: true,
  },
};

export const DEFAULT_NETWORK_ID: NetworkId =
  (process.env.NEXT_PUBLIC_CANTON_NETWORK as NetworkId | undefined) ??
  "sandbox";

export function getNetwork(id: NetworkId | null | undefined): NetworkConfig {
  if (id && NETWORKS[id]) return NETWORKS[id];
  return NETWORKS[DEFAULT_NETWORK_ID];
}

export function listNetworks(): NetworkConfig[] {
  return Object.values(NETWORKS);
}
