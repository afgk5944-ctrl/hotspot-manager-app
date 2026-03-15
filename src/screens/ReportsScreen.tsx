import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  TouchableOpacity, ActivityIndicator, TextInput,
} from 'react-native';
import { useApi } from '../api/useApi';
import { colors, commonStyles } from '../utils/theme';
import StatCard from '../components/StatCard';

const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(Math.round(n || 0));

function getDate(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export default function ReportsScreen() {
  const api = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [from, setFrom] = useState(getDate(-30));
  const [to, setTo] = useState(getDate(0));
  const [sellers, setSellers] = useState<any[]>([]);

  const load = useCallback(async () => {
    try {
      const d = await api.getReports(from, to) as any;
      setData(d);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, [from, to]);

  useEffect(() => {
    load();
    api.getSellers().then((d: any) => setSellers(d.sellers || []));
  }, []);

  const onRefresh = () => { setRefreshing(true); load(); };
  const handleFilter = () => { setLoading(true); load(); };

  if (loading) return (
    <View style={commonStyles.center}>
      <ActivityIndicator size="large" color={colors.brand} />
    </View>
  );

  const s = data?.summary || {};

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand]} />}
    >
      {/* Date Filter */}
      <View style={styles.filterCard}>
        <Text style={styles.filterTitle}>📅 بازه زمانی</Text>
        <View style={styles.filterRow}>
          <View style={styles.filterInput}>
            <Text style={styles.filterLabel}>از</Text>
            <TextInput
              style={styles.dateInput}
              value={from}
              onChangeText={setFrom}
              placeholder="YYYY-MM-DD"
            />
          </View>
          <View style={styles.filterInput}>
            <Text style={styles.filterLabel}>تا</Text>
            <TextInput
              style={styles.dateInput}
              value={to}
              onChangeText={setTo}
              placeholder="YYYY-MM-DD"
            />
          </View>
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={handleFilter}>
          <Text style={styles.filterBtnText}>اعمال فیلتر</Text>
        </TouchableOpacity>
      </View>

      {/* Quick filters */}
      <View style={styles.quickFilters}>
        {[
          { label: 'امروز', days: 0 },
          { label: '۷ روز', days: -7 },
          { label: '۳۰ روز', days: -30 },
          { label: '۹۰ روز', days: -90 },
        ].map(q => (
          <TouchableOpacity key={q.label} style={styles.quickBtn}
            onPress={() => { setFrom(getDate(q.days)); setTo(getDate(0)); setTimeout(handleFilter, 0); }}>
            <Text style={styles.quickBtnText}>{q.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <StatCard icon="📶" label="GB فروخته" value={`${fmt(s.total_gb)} GB`} color={colors.brand} />
        <StatCard icon="💰" label="مجموع فروش" value={`${fmt(s.total_gross)} ؋`} color={colors.success} />
        <StatCard icon="💳" label="کمیسیون" value={`${fmt(s.total_commission)} ؋`} color={colors.warning} />
        <StatCard icon="📊" label="سود خالص" value={`${fmt(s.net_profit)} ؋`} color={colors.info} />
      </View>

      <View style={styles.statRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>تراکنش‌ها</Text>
          <Text style={styles.statValue}>{fmt(s.total_txns)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>پرداختی</Text>
          <Text style={styles.statValue}>{fmt(s.total_payments)} ؋</Text>
        </View>
      </View>

      {/* Top sellers */}
      {data?.topSellers?.length > 0 && (
        <View style={styles.section}>
          <Text style={commonStyles.sectionTitle}>🏆 برترین فروشندگان</Text>
          {data.topSellers.map((s: any, i: number) => (
            <View key={i} style={styles.sellerRow}>
              <Text style={styles.sellerRank}>{i + 1}</Text>
              <Text style={styles.sellerName}>{s.full_name}</Text>
              <Text style={styles.sellerGb}>{fmt(s.gb)} GB</Text>
              <Text style={styles.sellerGross}>{fmt(s.gross)} ؋</Text>
            </View>
          ))}
        </View>
      )}

      {/* Package breakdown */}
      {data?.packages?.length > 0 && (
        <View style={styles.section}>
          <Text style={commonStyles.sectionTitle}>📦 فروش بر اساس پکیج</Text>
          {data.packages.map((p: any, i: number) => (
            <View key={i} style={styles.pkgRow}>
              <Text style={styles.pkgName}>{p.package_name}</Text>
              <Text style={styles.pkgGb}>{fmt(p.total_gb)} GB</Text>
              <Text style={styles.pkgGross}>{fmt(p.total_gross)} ؋</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filterCard: {
    backgroundColor: '#fff', margin: 12, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  filterTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, textAlign: 'right', marginBottom: 10 },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  filterInput: { flex: 1 },
  filterLabel: { fontSize: 12, color: colors.textMuted, textAlign: 'right', marginBottom: 4 },
  dateInput: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 8,
    padding: 8, fontSize: 13, color: colors.textPrimary, textAlign: 'right',
  },
  filterBtn: { backgroundColor: colors.brand, borderRadius: 10, padding: 10, alignItems: 'center' },
  filterBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  quickFilters: { flexDirection: 'row', paddingHorizontal: 12, gap: 8, marginBottom: 4 },
  quickBtn: {
    flex: 1, backgroundColor: '#e0e7ff', borderRadius: 8,
    padding: 8, alignItems: 'center',
  },
  quickBtnText: { fontSize: 12, fontWeight: '700', color: colors.brand },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
  statRow: {
    flexDirection: 'row', marginHorizontal: 12, gap: 10, marginBottom: 4,
  },
  statItem: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  statLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  statValue: { fontSize: 15, fontWeight: '800', color: colors.textPrimary },
  section: {
    backgroundColor: '#fff', margin: 12, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginTop: 4,
  },
  sellerRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 1, borderColor: '#f1f5f9',
  },
  sellerRank: { width: 24, fontSize: 13, fontWeight: '800', color: colors.brand },
  sellerName: { flex: 1, fontSize: 13, color: colors.textPrimary, textAlign: 'right', marginHorizontal: 8 },
  sellerGb: { fontSize: 12, color: colors.brand, fontWeight: '700', marginLeft: 8 },
  sellerGross: { fontSize: 12, color: colors.success, fontWeight: '700' },
  pkgRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8,
    borderBottomWidth: 1, borderColor: '#f1f5f9',
  },
  pkgName: { flex: 1, fontSize: 13, color: colors.textPrimary, textAlign: 'right' },
  pkgGb: { fontSize: 12, color: colors.brand, fontWeight: '700', marginLeft: 8 },
  pkgGross: { fontSize: 12, color: colors.success, fontWeight: '700' },
});
