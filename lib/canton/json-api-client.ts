/**
 * Canton Ledger JSON API (create / query / exercise / fetch), JWT helpers.
 * @see https://docs.daml.com/json-api/index.html
 *
 * All public functions accept an optional `apiUrl` override so the wallet can
 * route calls to the active network's JSON API base URL.
 */

import { APPLICATION_ID, LEDGER_ID, templateId } from "./config";
import { cantonJsonApiBaseUrl } from "./env";
import { getNetwork, type NetworkId } from "./networks";

function base64url(str: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(str, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function networkLedgerId(networkId?: NetworkId): string {
  if (!networkId) return LEDGER_ID;
  return getNetwork(networkId).ledgerId;
}

function networkAppId(networkId?: NetworkId): string {
  if (!networkId) return APPLICATION_ID;
  return getNetwork(networkId).applicationId;
}

/** Sandbox dev token — production must use signed JWT from your IdP. */
export function adminToken(networkId?: NetworkId): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      "https://daml.com/ledger-api": {
        ledgerId: networkLedgerId(networkId),
        applicationId: networkAppId(networkId),
        admin: true,
      },
      exp: Math.floor(Date.now() / 1000) + 86400,
      sub: "admin",
    }),
  );
  return `${header}.${payload}.unsigned`;
}

export function partyToken(partyId: string, networkId?: NetworkId): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      "https://daml.com/ledger-api": {
        ledgerId: networkLedgerId(networkId),
        applicationId: networkAppId(networkId),
        actAs: [partyId],
        readAs: [partyId],
      },
      exp: Math.floor(Date.now() / 1000) + 86400,
      sub: partyId,
    }),
  );
  return `${header}.${payload}.unsigned`;
}

const partyRegistry: Record<string, string> = {};

function regKey(networkId: NetworkId | undefined, hint: string): string {
  return `${networkId ?? "default"}::${hint}`;
}

export function getCachedParty(
  hint: string,
  networkId?: NetworkId,
): string | undefined {
  return partyRegistry[regKey(networkId, hint)];
}

function resolveApiUrl(apiUrl?: string): string {
  return (apiUrl ?? cantonJsonApiBaseUrl()).replace(/\/+$/, "");
}

export async function allocateParty(
  hint: string,
  opts: { apiUrl?: string; networkId?: NetworkId } = {},
): Promise<string> {
  const key = regKey(opts.networkId, hint);
  if (partyRegistry[key]) return partyRegistry[key];
  const api = resolveApiUrl(opts.apiUrl);
  if (!api) throw new Error("Canton JSON API URL not configured");

  const listRes = await fetch(`${api}/v1/parties`, {
    method: "GET",
    headers: { Authorization: `Bearer ${adminToken(opts.networkId)}` },
  });
  if (listRes.ok) {
    const listData = await listRes.json();
    const found = listData.result?.find(
      (p: { displayName?: string; identifier: string }) =>
        p.displayName === hint || p.identifier.startsWith(`${hint}::`),
    );
    if (found) {
      partyRegistry[key] = found.identifier;
      return found.identifier;
    }
  }

  const res = await fetch(`${api}/v1/parties/allocate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken(opts.networkId)}`,
    },
    body: JSON.stringify({ identifierHint: hint, displayName: hint }),
  });

  const data = await res.json();
  if (data.status === 200 && data.result?.identifier) {
    partyRegistry[key] = data.result.identifier;
    return data.result.identifier;
  }

  throw new Error(`Failed to allocate party ${hint}: ${JSON.stringify(data)}`);
}

async function apiCall(
  endpoint: string,
  body: unknown,
  token: string,
  apiUrl?: string,
) {
  const api = resolveApiUrl(apiUrl);
  if (!api) throw new Error("Canton JSON API URL not configured");
  const res = await fetch(`${api}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Canton API error (${res.status}): ${errText}`);
  }

  return res.json();
}

export type ContractResult<T> = {
  contractId: string;
  templateId: string;
  payload: T;
};

export async function createContract<T>(
  name: string,
  payload: T,
  token: string,
  apiUrl?: string,
): Promise<ContractResult<T>> {
  const result = await apiCall(
    "/v1/create",
    {
      templateId: templateId(name),
      payload,
    },
    token,
    apiUrl,
  );
  return result.result;
}

export async function queryContracts<T>(
  name: string,
  token: string,
  apiUrl?: string,
): Promise<ContractResult<T>[]> {
  const result = await apiCall(
    "/v1/query",
    {
      templateIds: [templateId(name)],
    },
    token,
    apiUrl,
  );
  return result.result ?? [];
}

export async function exerciseChoice(
  name: string,
  contractId: string,
  choice: string,
  argument: Record<string, unknown>,
  token: string,
  apiUrl?: string,
): Promise<{ result?: unknown }> {
  return apiCall(
    "/v1/exercise",
    {
      templateId: templateId(name),
      contractId,
      choice,
      argument,
    },
    token,
    apiUrl,
  );
}

export async function fetchContract<T>(
  name: string,
  contractId: string,
  token: string,
  apiUrl?: string,
): Promise<ContractResult<T> | null> {
  try {
    const result = await apiCall(
      "/v1/fetch",
      {
        templateId: templateId(name),
        contractId,
      },
      token,
      apiUrl,
    );
    return result.result ?? null;
  } catch {
    return null;
  }
}

export function clearPartyCache() {
  Object.keys(partyRegistry).forEach((k) => delete partyRegistry[k]);
}
