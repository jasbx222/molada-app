import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { OfflinePill } from './OfflinePill';
import { colors, fonts, radius } from '../theme';

interface Props {
  title: string;
  online?: boolean;
  showBack?: boolean;
  right?: React.ReactNode;
  children?: React.ReactNode;
}

export function ScreenHeader({
  title,
  online,
  showBack = true,
  right,
  children,
}: Props) {
  const router = useRouter();
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="رجوع"
            onPress={() => router.back()}
            style={styles.back}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 6l6 6-6 6"
                stroke="#fff"
                strokeWidth={2.2}
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        ) : (
          <View style={{ width: 44 }} />
        )}
        <Text style={styles.title}>{title}</Text>
        {right ?? <OfflinePill online={online} />}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.brand,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  back: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: fonts.extraBold,
    fontSize: 20,
    color: colors.white,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
