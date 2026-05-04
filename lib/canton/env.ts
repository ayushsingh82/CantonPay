/**
 * Resolved Canton JSON API origin (no `/v1` suffix).
 * - Browser: typically only `NEXT_PUBLIC_CANTON_JSON_API_URL` is available.
 * - Server / CI: may set `CANTON_JSON_API_URL` without exposing it to the client bundle.
 */
export function cantonJsonApiBaseUrl(): string {
  return (
    process.env.CANTON_JSON_API_URL ??
    process.env.NEXT_PUBLIC_CANTON_JSON_API_URL ??
    ""
  );
}

export function cantonJsonApiConfigured(): boolean {
  return Boolean(cantonJsonApiBaseUrl().trim());
}
