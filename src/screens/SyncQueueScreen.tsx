import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AmountText, PrimaryButton, ScreenHeader } from '../components';
import { useApp } from '../store/AppContext';
import { colors, fonts, radius, shadow, spacing } from '../theme';
import { formatDateTimeAr, padReceiptNo } from '../utils/format';

export function SyncQueueScreen() {
  const insets = useSafeAreaInsets();
  const { payments, subscribers, online, syncQueue, unsyncedCount, lastSyncAt } =
    useApp();
  const [loading, setLoading] = useState(false);

  const pending = payments.filter((p) => !p.synced);
  const synced = payments.filter((p) => p.synced);

  const onSync = async () => {
    setLoading(true);
    try {
      const res = await syncQueue();
      Alert.alert(
        'المزامنة',
        res.synced === 0
          ? 'لا توجد دفعات معلّقة'
          : `تمت مزامنة ${res.synced} دفعة`,
      );
    } catch (e) {
      Alert.alert('خطأ', e instanceof Error ? e.message : 'فشلت المزامنة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScreenHeader title="طابور المزامنة" online={online} showBack={false} />
      <View style={styles.summary}>
        <View style={styles.stat}>
          <Text style={styles.statL}>معلّق</Text>
          <Text style={[styles.statV, { color: colors.money }]}>
            {unsyncedCount}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statL}>متزامن</Text>
          <Text style={styles.statV}>{synced.length}</Text>
        </View>
        <View style={[styles.stat, { flex: 1.4 }]}>
          <Text style={styles.statL}>آخر مزامنة</Text>
          <Text style={styles.statSmall}>
            {lastSyncAt ? formatDateTimeAr(lastSyncAt) : '—'}
          </Text>
        </View>
      </View>

      <FlatList
        data={[...pending, ...synced]}
        keyExtractor={(item) => item.uuid}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.section}>
            {pending.length > 0 ? 'دفعات بانتظار الإرسال' : 'كل الدفعات متزامنة'}
          </Text>
        }
        renderItem={({ item }) => {
          const sub = subscribers.find((s) => s.id === item.subscriberId);
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.name}>{sub?.name ?? item.subscriberId}</Text>
                <View
                  style={[
                    styles.badge,
                    item.synced ? styles.badgeOk : styles.badgeWait,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      item.synced ? styles.badgeOkText : styles.badgeWaitText,
                    ]}
                  >
                    {item.synced ? 'متزامن' : 'معلّق'}
                  </Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.meta}>
                  وصل #{padReceiptNo(item.receiptNo)} ·{' '}
                  {formatDateTimeAr(item.createdAt)}
                </Text>
                <AmountText amount={item.amount} size={20} />
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>لا توجد دفعات بعد</Text>
        }
      />

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <PrimaryButton
          label={unsyncedCount > 0 ? `مزامنة ${unsyncedCount} دفعة` : 'مزامنة الآن'}
          onPress={onSync}
          loading={loading}
          height={64}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  summary: {
    flexDirection: 'row',
    gap: 8,
    padding: 16,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 12,
    ...shadow.sm,
  },
  statL: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.muted,
    marginBottom: 4,
    textAlign: 'right',
  },
  statV: {
    fontFamily: fonts.extraBold,
    fontSize: 24,
    color: colors.brand,
    textAlign: 'right',
  },
  statSmall: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: colors.brand,
    textAlign: 'right',
  },
  list: { paddingHorizontal: 16, paddingBottom: 100, gap: 10 },
  section: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.muted,
    marginBottom: 8,
    textAlign: 'right',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 14,
    ...shadow.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontFamily: fonts.extraBold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'right',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  badgeWait: { backgroundColor: colors.moneySoft },
  badgeOk: { backgroundColor: colors.successSoft },
  badgeText: { fontFamily: fonts.bold, fontSize: 12 },
  badgeWaitText: { color: colors.moneyDark },
  badgeOkText: { color: colors.brand },
  cardBottom: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontFamily: fonts.semiBold,
    color: colors.muted,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: colors.bg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
