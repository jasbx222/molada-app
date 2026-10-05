export type ServiceType = 'golden' | 'night' | 'normal';
export type InvoiceStatus = 'unpaid' | 'partial' | 'paid';
export type PaymentMethod = 'cash';

export interface CollectorSession {
  token: string;
  collectorId: string;
  collectorName: string;
  phone: string;
  generatorId: string;
  generatorName: string;
  zoneId: string;
  zoneName: string;
  cycleLabel: string;
  cycleMonth: string;
}

export interface Subscriber {
  id: string;
  name: string;
  phone: string;
  alley: string;
  house: string;
  cableNo: string;
  amps: number;
  serviceType: ServiceType;
  zoneId: string;
}

export interface Invoice {
  id: string;
  subscriberId: string;
  cycleMonth: string;
  amps: number;
  serviceType: ServiceType;
  ampPrice: number;
  officialAmpPrice: number;
  invoiceAmount: number;
  carriedDebt: number;
  discount: number;
  totalDue: number;
  paidAmount: number;
  remaining: number;
  status: InvoiceStatus;
}

export interface ReceiptRange {
  from: number;
  to: number;
  next: number;
}

export interface PaymentRecord {
  uuid: string;
  invoiceId: string;
  subscriberId: string;
  amount: number;
  method: PaymentMethod;
  receiptNo: number;
  createdAt: string;
  synced: boolean;
  collectorName: string;
  statementToken: string;
}

export interface BootstrapPayload {
  session: CollectorSession;
  subscribers: Subscriber[];
  invoices: Invoice[];
  receiptRange: ReceiptRange;
  officialAmpPrice: number;
  generatorAmpPrice: number;
  bootstrappedAt: string;
}

export interface SyncPaymentPayload {
  uuid: string;
  invoiceId: string;
  subscriberId: string;
  amount: number;
  method: PaymentMethod;
  receiptNo: number;
  createdAt: string;
}

export interface SyncResult {
  accepted: string[];
  rejected: { uuid: string; reason: string }[];
  syncedAt: string;
}

export interface ShiftCloseResult {
  shiftId: string;
  systemTotal: number;
  receiptCount: number;
  fullCount: number;
  partialCount: number;
  remainingOnLine: number;
  status: 'pending_handover' | 'closed';
  closedAt: string;
}

export interface DayTotals {
  collectedToday: number;
  unpaidCount: number;
  paidCount: number;
  partialCount: number;
  totalCount: number;
  receiptCount: number;
  fullCount: number;
  partialPaymentCount: number;
  averageReceipt: number;
  remainingOnLine: number;
}

export type ServiceTypeLabel = Record<ServiceType, string>;

export const SERVICE_TYPE_AR: ServiceTypeLabel = {
  golden: 'ذهبي',
  night: 'ليلي',
  normal: 'عادي',
};
