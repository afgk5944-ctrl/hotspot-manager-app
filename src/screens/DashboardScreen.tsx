import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../api/useApi';
import { colors, commonStyles } from '../utils/theme';
import StatCard from '../components/StatCard';
import SaleRow from '../components/SaleRow';

export default function DashboardScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const api = useApi();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await api.getDashboard();
      setData(d);
    } catch (e) {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(Math.round(n || 0));

  if (loading) return (
    <View style={commonStyles.center}>
      <ActivityIndicator size="large" color={colors.brand} />
    </View>
  );

  const s = data?.stats || {};
  const isOwner = user?.role === 'owner';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand]} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>سلام، {user?.full_name} 👋</Text>
          <Text style={styles.subGreeting}>
            {isOwner ? 'مدیر سیستم' : 'فروشنده'} • ۳۰ روز اخیر
          </Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>خروج</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard icon="📶" label="گیگابایت فروخته" value={`${fmt(s.total_gb)} GB`} color="#4f46e5" />
        <StatCard icon="💰" label="مجموع فروش" value={`${fmt(s.total_gross)} ؋`} color="#10b981" />
        {isOwner && (
          <>
            <StatCard icon="💳" label="کمیسیون" value={`${fmt(s.total_commission)} ؋`} color="#f59e0b" />
            <StatCard icon="📊" label="سود خالص" value={`${fmt(s.total_gross - s.total_commission)} ؋`} color="#3b82f6" />
          </>
        )}
        {!isOwner && data?.debt && (
          <>
            <StatCard icon="📦" label="تخصیص کل" value={`${fmt(data.debt.total_alloc)} GB`} color="#8b5cf6" />
            <StatCard icon="✅" label="کمیسیون" value={`${fmt(s.total_commission)} ؋`} color="#f59e0b" />
          </>
        )}
      </View>

      {/* Txn count */}
      <View style={styles.txnBadge}>
        <Text style={styles.txnText}>تعداد تراکنش‌ها: <Text style={{ color: colors.brand, fontWeight: '700' }}>{s.total_txns || 0}</Text></Text>
      </View>

      {/* Top Sellers (owner) */}
      {isOwner && data?.topSellers?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 برترین فروشندگان</Text>
          {data.topSellers.map((s: any, i: number) => (
            <View key={i} style={styles.sellerRow}>
              <View style={styles.sellerRank}><Text style={styles.sellerRankText}>{i + 1}</Text></View>
              <Text style={styles.sellerName}>{s.full_name}</Text>
              <Text style={styles.sellerGb}>{fmt(s.gb)} GB</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent Sales */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📋 آخرین فروش‌ها</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Sales')}>
            <Text style={styles.seeAll}>همه →</Text>
          </TouchableOpacity>
        </View>
        {data?.recentSales?.length === 0 && (
          <Text style={styles.emptyText}>هیچ فروشی ثبت نشده</Text>
        )}
        {data?.recentSales?.map((sale: any) => (
          <SaleRow key={sale.id} sale={sale} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.brand, padding: 20, paddingTop: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  greeting: { fontSize: 18, fontWeight: '800', color: '#fff' },
  subGreeting: { fontSize: 12, color: '#c7d2fe', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 8 },
  logoutText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10 },
  txnBadge: {
    marginHorizontal: 12, padding: 10, backgroundColor: '#fff',
    borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 4,
  },
  txnText: { textAlign: 'center', color: '#64748b', fontSize: 13 },
  section: {
    backgroundColor: '#fff', marginHorizontal: 12, marginTop: 12,
    borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, elevation: 2,
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  seeAll: { fontSize: 12, color: colors.brand, fontWeight: '600' },
  sellerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderColor: '#f1f5f9' },
  sellerRank: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.brand + '20', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  sellerRankText: { fontSize: 12, fontWeight: '700', color: colors.brand },
  sellerName: { flex: 1, fontSize: 13, color: '#1e293b', textAlign: 'right' },
  sellerGb: { fontSize: 13, fontWeight: '700', color: '#10b981' },
  emptyText: { textAlign: 'center', color: '#94a3b8', fontSize: 13, padding: 20 },
});
