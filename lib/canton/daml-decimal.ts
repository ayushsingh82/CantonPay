/**
 * Daml `Decimal` in the JSON API must be sent as a **string** (e.g. `"5000.00"`), not a JS number.
 * @see https://docs.daml.com/json-api/lf-value-specification.html
 */
export function toDamlDecimalString(value: number | string): string {
  if (typeof value === "string") {
    const t = value.trim().replace(/,/g, "");
    if (t && /^-?\d+(\.\d+)?$/.test(t)) return t;
  }
  const n = typeof value === "number" ? value : parseFloat(String(value).replace(/,/g, ""));
  if (!Number.isFinite(n)) return "0.0";
  return n.toFixed(2);
}
