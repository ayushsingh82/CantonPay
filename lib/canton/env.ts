/**
 * Resolved Canton JSON API origin (no `/v1` suffix).
 *
 * The browser wallet may override the origin per-network; pass that override
 * into helpers that need it. The bare default falls back to env vars so
 * server-side / SSR code paths keep working.
 */
import { DEFAULT_NETWORK_ID, getNetwork } from "./networks";

export function cantonJsonApiBaseUrl(): string {
  return (
    process.env.CANTON_JSON_API_URL ??
    process.env.NEXT_PUBLIC_CANTON_JSON_API_URL ??
    getNetwork(DEFAULT_NETWORK_ID).jsonApiUrl ??
    ""
  );
}

export function cantonJsonApiConfigured(): boolean {
  return Boolean(cantonJsonApiBaseUrl().trim());
}
