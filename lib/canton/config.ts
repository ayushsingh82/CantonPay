/**
 * Built DAR package id — **required** for Canton JSON API (`/v1/query`, `/v1/create`):
 * template ids must be `#hash:Module:Entity` (see Slinky / `docs/CANTON_DAML_AND_STACK.md`).
 * Run `daml build` and paste the package id from the log (or from `.daml/dist/*.dar` metadata).
 */
export const DAML_PACKAGE_ID =
  process.env.NEXT_PUBLIC_DAML_PACKAGE_ID ?? "";

export const MODULE_NAME = "Payroll";

export const LEDGER_ID =
  process.env.NEXT_PUBLIC_CANTON_LEDGER_ID ?? "sandbox";

export const APPLICATION_ID =
  process.env.NEXT_PUBLIC_CANTON_APPLICATION_ID ?? "cantonpay";

export function damlPackageConfigured(): boolean {
  return Boolean(DAML_PACKAGE_ID?.trim());
}

export function templateId(templateName: string): string {
  if (DAML_PACKAGE_ID) {
    return `${DAML_PACKAGE_ID}:${MODULE_NAME}:${templateName}`;
  }
  return `${MODULE_NAME}:${templateName}`;
}
