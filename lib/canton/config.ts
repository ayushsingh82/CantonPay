/** Built DAR package id — set after `daml build`, or `NEXT_PUBLIC_DAML_PACKAGE_ID` for JSON API template IDs. */
export const DAML_PACKAGE_ID =
  process.env.NEXT_PUBLIC_DAML_PACKAGE_ID ?? "";

export const MODULE_NAME = "Payroll";

export const LEDGER_ID =
  process.env.NEXT_PUBLIC_CANTON_LEDGER_ID ?? "sandbox";

export const APPLICATION_ID =
  process.env.NEXT_PUBLIC_CANTON_APPLICATION_ID ?? "canton-payroll";

export function templateId(templateName: string): string {
  if (DAML_PACKAGE_ID) {
    return `${DAML_PACKAGE_ID}:${MODULE_NAME}:${templateName}`;
  }
  return `${MODULE_NAME}:${templateName}`;
}
