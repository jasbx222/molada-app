/** Web stub — expo-sqlite WASM is not used; memory/localStorage handles storage. */
import type {
  CollectorSession,
  Invoice,
  PaymentRecord,
  ReceiptRange,
  Subscriber,
} from '../types/models';

export function isSqliteAvailable(): boolean {
  return false;
}

export async function openSqlite(): Promise<never> {
  throw new Error('SQLite is not available on web');
}

async function unused(): Promise<never> {
  throw new Error('SQLite is not available on web');
}

export const sqliteDb = {
  setMeta: (_k: string, _v: string) => unused(),
  getMeta: (_k: string) => unused() as Promise<string | null>,
  replaceBootstrap: (
    _s: CollectorSession,
    _subs: Subscriber[],
    _inv: Invoice[],
    _r: ReceiptRange,
  ) => unused(),
  getSession: () => unused() as Promise<CollectorSession | null>,
  listSubscribers: () => unused() as Promise<Subscriber[]>,
  getSubscriber: (_id: string) => unused() as Promise<Subscriber | null>,
  listInvoices: () => unused() as Promise<Invoice[]>,
  getInvoice: (_id: string) => unused() as Promise<Invoice | null>,
  getInvoiceBySubscriber: (_id: string) => unused() as Promise<Invoice | null>,
  getReceiptRange: () => unused() as Promise<ReceiptRange | null>,
  allocateReceiptNo: () => unused() as Promise<number>,
  insertPayment: (_p: PaymentRecord) => unused(),
  listPayments: () => unused() as Promise<PaymentRecord[]>,
  listUnsyncedPayments: () => unused() as Promise<PaymentRecord[]>,
  markPaymentsSynced: (_u: string[]) => unused(),
  getPayment: (_u: string) => unused() as Promise<PaymentRecord | null>,
  paymentsTodayTotal: () => unused() as Promise<number>,
};
