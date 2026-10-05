import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import {
  AmountPad,
  AmountText,
  PrimaryButton,
  ScreenHeader,
} from '../components';
import { useApp } from '../store/AppContext';
import { colors, fonts, radius, shadow, spacing } from '../theme';
import { addressLine, ampLine, padReceiptNo } from '../utils/format';
import { formatIqd, formatIqdWithUnit } from '../utils/money';
import { localDb } from '../db';

type Mode = 'full' | 'partial';

export function ReceivePaymentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getInvoiceFor, subscribers, receivePayment, online } =
    useApp();
  const subscriber = subscribers.find((s) => s.id === id);
  const invoice = id ? getInvoiceFor(id) : undefined;

  const [mode, setMode] = useState<Mode>('full');
  const [amount, setAmount] = useState(invoice?.remaining ?? 0);
  const [loading, setLoading] = useState(false);
  const [quick, setQuick] = useState<'full' | 'half' | 'quarter' | null>(
    'full',
  );
  const [nextReceipt, setNextReceipt] = useState<number | null>(null);

  React.useEffect(() => {
    if (invoice) {
      setAmount(invoice.remaining);
      setMode('full');
      setQuick('full');
    }
    localDb.getReceiptRange().then((r) => {
      if (r) setNextReceipt(r.next);
    });
  }, [invoice?.id, invoice?.remaining]);

  const due = invoice?.remaining ?? 0;

  const applyQuick = (q: 'full' | 'half' | 'quarter') => {
    setQuick(q);
    if (q === 'full') {
      setMode('full');
      setAmount(due);
    } else if (q === 'half') {
      setMode('partial');
      setAmount(Math.floor(due / 2 / 250) * 250 || Math.floor(due / 2));
    } else {
      setMode('partial');
      setAmount(Math.floor(due / 4 / 250) * 250 || Math.floor(due / 4));
    }
  };

  const selectMode = (m: Mode) => {
    setMode(m);
    if (m === 'full') {
      setAmount(due);
      setQuick('full');
    } else {
      setQuick(null);
    }
  };

  const onConfirm = async () => {
    if (!subscriber || !invoice) return;
    if (amount <= 0) {
      Alert.alert('تنبيه', 'أدخل مبلغاً صحيحاً');
      return;
    }
    setLoading(true);
    try {
      const payment = await receivePayment(subscriber.id, amount);
      router.replace(`/receipt/${payment.uuid}`);
    } catch (e) {
      Alert.alert('خطأ', e instanceof Error ? e.message : 'فشل الحفظ');
    } finally {
      setLoading(false);
    }
  };

  if (!subscriber || !invoice) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="استلام كاش" online={online} />
        <Text style={styles.missing}>المشترك غير موجود</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <ScreenHeader title="استلام كاش" online={online} />
      <ScrollView
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.who}>
          <View style={styles.av}>
            <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
              <Circle
                cx="12"
                cy="8"
                r="4"
                stroke={colors.moneyBright}
                strokeWidth={1.8}
              />
              <Path
                d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"
                stroke={colors.moneyBright}
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{subscriber.name}</Text>
            <Text style={styles.meta}>
              {addressLine(subscriber.alley, subscriber.house)}
              {' · '}
              {ampLine(subscriber.amps, subscriber.serviceType)}
              {nextReceipt
                ? ` · وصل #${padReceiptNo(nextReceipt)}`
                : ''}
            </Text>
          </View>
        </View>

        <View style={styles.dueCard}>
          <Text style={styles.dueLbl}>المطلوب الآن</Text>
          <AmountText amount={due} size={44} />
          <Text style={styles.detailLine}>
            فاتورة {formatIqd(invoice.invoiceAmount)} · دين{' '}
            {formatIqd(invoice.carriedDebt)} · مدفوع{' '}
            {formatIqd(invoice.paidAmount)}
          </Text>
          <Text style={styles.official}>
            السعر الرسمي: {formatIqdWithUnit(invoice.officialAmpPrice)} / أمبير
          </Text>
        </View>

        <View style={styles.mode}>
          <Pressable
            onPress={() => selectMode('full')}
            style={[styles.modeBtn, mode === 'full' && styles.modeOn]}
          >
            {mode === 'full' ? (
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M20 6L9 17l-5-5"
                  stroke={colors.moneyBright}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
              </Svg>
            ) : null}
            <Text
              style={[styles.modeText, mode === 'full' && styles.modeTextOn]}
            >
              استلام كامل
            </Text>
          </Pressable>
          <Pressable
            onPress={() => selectMode('partial')}
            style={[styles.modeBtn, mode === 'partial' && styles.modeOn]}
          >
            <Text
              style={[
                styles.modeText,
                mode === 'partial' && styles.modeTextOn,
              ]}
            >
              استلام جزئي
            </Text>
          </Pressable>
        </View>

        <View style={styles.entry}>
          <Text style={styles.entryLbl}>المبلغ المستلم</Text>
          {mode === 'partial' ? (
            <AmountPad value={amount} onChange={setAmount} max={due} />
          ) : (
            <View style={styles.field}>
              <Text style={styles.fieldNum}>{formatIqdWithUnit(amount)}</Text>
            </View>
          )}
          <View style={styles.quick}>
            {(
              [
                ['full', 'كامل'],
                ['half', 'نصف'],
                ['quarter', 'ربع'],
              ] as const
            ).map(([k, label]) => (
              <Pressable
                key={k}
                onPress={() => applyQuick(k)}
                style={[styles.q, quick === k && styles.qOn]}
              >
                <Text style={[styles.qText, quick === k && styles.qTextOn]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {mode === 'partial' ? (
          <View style={styles.note}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Circle
                cx="12"
                cy="12"
                r="9"
                stroke={colors.moneyDark}
                strokeWidth={2}
              />
              <Path
                d="M12 8v5M12 16h.01"
                stroke={colors.moneyDark}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
            <Text style={styles.noteText}>
              للجزئي: عدّل المبلغ من اللوحة. الكامل يحفظ بالمبلغ المطلوب كاملاً.
            </Text>
          </View>
        ) : (
          <View style={styles.note}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Circle
                cx="12"
                cy="12"
                r="9"
                stroke={colors.moneyDark}
                strokeWidth={2}
              />
              <Path
                d="M12 8v5M12 16h.01"
                stroke={colors.moneyDark}
                strokeWidth={2}
                strokeLinecap="round"
              />
            </Svg>
            <Text style={styles.noteText}>
              للجزئي: اضغط «استلام جزئي» ثم عدّل المبلغ. الكامل يحفظ فوراً بدون
              لوحة أرقام.
            </Text>
          </View>
        )}

      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <PrimaryButton
          label={`تأكيد استلام ${formatIqdWithUnit(amount)}`}
          onPress={onConfirm}
          loading={loading}
          height={64}
        />
        <PrimaryButton
          label="إلغاء"
          variant="ghost"
          onPress={() => router.back()}
          height={48}
          style={{ marginTop: 8 }}
        />
        <Text style={styles.hint}>يُحفظ محلياً ويُزامن عند عودة النت</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  body: { padding: 18, paddingBottom: 32, gap: 16 },
  missing: {
    marginTop: 40,
    textAlign: 'center',
    fontFamily: fonts.semiBold,
    color: colors.muted,
  },
  who: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  av: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.brand,
    borderWidth: 1.5,
    borderColor: 'rgba(245,166,35,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: fonts.extraBold,
    fontSize: 20,
    color: colors.text,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  meta: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'right',
  },
  dueCard: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    padding: 22,
    alignItems: 'center',
    ...shadow.sm,
  },
  dueLbl: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.muted,
    marginBottom: 8,
  },
  detailLine: {
    marginTop: 12,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
    writingDirection: 'rtl',
    lineHeight: 20,
  },
  official: {
    marginTop: 8,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.brandSoft,
    textAlign: 'center',
  },
  mode: { flexDirection: 'row', gap: 10 },
  modeBtn: {
    flex: 1,
    height: 64,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modeOn: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  modeText: {
    fontFamily: fonts.extraBold,
    fontSize: 16,
    color: colors.muted,
  },
  modeTextOn: { color: colors.white },
  entry: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.xxl,
    padding: 18,
    ...shadow.sm,
  },
  entryLbl: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 10,
    textAlign: 'right',
  },
  field: {
    height: 72,
    borderWidth: 2.5,
    borderColor: colors.money,
    borderRadius: radius.lg,
    backgroundColor: '#FFFBF3',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldNum: {
    fontFamily: fonts.extraBold,
    fontSize: 32,
    color: colors.money,
    writingDirection: 'ltr',
  },
  quick: { flexDirection: 'row', gap: 8, marginTop: 14 },
  q: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qOn: {
    backgroundColor: colors.moneySoft,
    borderColor: colors.money,
  },
  qText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.brand,
  },
  qTextOn: { color: colors.moneyDark },
  note: {
    backgroundColor: colors.moneySoft,
    borderWidth: 1.5,
    borderColor: '#F5D9A0',
    borderRadius: radius.md,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#8A5A10',
    lineHeight: 20,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  hint: {
    marginTop: 12,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
});
