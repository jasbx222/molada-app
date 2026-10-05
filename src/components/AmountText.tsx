import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { colors, fonts } from '../theme';
import { formatIqd, formatIqdWithUnit } from '../utils/money';

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
  style,
}: Props) {
  if (!showUnit) {
    return (
      <Text
        style={[styles.amt, { fontSize: size, color, lineHeight: size * 1.15 }, style]}
      >
        {formatIqd(amount)}
      </Text>
    );
  }

  return (
    <Text
      style={[styles.amt, { fontSize: size, color, lineHeight: size * 1.15 }, style]}
    >
      {formatIqdWithUnit(amount)}
    </Text>
  );
}

const styles = StyleSheet.create({
  amt: {
    fontFamily: fonts.extraBold,
    // Keep the whole "15,000 د.ع" run as one LTR unit inside RTL layouts
    writingDirection: 'ltr',
  },
});
