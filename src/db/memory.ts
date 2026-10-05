/**
 * In-memory / localStorage store for web previews where expo-sqlite
 * may be unavailable. Native builds use SQLite via database.ts.
 */
import type {
  CollectorSession,
  Invoice,
  PaymentRecord,
  ReceiptRange,
  Subscriber,
} from '../types/models';

const STORAGE_KEY = 'molada_web_db_v1';

interface MemoryDb {
  meta: Record<string, string>;
  subscribers: Subscriber[];
  invoices: Invoice[];
  payments: PaymentRecord[];
  receiptRange: ReceiptRange | null;
}

function emptyDb(): MemoryDb {
  return {
    meta: {},
    subscribers: [],
    invoices: [],
    payments: [],
    receiptRange: null,
  };
}

let db: MemoryDb = emptyDb();

function persist(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    }
  } catch {
    // ignore quota / private mode
  }
}

function hydrate(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) db = JSON.parse(raw) as MemoryDb;
    }
  } catch {
    db = emptyDb();
  }
}

hydrate();

export const memoryDb = {
  reset(): void {
    db = emptyDb();
    persist();
  },

  setMeta(key: string, value: string): void {
    db.meta[key] = value;
    persist();
  },

  getMeta(key: string): string | null {
    return db.meta[key] ?? null;
  },

  replaceBootstrap(
    session: CollectorSession,
    subscribers: Subscriber[],
    invoices: Invoice[],
    receiptRange: ReceiptRange,
  ): void {
    db.meta.session = JSON.stringify(session);
    db.subscribers = subscribers;
    // Preserve local payment progress for invoices that already have local payments
    const localPaid = new Map<string, number>();
    for (const p of db.payments) {
      localPaid.set(p.invoiceId, (localPaid.get(p.invoiceId) ?? 0) + p.amount);
    }
    db.invoices = invoices.map((inv) => {
      const extra = localPaid.get(inv.id) ?? 0;
      if (extra === 0) return inv;
      const paidAmount = inv.paidAmount + extra;
      const remaining = Math.max(0, inv.totalDue - paidAmount);
      let status: Invoice['status'] = 'unpaid';
      if (remaining === 0 && paidAmount > 0) status = 'paid';
      else if (paidAmount > 0) status = 'partial';
      return { ...inv, paidAmount, remaining, status };
    });
    db.receiptRange = receiptRange;
    persist();
  },

  getSession(): CollectorSession | null {
    const raw = db.meta.session;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CollectorSession;
    } catch {
      return null;
    }
  },

  listSubscribers(): Subscriber[] {
    return [...db.subscribers];
  },

  getSubscriber(id: string): Subscriber | null {
    return db.subscribers.find((s) => s.id === id) ?? null;
  },

  listInvoices(): Invoice[] {
    return [...db.invoices];
  },

  getInvoice(id: string): Invoice | null {
    return db.invoices.find((i) => i.id === id) ?? null;
  },

  getInvoiceBySubscriber(subscriberId: string): Invoice | null {
    return db.invoices.find((i) => i.subscriberId === subscriberId) ?? null;
  },

  getReceiptRange(): ReceiptRange | null {
    return db.receiptRange ? { ...db.receiptRange } : null;
  },

  allocateReceiptNo(): number {
    if (!db.receiptRange) throw new Error('لا يوجد نطاق وصولات محجوز');
    if (db.receiptRange.next > db.receiptRange.to) {
      throw new Error('انتهى نطاق أرقام الوصولات — حدّث اليوم من السيرفر');
    }
    const no = db.receiptRange.next;
    db.receiptRange.next += 1;
    persist();
    return no;
  },

  insertPayment(payment: PaymentRecord): void {
    db.payments.push(payment);
    const inv = db.invoices.find((i) => i.id === payment.invoiceId);
    if (inv) {
      inv.paidAmount += payment.amount;
      inv.remaining = Math.max(0, inv.totalDue - inv.paidAmount);
      if (inv.remaining === 0) inv.status = 'paid';
      else if (inv.paidAmount > 0) inv.status = 'partial';
      else inv.status = 'unpaid';
    }
    persist();
  },

  listPayments(): PaymentRecord[] {
    return [...db.payments].sort((a, b) =>
      a.createdAt < b.createdAt ? 1 : -1,
    );
  },

  listUnsyncedPayments(): PaymentRecord[] {
    return db.payments.filter((p) => !p.synced);
  },

  markPaymentsSynced(uuids: string[]): void {
    const set = new Set(uuids);
    for (const p of db.payments) {
      if (set.has(p.uuid)) p.synced = true;
    }
    persist();
  },

  getPayment(uuid: string): PaymentRecord | null {
    return db.payments.find((p) => p.uuid === uuid) ?? null;
  },

  paymentsTodayTotal(): number {
    const today = new Date().toISOString().slice(0, 10);
    return db.payments
      .filter((p) => p.createdAt.startsWith(today))
      .reduce((sum, p) => sum + p.amount, 0);
  },
};
