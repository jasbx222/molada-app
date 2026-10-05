/** Round invoice totals to nearest 250 IQD. Payments stay exact. */
export function roundToNearest250(amount: number): number {
  return Math.round(amount / 250) * 250;
}

/** Digits only, western grouping — always LTR. */
export function formatIqd(amount: number): string {
  const n = Math.trunc(amount);
  return n.toLocaleString('en-US');
}

/**
 * Canonical display: "15,000 د.ع" (number then unit).
 * Uses Unicode LTR isolates so RTL never flips it to "د.ع 15,000".
 */
export function formatIqdWithUnit(amount: number): string {
  return `\u2066${formatIqd(amount)}\u2069\u00A0د.ع`;
}

export function parseIqdInput(raw: string): number {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return 0;
  return parseInt(digits, 10);
}
