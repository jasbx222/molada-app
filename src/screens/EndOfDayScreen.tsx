import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { AmountText, PrimaryButton, ScreenHeader } from '../components';
import { useApp } from '../store/AppContext';
import { colors, fonts, radius, shadow, spacing } from '../theme';
import { formatIqd } from '../utils/money';

export function EndOfDayScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    session,
    online,
    totals,
    unsyncedCount,
    lastSyncAt,
    closeShift,
    shiftRequested,
    syncQueue,
  } = useApp();
  const [loading, setLoading] = useState(false);
  const [syncedOk, setSyncedOk] = useState(unsyncedCount === 0);

  const onRequestHandover = async () => {
    setLoading(true);
    try {
      if (unsyncedCount > 0) {
        await syncQueue();
      }
      setSyncedOk(true);
      await closeShift();
      Alert.alert(
        'طلب التسليم',
        'تم إرسال طلب تسليم الوردية. بانتظار المالك لتأكيد المبلغ الفعلي.',
      );
    } catch (e) {
      Alert.alert('خطأ', e instanceof Error ? e.message : 'فشل إنهاء اليوم');
    } finally {
      setLoading(false);
    }
  };

  const dateLabel = (() => {
    const d = new Date();
    return `${d.getDate()} ت1 ${d.getFullYear()}`;
  })();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topbar}>
        <ScreenHeader
          title="إنهاء اليوم"
          online={online}
          showBack={false}
          right={<Text style={styles.date}>{dateLabel}</Text>}
        />
        <View style={styles.heroWrap}>
          <Text style={styles.heroLbl}>مجموع النظام · مستلم اليوم</Text>
          <AmountText
            amount={totals.collectedToday}
            size={48}
            color={colors.moneyBright}
          />
          <Text style={styles.heroSub}>
            {session?.zoneName ?? ''} · الجابي{' '}
            {session?.collectorName?.split(' ')[0] ?? ''}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statL}>عدد الوصولات</Text>
            <Text style={styles.statV}>{totals.receiptCount}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statL}>كامل / جزئي</Text>
            <Text style={[styles.statV, { fontSize: 22 }]}>
              {totals.fullCount} · {totals.partialPaymentCount}
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statL}>متوسط الوصل</Text>
            <AmountText
              amount={totals.averageReceipt}
              size={22}
              showUnit={false}
            />
          </View>
          <View style={styles.stat}>
            <Text style={styles.statL}>متبقي بالخط</Text>
            <Text style={styles.statV}>{totals.remainingOnLine}</Text>
          </View>
        </View>

        <View style={[styles.sync, !syncedOk && unsyncedCount > 0 && styles.syncWarn]}>
          <View style={styles.syncIco}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M20 6L9 17l-5-5"
                stroke={colors.brand}
                strokeWidth={2.2}
                strokeLinecap="round"
              />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.syncTitle}>
              {unsyncedCount === 0
                ? 'كل الدفعات متزامنة'
                : `${unsyncedCount} دفعة بانتظار المزامنة`}
            </Text>
            <Text style={styles.syncSub}>
              {unsyncedCount === 0
                ? 'جاهز للتسليم'
                : 'سيتم فرض المزامنة قبل طلب التسليم'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHdr}>
            <Text style={styles.sectionTitle}>مطابقة الكاش</Text>
            <Text style={styles.sectionMuted}>قبل التسليم</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowK}>مجموع النظام</Text>
            <Text style={styles.rowBig}>{formatIqd(totals.collectedToday)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowK}>يسلّمه الجابي (يدوياً)</Text>
            <Text style={styles.rowMuted}>— ينتظر المالك</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowK}>الفرق</Text>
            <Text style={styles.rowWarn}>يُحسب بعد التسليم</Text>
          </View>
        </View>

        <View style={styles.handoff}>
          <Text style={styles.handoffTitle}>خطوات التسليم</Text>
          <Text style={styles.handoffP}>
            سلّم الكاش لصاحب المولدة أو المحاسب، ثم ينتظر تأكيد المبلغ الفعلي من
            اللوحة.
          </Text>
          <View style={styles.steps}>
            {[
              `زامن كل الدفعات${unsyncedCount === 0 ? ' (تم)' : ''}`,
              'اطلب تسليم الوردية',
              'المالك يكتب المبلغ الفعلي',
            ].map((label, i) => (
              <View key={label} style={styles.step}>
                <View style={styles.stepN}>
                  <Text style={styles.stepNText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
      <View style={styles.footerActions}>
        <PrimaryButton
          label={
            shiftRequested
              ? 'تم طلب التسليم — بانتظار المالك'
              : 'طلب تسليم الوردية'
          }
          onPress={onRequestHandover}
          loading={loading}
          disabled={shiftRequested}
          height={64}
        />
        <PrimaryButton
          label="رجوع للقائمة"
          variant="ghost"
          onPress={() => router.replace('/(collector)')}
          height={48}
          style={{ marginTop: 8 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topbar: { backgroundColor: colors.brand },
  date: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
  },
  heroWrap: {
    alignItems: 'center',
    paddingBottom: 22,
    paddingTop: 4,
  },
  heroLbl: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 8,
  },
  heroSub: {
    marginTop: 8,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  body: { padding: 16, paddingBottom: 40, gap: 12 },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stat: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 14,
    ...shadow.sm,
  },
  statL: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.muted,
    marginBottom: 6,
    textAlign: 'right',
  },
  statV: {
    fontFamily: fonts.extraBold,
    fontSize: 26,
    color: colors.brand,
    textAlign: 'right',
  },
  sync: {
    backgroundColor: colors.successSoft,
    borderWidth: 1.5,
    borderColor: colors.successBorder,
    borderRadius: radius.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  syncWarn: {
    backgroundColor: colors.moneySoft,
    borderColor: '#F5D9A0',
  },
  syncIco: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 15,
    color: colors.brand,
    textAlign: 'right',
  },
  syncSub: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.brandSoft,
    textAlign: 'right',
    marginTop: 2,
  },
  section: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 16,
    ...shadow.sm,
  },
  sectionHdr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 15,
    color: colors.text,
  },
  sectionMuted: {
    fontFamily: fonts.semiBold,
    fontSize: 12,
    color: colors.muted,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0EBE3',
  },
  rowK: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.muted,
  },
  rowBig: {
    fontFamily: fonts.extraBold,
    fontSize: 22,
    color: colors.money,
    writingDirection: 'ltr',
  },
  rowMuted: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.muted,
  },
  rowWarn: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.moneyDark,
  },
  handoff: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.brand,
    borderRadius: radius.xl,
    padding: 16,
    ...shadow.sm,
  },
  handoffTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
    marginBottom: 4,
  },
  handoffP: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
    lineHeight: 20,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginBottom: 14,
  },
  steps: { gap: 8 },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
  },
  stepN: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNText: {
    fontFamily: fonts.extraBold,
    fontSize: 14,
    color: colors.moneyBright,
  },
  stepText: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  footerActions: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerHint: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.muted,
  },
});
