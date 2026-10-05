import React from 'react';
import { Tabs } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { colors, fonts } from '../../src/theme';
import { useApp } from '../../src/store/AppContext';

function TabIcon({
  name,
  color,
}: {
  name: 'list' | 'queue' | 'eod';
  color: string;
}) {
  if (name === 'list') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M4 6h16M4 12h16M4 18h10" stroke={color} strokeWidth={2} strokeLinecap="round" />
      </Svg>
    );
  }
  if (name === 'queue') {
    return (
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path d="M4 7h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Path d="M12 12v3" stroke={color} strokeWidth={2} strokeLinecap="round" />
        <Circle cx="12" cy="17" r="0.8" fill={color} />
      </Svg>
    );
  }
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M9 11l3 3L22 4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function CollectorTabs() {
  const { unsyncedCount } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontFamily: fonts.semiBold,
          fontSize: 12,
        },
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
          borderTopColor: colors.border,
          borderTopWidth: 1.5,
          backgroundColor: colors.surface,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'القائمة',
          tabBarIcon: ({ color }) => <TabIcon name="list" color={String(color)} />,
        }}
      />
      <Tabs.Screen
        name="queue"
        options={{
          title: 'الطابور',
          tabBarIcon: ({ color }) => (
            <View>
              <TabIcon name="queue" color={String(color)} />
              {unsyncedCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unsyncedCount > 9 ? '9+' : unsyncedCount}
                  </Text>
                </View>
              ) : null}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="eod"
        options={{
          title: 'إنهاء اليوم',
          tabBarIcon: ({ color }) => <TabIcon name="eod" color={String(color)} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
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
  },
});
