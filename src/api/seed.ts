import { roundToNearest250 } from '../utils/money';
import type {
  BootstrapPayload,
  CollectorSession,
  Invoice,
  Subscriber,
} from '../types/models';

const SESSION: CollectorSession = {
  token: 'mock-token-ahmad-karrada',
  collectorId: 'col-001',
  collectorName: 'أحمد الكرادي',
  phone: '07701234567',
  generatorId: 'gen-karrada',
  generatorName: 'الكرادة',
  zoneId: 'zone-karrada-14',
  zoneName: 'خط الكرادة',
  cycleLabel: 'تشرين الأول 2026',
  cycleMonth: '2026-10',
};

const AMP_PRICE = 15000;
const OFFICIAL_AMP_PRICE = 15000;

type SeedRow = {
  id: string;
  name: string;
  phone: string;
  alley: string;
  house: string;
  cableNo: string;
  amps: number;
  serviceType: 'golden' | 'night' | 'normal';
  carriedDebt: number;
  paidAmount: number;
};

/** Sample Baghdad-style names and zones — fake demo data only */
const SEED_ROWS: SeedRow[] = [
  {
    id: 'sub-001',
    name: 'أبو علي الجبوري',
    phone: '07701110001',
    alley: '14',
    house: '7',
    cableNo: 'K-1407',
    amps: 10,
    serviceType: 'golden',
    carriedDebt: 25000,
    paidAmount: 0,
  },
  {
    id: 'sub-002',
    name: 'أم حسين الموسوي',
    phone: '07701110002',
    alley: '14',
    house: '12',
    cableNo: 'K-1412',
    amps: 5,
    serviceType: 'night',
    carriedDebt: 0,
    paidAmount: 0,
  },
  {
    id: 'sub-003',
    name: 'كاظم العبيدي',
    phone: '07701110003',
    alley: '15',
    house: '3',
    cableNo: 'K-1503',
    amps: 15,
    serviceType: 'golden',
    carriedDebt: 0,
    paidAmount: 135000,
  },
  {
    id: 'sub-004',
    name: 'سعد الناصري',
    phone: '07701110004',
    alley: '15',
    house: '9',
    cableNo: 'K-1509',
    amps: 10,
    serviceType: 'golden',
    carriedDebt: 0,
    paidAmount: 150000,
  },
  {
    id: 'sub-005',
    name: 'زينب الشمري',
    phone: '07701110005',
    alley: '16',
    house: '2',
    cableNo: 'K-1602',
    amps: 5,
    serviceType: 'normal',
    carriedDebt: 0,
    paidAmount: 0,
  },
  {
    id: 'sub-006',
    name: 'حسن العزاوي',
    phone: '07701110006',
    alley: '16',
    house: '8',
    cableNo: 'K-1608',
    amps: 8,
    serviceType: 'golden',
    carriedDebt: 50000,
    paidAmount: 0,
  },
  {
    id: 'sub-007',
    name: 'فاطمة الحسيني',
    phone: '07701110007',
    alley: '17',
    house: '1',
    cableNo: 'K-1701',
    amps: 5,
    serviceType: 'night',
    carriedDebt: 0,
    paidAmount: 75000,
  },
  {
    id: 'sub-008',
    name: 'محمد الدليمي',
    phone: '07701110008',
    alley: '17',
    house: '5',
    cableNo: 'K-1705',
    amps: 20,
    serviceType: 'golden',
    carriedDebt: 100000,
    paidAmount: 0,
  },
  {
    id: 'sub-009',
    name: 'نور الرافدين',
    phone: '07701110009',
    alley: '18',
    house: '4',
    cableNo: 'K-1804',
    amps: 5,
    serviceType: 'normal',
    carriedDebt: 12500,
    paidAmount: 0,
  },
  {
    id: 'sub-010',
    name: 'عبدالله الكرخي',
    phone: '07701110010',
    alley: '18',
    house: '11',
    cableNo: 'K-1811',
    amps: 10,
    serviceType: 'night',
    carriedDebt: 0,
    paidAmount: 0,
  },
  {
    id: 'sub-011',
    name: 'سارة القيسي',
    phone: '07701110011',
    alley: '14',
    house: '3',
    cableNo: 'K-1403',
    amps: 5,
    serviceType: 'golden',
    carriedDebt: 0,
    paidAmount: 37500,
  },
  {
    id: 'sub-012',
    name: 'يوسف الطائي',
    phone: '07701110012',
    alley: '15',
    house: '14',
    cableNo: 'K-1514',
    amps: 15,
    serviceType: 'normal',
    carriedDebt: 0,
    paidAmount: 225000,
  },
];

function buildInvoice(row: SeedRow): Invoice {
  const raw = row.amps * AMP_PRICE + row.carriedDebt;
  const totalDue = roundToNearest250(raw);
  const invoiceAmount = roundToNearest250(row.amps * AMP_PRICE);
  const paidAmount = row.paidAmount;
  const remaining = Math.max(0, totalDue - paidAmount);
  let status: Invoice['status'] = 'unpaid';
  if (remaining === 0 && paidAmount > 0) status = 'paid';
  else if (paidAmount > 0 && remaining > 0) status = 'partial';

  return {
    id: `inv-${row.id}`,
    subscriberId: row.id,
    cycleMonth: SESSION.cycleMonth,
    amps: row.amps,
    serviceType: row.serviceType,
    ampPrice: AMP_PRICE,
    officialAmpPrice: OFFICIAL_AMP_PRICE,
    invoiceAmount,
    carriedDebt: row.carriedDebt,
    discount: 0,
    totalDue,
    paidAmount,
    remaining,
    status,
  };
}

export function buildSeedBootstrap(): BootstrapPayload {
  const subscribers: Subscriber[] = SEED_ROWS.map((r) => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    alley: r.alley,
    house: r.house,
    cableNo: r.cableNo,
    amps: r.amps,
    serviceType: r.serviceType,
    zoneId: SESSION.zoneId,
  }));

  const invoices = SEED_ROWS.map(buildInvoice);

  return {
    session: SESSION,
    subscribers,
    invoices,
    receiptRange: { from: 800, to: 999, next: 842 },
    officialAmpPrice: OFFICIAL_AMP_PRICE,
    generatorAmpPrice: AMP_PRICE,
    bootstrappedAt: new Date().toISOString(),
  };
}

export const MOCK_PIN = '1234';
export const MOCK_PHONE = '07701234567';
