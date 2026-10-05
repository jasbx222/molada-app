import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '../api';
import { localDb, initDb } from '../db';
import { newUuid } from '../utils/uuid';
import { normalizeArabic, subscriberSearchText } from '../utils/arabic';
import type {
  CollectorSession,
  DayTotals,
  Invoice,
  PaymentRecord,
  Subscriber,
} from '../types/models';

export type ListFilter = 'unpaid' | 'all' | 'partial' | 'paid';

interface AppState {
  ready: boolean;
  online: boolean;
  session: CollectorSession | null;
  subscribers: Subscriber[];
  invoices: Invoice[];
  payments: PaymentRecord[];
  focusedId: string | null;
  filter: ListFilter;
  search: string;
  lastSyncAt: string | null;
  shiftRequested: boolean;
}

interface AppActions {
  setOnline: (v: boolean) => void;
  setFilter: (f: ListFilter) => void;
  setSearch: (q: string) => void;
  setFocusedId: (id: string | null) => void;
  login: (phone: string, pin: string) => Promise<void>;
  bootstrap: () => Promise<void>;
  refreshLocal: () => Promise<void>;
  receivePayment: (
    subscriberId: string,
    amount: number,
  ) => Promise<PaymentRecord>;
  syncQueue: () => Promise<{ synced: number }>;
  closeShift: () => Promise<void>;
  logout: () => Promise<void>;
  getInvoiceFor: (subscriberId: string) => Invoice | undefined;
  totals: DayTotals;
  filteredList: Array<{ subscriber: Subscriber; invoice: Invoice }>;
  unsyncedCount: number;
}

const AppContext = createContext<(AppState & AppActions) | null>(null);

function computeTotals(
  invoices: Invoice[],
  payments: PaymentRecord[],
): DayTotals {
  const today = new Date().toISOString().slice(0, 10);
  const todayPayments = payments.filter((p) => p.createdAt.startsWith(today));
  const collectedToday = todayPayments.reduce((s, p) => s + p.amount, 0);
  const unpaidCount = invoices.filter((i) => i.status === 'unpaid').length;
  const paidCount = invoices.filter((i) => i.status === 'paid').length;
  const partialCount = invoices.filter((i) => i.status === 'partial').length;
  const receiptCount = todayPayments.length;
  const fullCount = todayPayments.filter((p) => {
    const inv = invoices.find((i) => i.id === p.invoiceId);
    return inv ? p.amount >= inv.totalDue || inv.status === 'paid' : false;
  }).length;
  const partialPaymentCount = receiptCount - fullCount;
  return {
    collectedToday,
    unpaidCount,
    paidCount,
    partialCount,
    totalCount: invoices.length,
    receiptCount,
    fullCount,
    partialPaymentCount,
    averageReceipt:
      receiptCount === 0 ? 0 : Math.round(collectedToday / receiptCount),
    remainingOnLine: unpaidCount + partialCount,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [online, setOnline] = useState(false);
  const [session, setSession] = useState<CollectorSession | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ListFilter>('unpaid');
  const [search, setSearch] = useState('');
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [shiftRequested, setShiftRequested] = useState(false);

  const refreshLocal = useCallback(async () => {
    const [sess, subs, invs, pays, syncAt] = await Promise.all([
      localDb.getSession(),
      localDb.listSubscribers(),
      localDb.listInvoices(),
      localDb.listPayments(),
      localDb.getMeta('lastSyncAt'),
    ]);
    setSession(sess);
    setSubscribers(subs);
    setInvoices(invs);
    setPayments(pays);
    setLastSyncAt(syncAt);
    if (!focusedId && subs.length > 0) {
      const unpaid = invs.find((i) => i.status === 'unpaid');
      setFocusedId(unpaid?.subscriberId ?? subs[0].id);
    }
  }, [focusedId]);

  useEffect(() => {
    (async () => {
      await initDb();
      await refreshLocal();
      setReady(true);
    })().catch((err) => {
      console.warn('init failed', err);
      setReady(true);
    });
  }, [refreshLocal]);

  const login = useCallback(async (phone: string, pin: string) => {
    const deviceId = (await localDb.getMeta('deviceId')) ?? newUuid();
    await localDb.setMeta('deviceId', deviceId);
    const res = await api.login({ phone, pin, deviceId });
    await localDb.setMeta('session', JSON.stringify(res.session));
    setSession(res.session);
  }, []);

  const bootstrap = useCallback(async () => {
    const sess = session ?? (await localDb.getSession());
    if (!sess) throw new Error('يجب تسجيل الدخول أولاً');
    const payload = await api.bootstrap(sess.token);
    await localDb.replaceBootstrap(
      payload.session,
      payload.subscribers,
      payload.invoices,
      payload.receiptRange,
    );
    await localDb.setMeta('bootstrappedAt', payload.bootstrappedAt);
    await localDb.setMeta('lastSyncAt', payload.bootstrappedAt);
    setLastSyncAt(payload.bootstrappedAt);
    setSession(payload.session);
    setSubscribers(payload.subscribers);
    setInvoices(payload.invoices);
    const pays = await localDb.listPayments();
    setPayments(pays);
    const unpaid = payload.invoices.find((i) => i.status === 'unpaid');
    setFocusedId(unpaid?.subscriberId ?? payload.subscribers[0]?.id ?? null);
  }, [session]);

  const receivePayment = useCallback(
    async (subscriberId: string, amount: number): Promise<PaymentRecord> => {
      if (amount <= 0) throw new Error('المبلغ يجب أن يكون أكبر من صفر');
      const inv = invoices.find((i) => i.subscriberId === subscriberId);
      const sess = session ?? (await localDb.getSession());
      if (!inv || !sess) throw new Error('بيانات الفاتورة غير متوفرة');
      if (amount > inv.remaining) {
        throw new Error('المبلغ أكبر من المطلوب');
      }
      const receiptNo = await localDb.allocateReceiptNo();
      const uuid = newUuid();
      const payment: PaymentRecord = {
        uuid,
        invoiceId: inv.id,
        subscriberId,
        amount: Math.trunc(amount),
        method: 'cash',
        receiptNo,
        createdAt: new Date().toISOString(),
        synced: false,
        collectorName: sess.collectorName,
        // Same id as the payment/receipt record — one source of truth for statement URL
        statementToken: uuid,
      };
      await localDb.insertPayment(payment);
      await refreshLocal();
      return payment;
    },
    [invoices, session, refreshLocal],
  );

  const syncQueue = useCallback(async () => {
    const sess = session ?? (await localDb.getSession());
    if (!sess) throw new Error('يجب تسجيل الدخول أولاً');
    const pending = await localDb.listUnsyncedPayments();
    if (pending.length === 0) {
      const now = new Date().toISOString();
      await localDb.setMeta('lastSyncAt', now);
      setLastSyncAt(now);
      return { synced: 0 };
    }
    const result = await api.sync(
      sess.token,
      pending.map((p) => ({
        uuid: p.uuid,
        invoiceId: p.invoiceId,
        subscriberId: p.subscriberId,
        amount: p.amount,
        method: p.method,
        receiptNo: p.receiptNo,
        createdAt: p.createdAt,
      })),
    );
    await localDb.markPaymentsSynced(result.accepted);
    await localDb.setMeta('lastSyncAt', result.syncedAt);
    setLastSyncAt(result.syncedAt);
    setOnline(true);
    await refreshLocal();
    return { synced: result.accepted.length };
  }, [session, refreshLocal]);

  const closeShift = useCallback(async () => {
    const sess = session ?? (await localDb.getSession());
    if (!sess) throw new Error('يجب تسجيل الدخول أولاً');
    await syncQueue();
    const totals = computeTotals(
      await localDb.listInvoices(),
      await localDb.listPayments(),
    );
    await api.closeShift(sess.token, totals.collectedToday);
    setShiftRequested(true);
    await localDb.setMeta('shiftRequestedAt', new Date().toISOString());
  }, [session, syncQueue]);

  const logout = useCallback(async () => {
    setSession(null);
    setSubscribers([]);
    setInvoices([]);
    setPayments([]);
    setFocusedId(null);
    setShiftRequested(false);
  }, []);

  const getInvoiceFor = useCallback(
    (subscriberId: string) =>
      invoices.find((i) => i.subscriberId === subscriberId),
    [invoices],
  );

  const totals = useMemo(
    () => computeTotals(invoices, payments),
    [invoices, payments],
  );

  const filteredList = useMemo(() => {
    const q = normalizeArabic(search);
    const rows = subscribers
      .map((subscriber) => {
        const invoice = invoices.find((i) => i.subscriberId === subscriber.id);
        if (!invoice) return null;
        return { subscriber, invoice };
      })
      .filter((r): r is { subscriber: Subscriber; invoice: Invoice } => !!r)
      .filter(({ subscriber, invoice }) => {
        if (filter === 'unpaid' && invoice.status !== 'unpaid') return false;
        if (filter === 'partial' && invoice.status !== 'partial') return false;
        if (filter === 'paid' && invoice.status !== 'paid') return false;
        if (!q) return true;
        return subscriberSearchText(subscriber).includes(q);
      });

    // Stable order: زقاق (numeric) → دار (numeric) → name
    rows.sort((a, b) => {
      const alleyA = parseInt(a.subscriber.alley, 10) || 0;
      const alleyB = parseInt(b.subscriber.alley, 10) || 0;
      if (alleyA !== alleyB) return alleyA - alleyB;
      const houseA = parseInt(a.subscriber.house, 10) || 0;
      const houseB = parseInt(b.subscriber.house, 10) || 0;
      if (houseA !== houseB) return houseA - houseB;
      return a.subscriber.name.localeCompare(b.subscriber.name, 'ar');
    });
    return rows;
  }, [subscribers, invoices, filter, search]);

  const unsyncedCount = useMemo(
    () => payments.filter((p) => !p.synced).length,
    [payments],
  );

  const value = useMemo(
    () => ({
      ready,
      online,
      session,
      subscribers,
      invoices,
      payments,
      focusedId,
      filter,
      search,
      lastSyncAt,
      shiftRequested,
      setOnline,
      setFilter,
      setSearch,
      setFocusedId,
      login,
      bootstrap,
      refreshLocal,
      receivePayment,
      syncQueue,
      closeShift,
      logout,
      getInvoiceFor,
      totals,
      filteredList,
      unsyncedCount,
    }),
    [
      ready,
      online,
      session,
      subscribers,
      invoices,
      payments,
      focusedId,
      filter,
      search,
      lastSyncAt,
      shiftRequested,
      login,
      bootstrap,
      refreshLocal,
      receivePayment,
      syncQueue,
      closeShift,
      logout,
      getInvoiceFor,
      totals,
      filteredList,
      unsyncedCount,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState & AppActions {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
