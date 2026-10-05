import { Platform } from 'react-native';
import { memoryDb } from './memory';
import { isSqliteAvailable, openSqlite, sqliteDb } from './sqlite';
import type {
  CollectorSession,
  Invoice,
  PaymentRecord,
  ReceiptRange,
  Subscriber,
} from '../types/models';

const useMemory = Platform.OS === 'web' || !isSqliteAvailable();

export async function initDb(): Promise<void> {
  if (!useMemory) {
    await openSqlite();
  }
}

export const localDb = {
  async setMeta(key: string, value: string): Promise<void> {
    if (useMemory) return memoryDb.setMeta(key, value);
    return sqliteDb.setMeta(key, value);
  },

  async getMeta(key: string): Promise<string | null> {
    if (useMemory) return memoryDb.getMeta(key);
    return sqliteDb.getMeta(key);
  },

  async replaceBootstrap(
    session: CollectorSession,
    subscribers: Subscriber[],
    invoices: Invoice[],
    receiptRange: ReceiptRange,
  ): Promise<void> {
    if (useMemory) {
      return memoryDb.replaceBootstrap(
        session,
        subscribers,
        invoices,
        receiptRange,
      );
    }
    return sqliteDb.replaceBootstrap(
      session,
      subscribers,
      invoices,
      receiptRange,
    );
  },

  async getSession(): Promise<CollectorSession | null> {
    if (useMemory) return memoryDb.getSession();
    return sqliteDb.getSession();
  },

  async listSubscribers(): Promise<Subscriber[]> {
    if (useMemory) return memoryDb.listSubscribers();
    return sqliteDb.listSubscribers();
  },

  async getSubscriber(id: string): Promise<Subscriber | null> {
    if (useMemory) return memoryDb.getSubscriber(id);
    return sqliteDb.getSubscriber(id);
  },

  async listInvoices(): Promise<Invoice[]> {
    if (useMemory) return memoryDb.listInvoices();
    return sqliteDb.listInvoices();
  },

  async getInvoice(id: string): Promise<Invoice | null> {
    if (useMemory) return memoryDb.getInvoice(id);
    return sqliteDb.getInvoice(id);
  },

  async getInvoiceBySubscriber(subscriberId: string): Promise<Invoice | null> {
    if (useMemory) return memoryDb.getInvoiceBySubscriber(subscriberId);
    return sqliteDb.getInvoiceBySubscriber(subscriberId);
  },

  async getReceiptRange(): Promise<ReceiptRange | null> {
    if (useMemory) return memoryDb.getReceiptRange();
    return sqliteDb.getReceiptRange();
  },

  async allocateReceiptNo(): Promise<number> {
    if (useMemory) return memoryDb.allocateReceiptNo();
    return sqliteDb.allocateReceiptNo();
  },

  async insertPayment(payment: PaymentRecord): Promise<void> {
    if (useMemory) return memoryDb.insertPayment(payment);
    return sqliteDb.insertPayment(payment);
  },

  async listPayments(): Promise<PaymentRecord[]> {
    if (useMemory) return memoryDb.listPayments();
    return sqliteDb.listPayments();
  },

  async listUnsyncedPayments(): Promise<PaymentRecord[]> {
    if (useMemory) return memoryDb.listUnsyncedPayments();
    return sqliteDb.listUnsyncedPayments();
  },

  async markPaymentsSynced(uuids: string[]): Promise<void> {
    if (useMemory) return memoryDb.markPaymentsSynced(uuids);
    return sqliteDb.markPaymentsSynced(uuids);
  },

  async getPayment(uuid: string): Promise<PaymentRecord | null> {
    if (useMemory) return memoryDb.getPayment(uuid);
    return sqliteDb.getPayment(uuid);
  },

  async paymentsTodayTotal(): Promise<number> {
    if (useMemory) return memoryDb.paymentsTodayTotal();
    return sqliteDb.paymentsTodayTotal();
  },
};
