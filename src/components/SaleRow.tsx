import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../utils/theme';

const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(Math.round(n || 0));

interface Props {
  sale: {
    id: number;
    quantity_gb: number;
    total_price: number;
    sale_date: string;
    seller_name?: string;
    package_name?: string;
    commission_amount?: number;
  };
}

export default function SaleRow({ sale }: Props) {
  const date = new Date(sale.sale_date).toLocaleDateString('fa-IR');
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.price}>{fmt(sale.total_price)} ؋</Text>
        <Text style={styles.meta}>{date}</Text>
      </View>
      <View style={styles.right}>
        {sale.package_name && <Text style={styles.pkg}>{sale.package_name}</Text>}
        <Text style={styles.meta}>{sale.quantity_gb} GB {sale.seller_name ? `• ${sale.seller_name}` : ''}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  left: { alignItems: 'flex-start' },
  right: { alignItems: 'flex-end', flex: 1 },
  price: { fontSize: 14, fontWeight: '700', color: colors.success },
  pkg: { fontSize: 13, fontWeight: '600', color: colors.textPrimary },
  meta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
