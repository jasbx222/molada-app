import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../theme';
import type { InvoiceStatus } from '../types/models';

const LABELS: Record<InvoiceStatus, string> = {
  unpaid: 'مطلوب',
  partial: 'جزئي',
  paid: 'مدفوع',
};

export function StatusChip({ status }: { status: InvoiceStatus }) {
  return (
    <View style={[styles.base, styles[status]]}>
      <Text style={[styles.text, styles[`text_${status}` as const]]}>
        {LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 28,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unpaid: { backgroundColor: colors.moneySoft },
  partial: { backgroundColor: '#F0EBE3' },
  paid: { backgroundColor: colors.successSoft },
  text: { fontFamily: fonts.bold, fontSize: 12 },
  text_unpaid: { color: colors.moneyDark },
  text_partial: { color: colors.brandSoft },
  text_paid: { color: colors.brand },
});
