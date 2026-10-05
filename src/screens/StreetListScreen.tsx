import React, { useMemo } from 'react';
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
import { colors, fonts, radius, shadow } from '../theme';
import { normalizeArabic, subscriberSearchText } from '../utils/arabic';

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
    subscribers,
    invoices,
  } = useApp();

  const countFor = (key: ListFilter): number => {
    if (key === 'all') return totals.totalCount;
    if (key === 'unpaid') return totals.unpaidCount;
    if (key === 'partial') return totals.partialCount;
    return totals.paidCount;
  };

  const filterLabel = FILTERS.find((f) => f.key === filter)?.label ?? '';

  /** Results if we ignored the active status filter but kept the search. */
  const searchHitsAllFilters = useMemo(() => {
    if (!search.trim() || filter === 'all') return filteredList.length;
    // Recompute lightly via totals path: count matching search across all
    const q = normalizeArabic(search);
    return subscribers.filter((s) => {
      const inv = invoices.find((i) => i.subscriberId === s.id);
      if (!inv) return false;
      return subscriberSearchText(s).includes(q);
    }).length;
  }, [search, filter, filteredList.length, subscribers, invoices]);

  const emptyInActiveFilter =
    filteredList.length === 0 &&
    !!search.trim() &&
    filter !== 'all' &&
    searchHitsAllFilters > 0;

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
              size={20}
              color={colors.moneyBright}
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
            accessibilityLabel="بحث عن مشترك"
          />
          {search.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="مسح البحث"
              onPress={() => setSearch('')}
              hitSlop={10}
              style={styles.clearBtn}
            >
              <Text style={styles.clearX}>×</Text>
            </Pressable>
          ) : null}
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
                accessibilityRole="button"
                accessibilityLabel={`فلتر ${f.label}`}
                accessibilityState={{ selected: on }}
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
            onPress={() => {
              setFocusedId(item.subscriber.id);
              router.push(`/subscriber/${item.subscriber.id}`);
            }}
            onReceive={() =>
              router.push(`/receive/${item.subscriber.id}`)
            }
          />
        )}
        ListEmptyComponent={
          emptyInActiveFilter ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.empty}>
                ماكو نتائج بفلتر «{filterLabel}»
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="ابحث بالكل"
                onPress={() => setFilter('all')}
                style={styles.searchAllBtn}
              >
                <Text style={styles.searchAllText}>ابحث بالكل</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.empty}>لا يوجد مشتركين بهذا الفلتر</Text>
          )
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
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sLbl: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 4,
    textAlign: 'right',
  },
  sVal: {
    fontFamily: fonts.extraBold,
    fontSize: 20,
    color: colors.white,
    textAlign: 'right',
  },
  tools: { paddingHorizontal: 14, paddingTop: 12, gap: 10 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    height: 52,
    ...shadow.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearX: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.muted,
    lineHeight: 22,
    marginTop: -2,
  },
  filters: { gap: 8, paddingBottom: 4, paddingEnd: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipOn: {
    backgroundColor: colors.brand,
    borderColor: colors.brand,
  },
  chipText: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.brand,
  },
  chipTextOn: { color: colors.white },
  chipN: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  chipNOff: { backgroundColor: colors.bg },
  chipNText: {
    fontFamily: fonts.bold,
    fontSize: 11,
    color: colors.white,
  },
  chipNTextOff: { color: colors.muted },
  list: { padding: 14, gap: 10, paddingBottom: 24 },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.muted,
  },
  emptyWrap: { alignItems: 'center', marginTop: 36, gap: 14 },
  searchAllBtn: {
    height: 48,
    paddingHorizontal: 22,
    borderRadius: radius.md,
    backgroundColor: colors.money,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.money,
  },
  searchAllText: {
    fontFamily: fonts.extraBold,
    fontSize: 15,
    color: colors.text,
  },
});
