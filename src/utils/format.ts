import { formatIqdWithUnit } from './money';
import { SERVICE_TYPE_AR, ServiceType } from '../types/models';

export function serviceTypeLabel(type: ServiceType): string {
  return SERVICE_TYPE_AR[type];
}

export function addressLine(alley: string, house: string): string {
  return `زقاق ${alley} · دار ${house}`;
}

export function ampLine(amps: number, type: ServiceType): string {
  return `${amps} أمبير ${serviceTypeLabel(type)}`;
}

export function padReceiptNo(n: number): string {
  return String(n).padStart(4, '0');
}

export function formatDateTimeAr(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${day} ${hh}:${mm}`;
}

export function buildWhatsAppReceiptMessage(params: {
  generatorName: string;
  receiptNo: string;
  subscriberName: string;
  cycleLabel: string;
  amps: number;
  serviceType: string;
  ampPrice: number;
  officialAmpPrice: number;
  totalDue: number;
  paid: number;
  remaining: number;
  collectorName: string;
  createdAt: string;
  statementUrl: string;
}): string {
  const lines = [
    `*مولّدة ${params.generatorName}* — وصل جباية`,
    `رقم الوصل: ${params.receiptNo}`,
    `المشترك: ${params.subscriberName}`,
    `الشهر: ${params.cycleLabel}`,
    `الأمبيرات: ${params.amps} · ${params.serviceType}`,
    `سعر الأمبير: ${formatIqdWithUnit(params.ampPrice)}`,
    `السعر الرسمي: ${formatIqdWithUnit(params.officialAmpPrice)} (مطابق للقرار)`,
    `المطلوب: ${formatIqdWithUnit(params.totalDue)}`,
    `المدفوع: ${formatIqdWithUnit(params.paid)}`,
    `الباقي: ${formatIqdWithUnit(params.remaining)}`,
    `الجابي: ${params.collectorName}`,
    `الوقت: ${params.createdAt}`,
    `كشف الحساب: ${params.statementUrl}`,
  ];
  return lines.join('\n');
}

export function waMeUrl(phone: string, text: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  const normalized = digits.startsWith('964')
    ? digits
    : digits.startsWith('0')
      ? `964${digits.slice(1)}`
      : `964${digits}`;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
}
