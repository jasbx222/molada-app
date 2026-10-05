import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../theme';

interface Props {
  online?: boolean;
}

export function OfflinePill({ online = false }: Props) {
  if (online) {
    return (
      <View style={[styles.pill, styles.online]}>
        <View style={[styles.dot, { backgroundColor: colors.moneyBright }]} />
        <Text style={styles.textOnline}>متصل</Text>
      </View>
    );
  }
  return (
    <View style={styles.pill}>
      <View style={styles.dot} />
      <Text style={styles.text}>بدون نت</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245,166,35,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(245,166,35,0.45)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  online: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.25)',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.money,
  },
  text: {
    color: colors.moneyBright,
    fontFamily: fonts.bold,
    fontSize: 13,
  },
  textOnline: {
    color: 'rgba(255,255,255,0.85)',
    fontFamily: fonts.bold,
    fontSize: 13,
  },
});
