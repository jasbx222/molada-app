import React from 'react';
import { Text, View, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { colors, fonts } from '../theme';
import { formatIqd } from '../utils/money';

interface Props {
  amount: number;
  size?: number;
  color?: string;
  showUnit?: boolean;
  unitSize?: number;
  style?: TextStyle;
  containerStyle?: ViewStyle;
}

/** Always renders as "15,000 د.ع" via an LTR row (number then unit). */
export function AmountText({
  amount,
  size = 28,
  color = colors.money,
  showUnit = true,
  unitSize,
  style,
  containerStyle,
}: Props) {
  return (
    <View style={[styles.row, containerStyle]}>
      <Text
        style={[
          styles.amt,
          { fontSize: size, color, lineHeight: size * 1.2 },
          style,
        ]}
      >
        {formatIqd(amount)}
      </Text>
      {showUnit ? (
        <Text
          style={[
            styles.unit,
            {
              fontSize: unitSize ?? Math.max(12, Math.round(size * 0.4)),
              lineHeight: size * 1.2,
            },
          ]}
        >
          {' '}
          د.ع
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    direction: 'ltr',
    alignItems: 'baseline',
  },
  amt: {
    fontFamily: fonts.extraBold,
  },
  unit: {
    fontFamily: fonts.semiBold,
    color: colors.muted,
  },
});
