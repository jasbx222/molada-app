import React from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import {
  AmountText,
  LogoMark,
  OfflinePill,
  SubscriberCard,
} from '../components';
import { useApp, ListFilter } from '../store/AppContext';
import { colors, fonts, radius, shadow, spacing } from '../theme';

const FILTERS: { key: ListFilter; label: string }[] = [
  { key: 'unpaid', label: 'مطلوب' },
  { key: 'all', label: 'الكل' },
  { key: 'partial', label: 'جزئي' },
  { key: 'paid', label: 'مدفوع' },
];

export function StreetListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    session,
    online,
    filter,
    setFilter,
    search,
    setSearch,
    filteredList,
    focusedId,
    setFocusedId,
    totals,
  } = useApp();

  const countFor = (key: ListFilter): number => {
    if (key === 'all') return totals.totalCount;
    if (key === 'unpaid') return totals.unpaidCount;
    if (key === 'partial') return totals.partialCount;
    return totals.paidCount;
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.hdr}>
        <View style={styles.hdrRow}>
          <LogoMark size={48} />
          <View style={styles.hdrMeta}>
            <Text style={styles.hdrTitle}>
              {session?.zoneName ?? 'الخط'} · الجابي{' '}
              {session?.collectorName?.split(' ')[0] ?? ''}
            </Text>
            <Text style={styles.hdrSub}>
              {session?.cycleLabel ?? ''} · دورة مفتوحة
            </Text>
          </View>
          <OfflinePill online={online} />
        </View>
        <View style={styles.summary}>
          <View style={[styles.sCard, { flex: 1.4 }]}>
            <Text style={styles.sLbl}>مستلم اليوم</Text>
            <AmountText
              amount={totals.collectedToday}
              size={22}
              color={colors.moneyBright}
              showUnit={false}
            />
          </View>
          <View style={styles.sCard}>
            <Text style={styles.sLbl}>متبقي</Text>
            <Text style={styles.sVal}>{totals.remainingOnLine}</Text>
          </View>
          <View style={styles.sCard}>
            <Text style={styles.sLbl}>مدفوع</Text>
            <Text style={styles.sVal}>{totals.paidCount}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tools}>
        <View style={styles.search}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Circle
              cx="11"
              cy="11"
              r="7"
              stroke={colors.muted}
              strokeWidth={2}
            />
            <Path
              d="M21 21l-4.3-4.3"
              stroke={colors.muted}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="اسم · دار · كيبل"
            placeholderTextColor={colors.muted}
            textAlign="right"
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {FILTERS.map((f) => {
            const on = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>
                  {f.label}
                </Text>
                <View style={[styles.chipN, !on && styles.chipNOff]}>
                  <Text style={[styles.chipNText, !on && styles.chipNTextOff]}>
                    {countFor(f.key)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.subscriber.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <SubscriberCard
            subscriber={item.subscriber}
            invoice={item.invoice}
            focused={focusedId === item.subscriber.id}
            onPress={() => setFocusedId(item.subscriber.id)}
            onReceive={() =>
              router.push(`/receive/${item.subscriber.id}`)
            }
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>لا يوجد مشتركين بهذا الفلتر</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  hdr: {
    backgroundColor: colors.brand,
    paddingHorizontal: 18,
    paddingBottom: 18,
    paddingTop: 8,
  },
  hdrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  hdrMeta: { flex: 1, minWidth: 0 },
  hdrTitle: {
    fontFamily: fonts.extraBold,
    fontSize: 17,
    color: colors.white,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  hdrSub: {
    marginTop: 2,
    fontFamily: fonts.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'right',
  },
  summary: { flexDirection: 'row', gap: 8 },
  sCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  sLbl: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
    textAlign: 'right',
  },
  sVal: {
    fontFamily: fonts.extraBold,
    fontSize: 20,
    color: colors.white,
    textAlign: 'right',
  },
  tools: { paddingHorizontal: 16, paddingTop: 14 },
  search: {
    height: 52,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    ...shadow.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.text,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingRight: 4,
  },
  chip: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipOn: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.muted,
  },
  chipTextOn: { color: colors.white },
  chipN: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  chipNOff: { backgroundColor: '#F0EBE3' },
  chipNText: {
    fontFamily: fonts.extraBold,
    fontSize: 11,
    color: colors.white,
  },
  chipNTextOff: { color: colors.brand },
  list: { padding: 16, gap: 10, paddingBottom: 24 },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontFamily: fonts.semiBold,
    color: colors.muted,
  },
});
