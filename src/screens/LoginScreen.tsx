import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LogoMark, PrimaryButton } from '../components';
import { useApp } from '../store/AppContext';
import { colors, fonts, radius, shadow, spacing } from '../theme';
import { MOCK_PHONE, MOCK_PIN } from '../api';

export function LoginScreen() {
  const router = useRouter();
  const { login } = useApp();
  const [phone, setPhone] = useState(MOCK_PHONE);
  const [pin, setPin] = useState(MOCK_PIN);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(phone.trim(), pin.trim());
      router.replace('/bootstrap');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'فشل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <LogoMark size={72} />
          <Text style={styles.brand}>مولّدة</Text>
          <Text style={styles.sub}>تطبيق الجابي · إدارة الجباية أوفلاين</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>رقم الهاتف</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            textAlign="right"
            placeholder="07xxxxxxxxx"
            placeholderTextColor={colors.muted}
            autoCorrect={false}
          />
          <Text style={[styles.label, { marginTop: 16 }]}>رمز الدخول (PIN)</Text>
          <TextInput
            style={styles.input}
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={6}
            textAlign="center"
            placeholder="••••"
            placeholderTextColor={colors.muted}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton
            label="دخول"
            onPress={onSubmit}
            loading={loading}
            style={{ marginTop: 24 }}
          />
          <Text style={styles.hint}>
            تجريبي: {MOCK_PHONE} / PIN {MOCK_PIN}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.brand },
  content: {
    flexGrow: 1,
    padding: spacing.xxl,
    justifyContent: 'center',
  },
  hero: { alignItems: 'center', marginBottom: 36 },
  brand: {
    marginTop: 16,
    fontFamily: fonts.extraBold,
    fontSize: 36,
    color: colors.white,
  },
  sub: {
    marginTop: 6,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: 24,
    ...shadow.md,
  },
  label: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.muted,
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.text,
    backgroundColor: colors.bg,
  },
  error: {
    marginTop: 12,
    color: colors.danger,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    textAlign: 'center',
  },
  hint: {
    marginTop: 16,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
});
