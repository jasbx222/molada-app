import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { SCHEMA_SQL } from './schema';
import type {
  CollectorSession,
  Invoice,
  PaymentRecord,
  ReceiptRange,
  Subscriber,
  ServiceType,
  InvoiceStatus,
} from '../types/models';

let database: SQLite.SQLiteDatabase | null = null;

export function isSqliteAvailable(): boolean {
  return Platform.OS !== 'web';
}

export async function openSqlite(): Promise<SQLite.SQLiteDatabase> {
  if (database) return database;
  database = await SQLite.openDatabaseAsync('molada_collector.db');
  await database.execAsync(SCHEMA_SQL);
  return database;
}

function mapSubscriber(row: Record<string, unknown>): Subscriber {
  return {
    id: String(row.id),
    name: String(row.name),
    phone: String(row.phone),
    alley: String(row.alley),
    house: String(row.house),
    cableNo: String(row.cable_no),
    amps: Number(row.amps),
    serviceType: row.service_type as ServiceType,
    zoneId: String(row.zone_id),
  };
}

function mapInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: String(row.id),
    subscriberId: String(row.subscriber_id),
    cycleMonth: String(row.cycle_month),
    amps: Number(row.amps),
    serviceType: row.service_type as ServiceType,
    ampPrice: Number(row.amp_price),
    officialAmpPrice: Number(row.official_amp_price),
    invoiceAmount: Number(row.invoice_amount),
    carriedDebt: Number(row.carried_debt),
    discount: Number(row.discount),
    totalDue: Number(row.total_due),
    paidAmount: Number(row.paid_amount),
    remaining: Number(row.remaining),
    status: row.status as InvoiceStatus,
  };
}

function mapPayment(row: Record<string, unknown>): PaymentRecord {
  return {
    uuid: String(row.uuid),
    invoiceId: String(row.invoice_id),
    subscriberId: String(row.subscriber_id),
    amount: Number(row.amount),
    method: 'cash',
    receiptNo: Number(row.receipt_no),
    createdAt: String(row.created_at),
    synced: Number(row.synced) === 1,
    collectorName: String(row.collector_name),
    statementToken: String(row.statement_token),
  };
}

export const sqliteDb = {
  async setMeta(key: string, value: string): Promise<void> {
    const db = await openSqlite();
    await db.runAsync(
      'INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)',
      [key, value],
    );
  },

  async getMeta(key: string): Promise<string | null> {
    const db = await openSqlite();
    const row = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM meta WHERE key = ?',
      [key],
    );
    return row?.value ?? null;
  },

  async replaceBootstrap(
    session: CollectorSession,
    subscribers: Subscriber[],
    invoices: Invoice[],
    receiptRange: ReceiptRange,
  ): Promise<void> {
    const db = await openSqlite();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        'INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)',
        ['session', JSON.stringify(session)],
      );
      await db.runAsync('DELETE FROM subscribers');
      await db.runAsync('DELETE FROM invoices');
      for (const s of subscribers) {
        await db.runAsync(
          `INSERT INTO subscribers
           (id, name, phone, alley, house, cable_no, amps, service_type, zone_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            s.id,
            s.name,
            s.phone,
            s.alley,
            s.house,
            s.cableNo,
            s.amps,
            s.serviceType,
            s.zoneId,
          ],
        );
      }
      for (const inv of invoices) {
        await db.runAsync(
          `INSERT INTO invoices
           (id, subscriber_id, cycle_month, amps, service_type, amp_price,
            official_amp_price, invoice_amount, carried_debt, discount,
            total_due, paid_amount, remaining, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            inv.id,
            inv.subscriberId,
            inv.cycleMonth,
            inv.amps,
            inv.serviceType,
            inv.ampPrice,
            inv.officialAmpPrice,
            inv.invoiceAmount,
            inv.carriedDebt,
            inv.discount,
            inv.totalDue,
            inv.paidAmount,
            inv.remaining,
            inv.status,
          ],
        );
      }
      // Re-apply local unsynced payments onto invoice balances
      const local = await db.getAllAsync<Record<string, unknown>>(
        'SELECT * FROM payments WHERE synced = 0',
      );
      for (const row of local) {
        const amount = Number(row.amount);
        const invoiceId = String(row.invoice_id);
        await db.runAsync(
          `UPDATE invoices SET
             paid_amount = paid_amount + ?,
             remaining = MAX(0, total_due - (paid_amount + ?)),
             status = CASE
               WHEN total_due - (paid_amount + ?) <= 0 THEN 'paid'
               WHEN paid_amount + ? > 0 THEN 'partial'
               ELSE 'unpaid'
             END
           WHERE id = ?`,
          [amount, amount, amount, amount, invoiceId],
        );
      }
      await db.runAsync('DELETE FROM receipt_range');
      await db.runAsync(
        `INSERT INTO receipt_range (id, range_from, range_to, next_no)
         VALUES (1, ?, ?, ?)`,
        [receiptRange.from, receiptRange.to, receiptRange.next],
      );
    });
  },

  async getSession(): Promise<CollectorSession | null> {
    const raw = await this.getMeta('session');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as CollectorSession;
    } catch {
      return null;
    }
  },

  async listSubscribers(): Promise<Subscriber[]> {
    const db = await openSqlite();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM subscribers ORDER BY alley, house',
    );
    return rows.map(mapSubscriber);
  },

  async getSubscriber(id: string): Promise<Subscriber | null> {
    const db = await openSqlite();
    const row = await db.getFirstAsync<Record<string, unknown>>(
      'SELECT * FROM subscribers WHERE id = ?',
      [id],
    );
    return row ? mapSubscriber(row) : null;
  },

  async listInvoices(): Promise<Invoice[]> {
    const db = await openSqlite();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM invoices',
    );
    return rows.map(mapInvoice);
  },

  async getInvoice(id: string): Promise<Invoice | null> {
    const db = await openSqlite();
    const row = await db.getFirstAsync<Record<string, unknown>>(
      'SELECT * FROM invoices WHERE id = ?',
      [id],
    );
    return row ? mapInvoice(row) : null;
  },

  async getInvoiceBySubscriber(subscriberId: string): Promise<Invoice | null> {
    const db = await openSqlite();
    const row = await db.getFirstAsync<Record<string, unknown>>(
      'SELECT * FROM invoices WHERE subscriber_id = ?',
      [subscriberId],
    );
    return row ? mapInvoice(row) : null;
  },

  async getReceiptRange(): Promise<ReceiptRange | null> {
    const db = await openSqlite();
    const row = await db.getFirstAsync<{
      range_from: number;
      range_to: number;
      next_no: number;
    }>('SELECT * FROM receipt_range WHERE id = 1');
    if (!row) return null;
    return { from: row.range_from, to: row.range_to, next: row.next_no };
  },

  async allocateReceiptNo(): Promise<number> {
    const db = await openSqlite();
    let allocated = 0;
    await db.withTransactionAsync(async () => {
      const row = await db.getFirstAsync<{
        range_to: number;
        next_no: number;
      }>('SELECT range_to, next_no FROM receipt_range WHERE id = 1');
      if (!row) throw new Error('لا يوجد نطاق وصولات محجوز');
      if (row.next_no > row.range_to) {
        throw new Error('انتهى نطاق أرقام الوصولات — حدّث اليوم من السيرفر');
      }
      allocated = row.next_no;
      await db.runAsync(
        'UPDATE receipt_range SET next_no = ? WHERE id = 1',
        [allocated + 1],
      );
    });
    return allocated;
  },

  async insertPayment(payment: PaymentRecord): Promise<void> {
    const db = await openSqlite();
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO payments
         (uuid, invoice_id, subscriber_id, amount, method, receipt_no,
          created_at, synced, collector_name, statement_token)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          payment.uuid,
          payment.invoiceId,
          payment.subscriberId,
          payment.amount,
          payment.method,
          payment.receiptNo,
          payment.createdAt,
          payment.synced ? 1 : 0,
          payment.collectorName,
          payment.statementToken,
        ],
      );
      await db.runAsync(
        `UPDATE invoices SET
           paid_amount = paid_amount + ?,
           remaining = MAX(0, total_due - (paid_amount + ?)),
           status = CASE
             WHEN total_due - (paid_amount + ?) <= 0 THEN 'paid'
             WHEN paid_amount + ? > 0 THEN 'partial'
             ELSE 'unpaid'
           END
         WHERE id = ?`,
        [
          payment.amount,
          payment.amount,
          payment.amount,
          payment.amount,
          payment.invoiceId,
        ],
      );
    });
  },

  async listPayments(): Promise<PaymentRecord[]> {
    const db = await openSqlite();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM payments ORDER BY created_at DESC',
    );
    return rows.map(mapPayment);
  },

  async listUnsyncedPayments(): Promise<PaymentRecord[]> {
    const db = await openSqlite();
    const rows = await db.getAllAsync<Record<string, unknown>>(
      'SELECT * FROM payments WHERE synced = 0 ORDER BY created_at ASC',
    );
    return rows.map(mapPayment);
  },

  async markPaymentsSynced(uuids: string[]): Promise<void> {
    if (uuids.length === 0) return;
    const db = await openSqlite();
    await db.withTransactionAsync(async () => {
      for (const id of uuids) {
        await db.runAsync('UPDATE payments SET synced = 1 WHERE uuid = ?', [id]);
      }
    });
  },

  async getPayment(uuid: string): Promise<PaymentRecord | null> {
    const db = await openSqlite();
    const row = await db.getFirstAsync<Record<string, unknown>>(
      'SELECT * FROM payments WHERE uuid = ?',
      [uuid],
    );
    return row ? mapPayment(row) : null;
  },

  async paymentsTodayTotal(): Promise<number> {
    const db = await openSqlite();
    const today = new Date().toISOString().slice(0, 10);
    const row = await db.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(amount), 0) as total FROM payments
       WHERE created_at LIKE ?`,
      [`${today}%`],
    );
    return row?.total ?? 0;
  },
};
