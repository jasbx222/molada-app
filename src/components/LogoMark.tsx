import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, radius } from '../theme';

interface Props {
  size?: number;
  style?: ViewStyle;
}

export function LogoMark({ size = 48, style }: Props) {
  const icon = Math.round(size * 0.56);
  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: Math.max(10, size * 0.25),
        },
        style,
      ]}
    >
      <Svg width={icon} height={icon} viewBox="0 0 36 36" fill="none">
        <Path
          d="M20.5 6L10 19.5h7.2L15.5 30 26.5 14.8H18.8L20.5 6z"
          fill={colors.moneyBright}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.brandSoft,
    borderWidth: 1.5,
    borderColor: 'rgba(245,166,35,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
