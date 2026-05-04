/**
 * Canton Ledger JSON API (create / query / exercise / fetch), JWT helpers.
 * @see https://docs.daml.com/json-api/index.html
 */

import { APPLICATION_ID, LEDGER_ID, templateId } from "./config";
import { cantonJsonApiBaseUrl } from "./env";

const CANTON_API = cantonJsonApiBaseUrl();

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

/** Sandbox dev token — production must use signed JWT from your IdP. */
export function adminToken(): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      "https://daml.com/ledger-api": {
        ledgerId: LEDGER_ID,
        applicationId: APPLICATION_ID,
        admin: true,
      },
      exp: Math.floor(Date.now() / 1000) + 86400,
      sub: "admin",
    }),
  );
  return `${header}.${payload}.unsigned`;
}

export function partyToken(partyId: string): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      "https://daml.com/ledger-api": {
        ledgerId: LEDGER_ID,
        applicationId: APPLICATION_ID,
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

export function getCachedParty(hint: string): string | undefined {
  return partyRegistry[hint];
}

export async function allocateParty(hint: string): Promise<string> {
  if (partyRegistry[hint]) return partyRegistry[hint];

  const listRes = await fetch(`${CANTON_API}/v1/parties`, {
    method: "GET",
    headers: { Authorization: `Bearer ${adminToken()}` },
  });
  const listData = await listRes.json();
  const found = listData.result?.find(
    (p: { displayName?: string; identifier: string }) =>
      p.displayName === hint || p.identifier.startsWith(`${hint}::`),
  );
  if (found) {
    partyRegistry[hint] = found.identifier;
    return found.identifier;
  }

  const res = await fetch(`${CANTON_API}/v1/parties/allocate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken()}`,
    },
    body: JSON.stringify({ identifierHint: hint, displayName: hint }),
  });

  const data = await res.json();
  if (data.status === 200 && data.result?.identifier) {
    partyRegistry[hint] = data.result.identifier;
    return data.result.identifier;
  }

  throw new Error(`Failed to allocate party ${hint}: ${JSON.stringify(data)}`);
}

async function apiCall(endpoint: string, body: unknown, token: string) {
  const res = await fetch(`${CANTON_API}${endpoint}`, {
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
): Promise<ContractResult<T>> {
  const result = await apiCall(
    "/v1/create",
    {
      templateId: templateId(name),
      payload,
    },
    token,
  );
  return result.result;
}

export async function queryContracts<T>(
  name: string,
  token: string,
): Promise<ContractResult<T>[]> {
  const result = await apiCall(
    "/v1/query",
    {
      templateIds: [templateId(name)],
    },
    token,
  );
  return result.result ?? [];
}

export async function exerciseChoice(
  name: string,
  contractId: string,
  choice: string,
  argument: Record<string, unknown>,
  token: string,
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
  );
}

export async function fetchContract<T>(
  name: string,
  contractId: string,
  token: string,
): Promise<ContractResult<T> | null> {
  try {
    const result = await apiCall(
      "/v1/fetch",
      {
        templateId: templateId(name),
        contractId,
      },
      token,
    );
    return result.result ?? null;
  } catch {
    return null;
  }
}

export function clearPartyCache() {
  Object.keys(partyRegistry).forEach((k) => delete partyRegistry[k]);
}
