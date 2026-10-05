import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../theme';
import { AmountText } from './AmountText';

interface Props {
  value: number;
  onChange: (n: number) => void;
  max?: number;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', 'del'] as const;

export function AmountPad({ value, onChange, max }: Props) {
  const push = (key: (typeof KEYS)[number]) => {
    if (key === 'del') {
      onChange(Math.floor(value / 10));
      return;
    }
    const nextStr = `${value === 0 ? '' : String(value)}${key}`;
    let next = parseInt(nextStr, 10);
    if (Number.isNaN(next)) next = 0;
    if (max !== undefined && next > max) next = max;
    if (next > 99_999_999) return;
    onChange(next);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.display}>
        <AmountText amount={value} size={32} />
      </View>
      <View style={styles.grid}>
        {KEYS.map((k) => (
          <Pressable
            key={k}
            onPress={() => push(k)}
            style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
          >
            <Text style={styles.keyText}>{k === 'del' ? 'حذف' : k}</Text>
          </Pressable>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  key: {
    width: '31.5%',
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
