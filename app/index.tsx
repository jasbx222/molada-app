import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useApp } from '../src/store/AppContext';
import { colors } from '../src/theme';

export default function Index() {
  const { ready, session, subscribers } = useApp();

  if (!ready) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator color={colors.money} size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (subscribers.length === 0) {
    return <Redirect href="/bootstrap" />;
  }

  return <Redirect href="/(collector)" />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brand,
  },
});
