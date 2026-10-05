import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { colors, fonts } from '../theme';
import { formatIqd } from '../utils/money';

interface Props {
  amount: number;
  size?: number;
  color?: string;
  showUnit?: boolean;
  unitSize?: number;
  style?: TextStyle;
}

export function AmountText({
  amount,
  size = 28,
  color = colors.money,
  showUnit = true,
  unitSize,
  style,
}: Props) {
  return (
    <Text style={[styles.amt, { fontSize: size, color, lineHeight: size * 1.1 }, style]}>
      {formatIqd(amount)}
      {showUnit ? (
        <Text
          style={{
            fontSize: unitSize ?? Math.max(12, size * 0.4),
            color: colors.muted,
            fontFamily: fonts.semiBold,
          }}
        >
          {' '}
          د.ع
        </Text>
      ) : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  amt: {
    fontFamily: fonts.extraBold,
    writingDirection: 'ltr',
  },
});
