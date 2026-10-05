/** Round invoice totals to nearest 250 IQD. Payments stay exact. */
export function roundToNearest250(amount: number): number {
  return Math.round(amount / 250) * 250;
}

export function formatIqd(amount: number): string {
  const n = Math.trunc(amount);
  return n.toLocaleString('en-US');
}

export function formatIqdWithUnit(amount: number): string {
  return `${formatIqd(amount)} د.ع`;
}

export function parseIqdInput(raw: string): number {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return 0;
  return parseInt(digits, 10);
}
