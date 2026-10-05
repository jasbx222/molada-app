import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LogoMark, PrimaryButton } from '../components';
import { useApp } from '../store/AppContext';
import { colors, fonts, radius, shadow, spacing } from '../theme';

export function BootstrapScreen() {
  const router = useRouter();
  const { session, bootstrap } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onRefresh = async () => {
    setError(null);
    setLoading(true);
    try {
      await bootstrap();
      setDone(true);
      router.replace('/(collector)');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل التحديث');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <LogoMark size={64} />
      <Text style={styles.title}>تحديث اليوم</Text>
      <Text style={styles.sub}>
        {session
          ? `${session.zoneName} · ${session.collectorName}`
          : 'تحميل قائمة الخط والأسعار وأرقام الوصولات'}
      </Text>

      <View style={styles.card}>
        <Text style={styles.item}>· قائمة المشتركين والفواتير</Text>
        <Text style={styles.item}>· السعر الرسمي وسعر المولدة</Text>
        <Text style={styles.item}>· نطاق أرقام الوصولات المحجوز</Text>
        <Text style={styles.item}>· الحفظ محلياً للعمل بدون نت</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {done ? (
        <Text style={styles.ok}>تم التحديث — جاري فتح القائمة</Text>
      ) : (
        <PrimaryButton
          label="تحديث الآن"
          onPress={onRefresh}
          loading={loading}
          style={{ alignSelf: 'stretch', marginTop: 24 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  title: {
    marginTop: 20,
    fontFamily: fonts.extraBold,
    fontSize: 28,
    color: colors.brand,
  },
  sub: {
    marginTop: 8,
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
  },
  card: {
    marginTop: 28,
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 20,
    gap: 10,
    ...shadow.sm,
  },
  item: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.text,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  error: {
    marginTop: 16,
    color: colors.danger,
    fontFamily: fonts.semiBold,
  },
  ok: {
    marginTop: 24,
    color: colors.brand,
    fontFamily: fonts.bold,
    fontSize: 16,
  },
});
