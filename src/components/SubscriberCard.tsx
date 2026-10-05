import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { AmountText } from './AmountText';
import { StatusChip } from './StatusChip';
import { colors, fonts, radius, shadow } from '../theme';
import { addressLine, ampLine } from '../utils/format';
import type { Invoice, Subscriber } from '../types/models';

interface Props {
  subscriber: Subscriber;
  invoice: Invoice;
  focused?: boolean;
  onPress?: () => void;
  onReceive?: () => void;
}

export function SubscriberCard({
  subscriber,
  invoice,
  focused,
  onPress,
  onReceive,
}: Props) {
  const done = invoice.status === 'paid';
  const amountLabel =
    invoice.status === 'paid'
      ? 'مدفوع'
      : invoice.status === 'partial'
        ? 'الباقي'
        : 'المطلوب';
  const amount =
    invoice.status === 'paid' ? invoice.paidAmount : invoice.remaining;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`بطاقة ${subscriber.name}`}
      onPress={onPress}
      style={[styles.card, focused && styles.focus, done && styles.done]}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name}>{subscriber.name}</Text>
          <View style={styles.subRow}>
            <Text style={styles.sub}>
              {addressLine(subscriber.alley, subscriber.house)}
              {' · '}
              {ampLine(subscriber.amps, subscriber.serviceType)}
            </Text>
            <StatusChip status={invoice.status} />
          </View>
        </View>
        <View style={styles.amtBlock}>
          <Text style={styles.amtLbl}>{amountLabel}</Text>
          <AmountText
            amount={amount}
            size={done ? 24 : 28}
            color={done ? colors.muted : colors.money}
          />
        </View>
      </View>
      {focused && invoice.status !== 'paid' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`استلام من ${subscriber.name}`}
          onPress={() => {
            onReceive?.();
          }}
          style={({ pressed }) => [styles.cta, pressed && { opacity: 0.9 }]}
        >
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 3v12"
              stroke={colors.text}
              strokeWidth={2.4}
              strokeLinecap="round"
            />
            <Path
              d="M7 10l5 5 5-5"
              stroke={colors.text}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M5 21h14"
              stroke={colors.text}
              strokeWidth={2.4}
              strokeLinecap="round"
            />
          </Svg>
          <Text style={styles.ctaText}>استلام</Text>
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: 16,
    ...shadow.sm,
    gap: 4,
  },
  focus: {
    borderColor: colors.money,
    borderWidth: 2,
    ...shadow.md,
  },
  done: { opacity: 0.72 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  info: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: fonts.extraBold,
    fontSize: 17,
    color: colors.text,
    writingDirection: 'rtl',
  },
  subRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  sub: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.muted,
  },
  amtBlock: { alignItems: 'flex-start' },
  amtLbl: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    color: colors.muted,
    marginBottom: 2,
    textAlign: 'left',
  },
  cta: {
    marginTop: 12,
    height: 52,
    backgroundColor: colors.money,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadow.money,
  },
  ctaText: {
    fontFamily: fonts.extraBold,
    fontSize: 17,
    color: colors.text,
  },
});
