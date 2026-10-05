/** Round invoice totals to nearest 250 IQD. Payments stay exact. */
export function roundToNearest250(amount: number): number {
  return Math.round(amount / 250) * 250;
}

/** Digits only, western grouping. */
export function formatIqd(amount: number): string {
  return Math.trunc(amount).toLocaleString('en-US');
}

/** String form for button labels / messages: "15,000 د.ع" */
export function formatIqdWithUnit(amount: number): string {
  return `${formatIqd(amount)}\u00A0د.ع`;
}

export function parseIqdInput(raw: string): number {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return 0;
  return parseInt(digits, 10);
}
