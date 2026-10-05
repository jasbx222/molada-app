import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AmountText,
  PrimaryButton,
  ScreenHeader,
  StatusChip,
} from '../components';
import { useApp } from '../store/AppContext';
import { colors, fonts, radius, shadow } from '../theme';
import { addressLine, ampLine, formatDateTimeAr, padReceiptNo } from '../utils/format';
import { formatIqd, formatIqdWithUnit } from '../utils/money';

export function SubscriberDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { subscribers, getInvoiceFor, payments, online } = useApp();
  const subscriber = subscribers.find((s) => s.id === id);
  const invoice = id ? getInvoiceFor(id) : undefined;

  const history = useMemo(() => {
    if (!id) return [];
    return payments
      .filter((p) => p.subscriberId === id)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }, [payments, id]);

  if (!subscriber || !invoice) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="بطاقة المشترك" online={online} />
        <Text style={styles.missing}>المشترك غير موجود</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <ScreenHeader title="بطاقة المشترك" online={online} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.card}>
          <View style={styles.head}>
            <Text style={styles.name}>{subscriber.name}</Text>
            <StatusChip status={invoice.status} />
          </View>
          <Text style={styles.meta}>
            {addressLine(subscriber.alley, subscriber.house)}
          </Text>
          <Text style={styles.meta}>
            {ampLine(subscriber.amps, subscriber.serviceType)} · كيبل{' '}
            {subscriber.cableNo}
          </Text>
          <Text style={styles.meta}>هاتف: {subscriber.phone}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>الفاتورة الحالية</Text>
          <Row k="فاتورة الشهر" v={formatIqd(invoice.invoiceAmount)} />
          <Row k="دين مرحّل" v={formatIqd(invoice.carriedDebt)} />
          <Row k="خصم" v={formatIqd(invoice.discount)} />
          <Row k="المطلوب الكلي" v={formatIqd(invoice.totalDue)} highlight />
          <Row k="مدفوع" v={formatIqd(invoice.paidAmount)} />
          <Row k="الباقي" v={formatIqd(invoice.remaining)} highlight />
          <Row
            k="السعر الرسمي"
            v={formatIqdWithUnit(invoice.officialAmpPrice)}
          />
        </View>

        <View style={styles.due}>
          <Text style={styles.dueLbl}>المطلوب الآن</Text>
          <AmountText amount={invoice.remaining} size={44} />
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>آخر الدفعات</Text>
          {history.length === 0 ? (
            <Text style={styles.emptyHist}>لا توجد دفعات بعد</Text>
          ) : (
            history.map((p) => (
              <View key={p.uuid} style={styles.histRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.histNo}>
                    وصل #{padReceiptNo(p.receiptNo)}
                  </Text>
                  <ClientTime iso={p.createdAt} />
                </View>
                <AmountText amount={p.amount} size={18} />
              </View>
            ))
          )}
        </View>

        {invoice.status !== 'paid' ? (
          <PrimaryButton
            label="استلام"
            onPress={() => router.push(`/receive/${subscriber.id}`)}
            height={72}
          />
        ) : null}
        <PrimaryButton
          label="رجوع"
          variant="ghost"
          onPress={() => router.back()}
          height={56}
          style={{ marginTop: 10 }}
        />
      </ScrollView>
    </View>
  );
}

/** Avoid hydration mismatch: format date only after mount. */
function ClientTime({ iso }: { iso: string }) {
  const [label, setLabel] = React.useState('');
  React.useEffect(() => {
    setLabel(formatDateTimeAr(iso));
  }, [iso]);
  return <Text style={styles.histTime}>{label || '—'}</Text>;
}

function Row({
  k,
  v,
  highlight,
}: {
  k: string;
  v: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowK}>{k}</Text>
      <Text style={[styles.rowV, highlight && { color: colors.money }]}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 16, gap: 12, paddingBottom: 32 },
  missing: {
    marginTop: 40,
    textAlign: 'center',
    fontFamily: fonts.semiBold,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 16,
    ...shadow.sm,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontFamily: fonts.extraBold,
    fontSize: 22,
    color: colors.text,
    textAlign: 'right',
    flex: 1,
  },
  meta: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'right',
    marginTop: 4,
  },
  section: {
    fontFamily: fonts.extraBold,
    fontSize: 15,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'right',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0EBE3',
  },
  rowK: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.muted,
  },
  rowV: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
    writingDirection: 'ltr',
  },
  due: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 20,
    alignItems: 'center',
    ...shadow.sm,
  },
  dueLbl: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 6,
  },
  emptyHist: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    paddingVertical: 8,
  },
  histRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0EBE3',
    gap: 12,
  },
  histNo: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
    textAlign: 'right',
  },
  histTime: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'right',
  },
});
