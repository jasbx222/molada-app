import React from 'react';
import { Text, StyleSheet, TextStyle, Platform } from 'react-native';
import { colors, fonts } from '../theme';
import { formatIqd } from '../utils/money';

interface Props {
  amount: number;
  size?: number;
  color?: string;
  showUnit?: boolean;
  style?: TextStyle;
}

/**
 * One LTR text run: "15,000 د.ع" (number, NBSP, unit).
 * Avoids flex/RTL reorder and leading-space collapse on web.
 */
export function AmountText({
  amount,
  size = 28,
  color = colors.money,
  showUnit = true,
  style,
}: Props) {
  const text = showUnit
    ? `${formatIqd(amount)}\u00A0د.ع`
    : formatIqd(amount);

  return (
    <Text
      allowFontScaling={false}
      style={[
        styles.amt,
        {
          fontSize: size,
          color,
          lineHeight: Math.round(size * 1.25),
        },
        Platform.OS === 'web'
          ? ({
              // CSS for RN Web — keep number-then-unit order under dir=rtl
              direction: 'ltr',
              unicodeBidi: 'isolate',
            } as TextStyle)
          : null,
        style,
      ]}
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  amt: {
    fontFamily: fonts.extraBold,
    writingDirection: 'ltr',
    textAlign: 'left',
  },
});
