import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, fonts } from '../../src/theme';
import { useApp } from '../../src/store/AppContext';

const TAB_CONTENT_H = 64;
const MIN_BOTTOM_PAD = 16;

function TabIcon({
  name,
  color,
}: {
  name: 'list' | 'queue' | 'eod';
  color: string;
}) {
  if (name === 'list') {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 6h16M4 12h16M4 18h10"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  if (name === 'queue') {
    return (
      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
        <Path
          d="M4 7h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Path
          d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Path
          d="M12 12v3"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Circle cx="12" cy="17" r="0.8" fill={color} />
      </Svg>
    );
  }
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 11l3 3L22 4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Icon + label in one block — default label slot collapses to ~4px on web. */
function TabItem({
  name,
  color,
  label,
  badge,
}: {
  name: 'list' | 'queue' | 'eod';
  color: string;
  label: string;
  badge?: number;
}) {
  return (
    <View style={styles.item}>
      <View>
        <TabIcon name={name} color={color} />
        {badge && badge > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText} allowFontScaling={false}>
              {badge > 9 ? '9+' : badge}
            </Text>
          </View>
        ) : null}
      </View>
      <Text
        numberOfLines={1}
        allowFontScaling={false}
        style={[styles.label, { color }]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function CollectorTabs() {
  const { unsyncedCount } = useApp();
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, MIN_BOTTOM_PAD);

  return (
    <Tabs
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarAllowFontScaling: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: {
          height: TAB_CONTENT_H,
          paddingTop: 0,
          paddingBottom: 0,
        },
        tabBarStyle: {
          height: TAB_CONTENT_H + bottomPad,
          paddingBottom: bottomPad,
          paddingTop: 0,
          borderTopColor: colors.border,
          borderTopWidth: 1.5,
          backgroundColor: colors.surface,
          overflow: 'visible',
          ...(Platform.OS === 'web' ? ({ zIndex: 10 } as object) : null),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'القائمة',
          tabBarIcon: ({ color }) => (
            <TabItem name="list" color={String(color)} label="القائمة" />
          ),
        }}
      />
      <Tabs.Screen
        name="queue"
        options={{
          title: 'الطابور',
          tabBarIcon: ({ color }) => (
            <TabItem
              name="queue"
              color={String(color)}
              label="الطابور"
              badge={unsyncedCount}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="eod"
        options={{
          title: 'إنهاء اليوم',
          tabBarIcon: ({ color }) => (
            <TabItem name="eod" color={String(color)} label="إنهاء اليوم" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  item: {
    height: TAB_CONTENT_H,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    lineHeight: 16,
    includeFontPadding: false,
    textAlign: 'center',
    marginTop: 4,
    // Ensure Cairo dots/descenders stay inside the item box
    paddingBottom: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    left: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.money,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    color: colors.text,
    includeFontPadding: false,
    lineHeight: 12,
  },
});
