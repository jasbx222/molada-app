import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../theme';
import { AmountText } from './AmountText';

interface Props {
  value: number;
  onChange: (n: number) => void;
  max?: number;
  error?: string | null;
}

/** Phone-style rows: 1 is always on the LEFT (LTR), even when the app is RTL. */
const ROWS: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['000', '0', 'del'],
];

export function AmountPad({ value, onChange, error }: Props) {
  const push = (key: string) => {
    if (key === 'del') {
      onChange(Math.floor(value / 10));
      return;
    }
    const nextStr = `${value === 0 ? '' : String(value)}${key}`;
    let next = parseInt(nextStr, 10);
    if (Number.isNaN(next)) next = 0;
    if (next > 99_999_999) return;
    onChange(next);
  };

  return (
    <View style={styles.wrap}>
      <View style={[styles.display, error ? styles.displayError : null]}>
        <AmountText amount={value} size={32} />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.grid}>
        {ROWS.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((k) => (
              <Pressable
                key={k}
                accessibilityRole="button"
                accessibilityLabel={k === 'del' ? 'حذف' : k}
                onPress={() => push(k)}
                style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
              >
                <Text style={styles.keyText}>{k === 'del' ? 'حذف' : k}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  display: {
    height: 72,
    borderWidth: 2.5,
    borderColor: colors.money,
    borderRadius: radius.lg,
    backgroundColor: '#FFFBF3',
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  displayError: {
    borderColor: colors.danger,
  },
  error: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.danger,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  grid: {
    gap: 8,
    direction: 'ltr',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    direction: 'ltr',
  },
  key: {
    flex: 1,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: { backgroundColor: colors.moneySoft },
  keyText: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.brand,
  },
});
