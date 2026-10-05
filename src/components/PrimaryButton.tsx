import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { colors, fonts, radius, shadow, tapMin } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  variant?: 'money' | 'ghost' | 'brand';
  height?: number;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  style,
  variant = 'money',
  height = 72,
}: Props) {
  const isGhost = variant === 'ghost';
  const isBrand = variant === 'brand';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { height: Math.max(height, tapMin * 0.85) },
        isGhost && styles.ghost,
        isBrand && styles.brand,
        !isGhost && !isBrand && styles.money,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && { opacity: 0.9 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isGhost ? colors.muted : colors.text} />
      ) : (
        <Text
          style={[
            styles.label,
            isGhost && styles.labelGhost,
            isBrand && styles.labelBrand,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  money: {
    backgroundColor: colors.money,
    ...shadow.money,
  },
  brand: {
    backgroundColor: colors.brand,
  },
  ghost: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  disabled: { opacity: 0.5 },
  label: {
    fontFamily: fonts.extraBold,
    fontSize: 18,
    color: colors.text,
  },
  labelGhost: {
    color: colors.muted,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
  labelBrand: {
    color: colors.white,
  },
});
