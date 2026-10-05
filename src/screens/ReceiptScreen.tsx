import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AmountText,
  LogoMark,
  PrimaryButton,
  ScreenHeader,
} from '../components';
import { useApp } from '../store/AppContext';
import { colors, fonts, radius, shadow, spacing } from '../theme';
import {
  ampLine,
  buildWhatsAppReceiptMessage,
  formatDateTimeAr,
  padReceiptNo,
  serviceTypeLabel,
  waMeUrl,
} from '../utils/format';
import { formatIqdWithUnit } from '../utils/money';

export function ReceiptScreen() {
  const { paymentId } = useLocalSearchParams<{ paymentId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { payments, subscribers, invoices, session, online } = useApp();

  const payment = payments.find((p) => p.uuid === paymentId);
  const subscriber = payment
    ? subscribers.find((s) => s.id === payment.subscriberId)
    : undefined;
  const invoice = payment
    ? invoices.find((i) => i.id === payment.invoiceId)
    : undefined;

  const statementUrl = useMemo(() => {
    if (!payment) return '';
    return `https://mowallada.app/r/${payment.statementToken}`;
  }, [payment]);

  const message = useMemo(() => {
    if (!payment || !subscriber || !invoice || !session) return '';
    return buildWhatsAppReceiptMessage({
      generatorName: session.generatorName,
      receiptNo: padReceiptNo(payment.receiptNo),
      subscriberName: subscriber.name,
      cycleLabel: session.cycleLabel,
      amps: invoice.amps,
      serviceType: serviceTypeLabel(invoice.serviceType),
      ampPrice: invoice.ampPrice,
      officialAmpPrice: invoice.officialAmpPrice,
      totalDue: invoice.totalDue,
      paid: payment.amount,
      remaining: invoice.remaining,
      collectorName: payment.collectorName,
      createdAt: formatDateTimeAr(payment.createdAt),
      statementUrl,
    });
  }, [payment, subscriber, invoice, session, statementUrl]);

  const onWhatsApp = async () => {
    if (!subscriber) return;
    const url = waMeUrl(subscriber.phone, message);
    const can = await Linking.canOpenURL(url);
    if (!can && Platform.OS !== 'web') {
      Alert.alert('واتساب', 'تعذر فتح واتساب على هذا الجهاز');
      return;
    }
    await Linking.openURL(url);
  };

  const onPrint = () => {
    Alert.alert(
      'طباعة',
      'سيتم ربط الطابعة الحرارية بلوتوث في مرحلة لاحقة. رقم الوصل جاهز للطباعة.',
    );
  };

  if (!payment || !subscriber || !invoice || !session) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="الوصل" online={online} showBack />
        <Text style={styles.missing}>الوصل غير موجود</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <ScreenHeader title="تأكيد الوصل" online={online} />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.card}>
          <View style={styles.top}>
            <View style={styles.brandRow}>
              <LogoMark size={44} />
              <View style={{ flex: 1 }}>
                <Text style={styles.gen}>مولّدة {session.generatorName}</Text>
                <Text style={styles.genSub}>بغداد · وصل جباية</Text>
              </View>
            </View>
            <Text style={styles.rcTitle}>تأكيد استلام دفعة اشتراك</Text>
            <View style={styles.rcNo}>
              <Text style={styles.rcNoText}>
                رقم الوصل {padReceiptNo(payment.receiptNo)}
              </Text>
            </View>
          </View>

          <View style={styles.rows}>
            <Row k="المشترك" v={subscriber.name} />
            <Row k="الشهر" v={session.cycleLabel} />
            <Row
              k="الأمبيرات"
              v={`${invoice.amps} · ${serviceTypeLabel(invoice.serviceType)}`}
            />
            <Row
              k="سعر الأمبير"
              v={formatIqdWithUnit(invoice.ampPrice)}
              money
            />
          </View>

          <View style={styles.official}>
            <View>
              <Text style={styles.offL}>السعر الرسمي للمحافظة</Text>
              <Text style={styles.offB}>مطابق للقرار</Text>
            </View>
            <AmountText
              amount={invoice.officialAmpPrice}
              size={20}
              color={colors.moneyDark}
            />
          </View>

          <View style={styles.moneyBlock}>
            <View style={styles.mRow}>
              <Text style={styles.mK}>المطلوب</Text>
              <AmountText amount={invoice.totalDue} size={18} color={colors.white} />
            </View>
            <View style={styles.mRow}>
              <Text style={styles.mK}>المدفوع</Text>
              <AmountText
                amount={payment.amount}
                size={28}
                color={colors.moneyBright}
              />
            </View>
            <View style={styles.mRow}>
              <Text style={styles.mK}>الباقي</Text>
              <AmountText amount={invoice.remaining} size={18} color={colors.white} />
            </View>
          </View>

          <View style={styles.foot}>
            <View style={styles.line}>
              <Text style={styles.lineK}>الجابي</Text>
              <Text style={styles.lineV}>{payment.collectorName}</Text>
            </View>
            <View style={styles.line}>
              <Text style={styles.lineK}>الوقت</Text>
              <Text style={styles.lineV}>
                {formatDateTimeAr(payment.createdAt)}
              </Text>
            </View>
            <View style={styles.link}>
              <Text style={styles.linkText}>
                كشف الحساب · mowallada.app/r/{payment.statementToken.slice(0, 8)}…
              </Text>
            </View>
          </View>
        </View>

        <PrimaryButton
          label="مشاركة واتساب"
          onPress={onWhatsApp}
          height={72}
        />
        <PrimaryButton
          label="طباعة (لاحقاً)"
          variant="ghost"
          onPress={onPrint}
          height={56}
          style={{ marginTop: 10 }}
        />
        <PrimaryButton
          label="رجوع للقائمة"
          variant="brand"
          onPress={() => router.replace('/(collector)')}
          height={56}
          style={{ marginTop: 10 }}
        />
      </ScrollView>
    </View>
  );
}

function Row({
  k,
  v,
  money,
}: {
  k: string;
  v: string;
  money?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowK}>{k}</Text>
      <Text style={[styles.rowV, money && { color: colors.moneyDark }]}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 16, paddingBottom: 32, gap: 14 },
  missing: {
    marginTop: 40,
    textAlign: 'center',
    fontFamily: fonts.semiBold,
    color: colors.muted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadow.md,
  },
  top: {
    backgroundColor: colors.brand,
    padding: 18,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  gen: {
    fontFamily: fonts.extraBold,
    fontSize: 18,
    color: colors.white,
    textAlign: 'right',
  },
  genSub: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  rcTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'right',
  },
  rcNo: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  rcNoText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.moneyBright,
  },
  rows: { paddingHorizontal: 18, paddingTop: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE3',
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
  },
  official: {
    margin: 14,
    backgroundColor: colors.bg,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offL: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.muted,
  },
  offB: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.brand,
    marginTop: 2,
  },
  moneyBlock: {
    marginHorizontal: 14,
    marginBottom: 12,
    backgroundColor: colors.brandSoft,
    borderWidth: 1.5,
    borderColor: 'rgba(245,166,35,0.3)',
    borderRadius: radius.md,
    padding: 14,
  },
  mRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  mK: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  foot: { paddingHorizontal: 18, paddingBottom: 16, gap: 8 },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lineK: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
  lineV: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.text,
  },
  link: {
    marginTop: 6,
    backgroundColor: colors.successSoft,
    borderRadius: 10,
    padding: 12,
  },
  linkText: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.brand,
    textAlign: 'right',
  },
});
