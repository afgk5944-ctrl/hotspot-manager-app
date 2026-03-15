import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../api/useApi';
import { colors } from '../utils/theme';

const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(Math.round(n || 0));

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const api = useApi();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMe().then((d: any) => {
      setProfile(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    Alert.alert('خروج', 'آیا می‌خواهید از حساب خارج شوید؟', [
      { text: 'لغو', style: 'cancel' },
      { text: 'خروج', style: 'destructive', onPress: logout },
    ]);
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.brand} />
    </View>
  );

  const isOwner = user?.role === 'owner';

  return (
    <ScrollView style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.full_name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{isOwner ? '👑 مدیر' : '🧑‍💼 فروشنده'}</Text>
        </View>
        <Text style={styles.username}>@{user?.username}</Text>
      </View>

      {/* Info cards */}
      <View style={styles.infoSection}>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>نام کاربری</Text>
            <Text style={styles.infoValue}>{user?.username}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>نقش</Text>
            <Text style={styles.infoValue}>{isOwner ? 'مدیر سیستم' : 'فروشنده'}</Text>
          </View>
          {!isOwner && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>نرخ کمیسیون</Text>
              <Text style={styles.infoValue}>{user?.commission_rate}%</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        {profile && (
          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>📊 آمار شما</Text>
            {isOwner ? (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>کل فروش</Text>
                  <Text style={styles.infoValue}>{fmt(profile.stats?.total_gross || 0)} ؋</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>GB فروخته</Text>
                  <Text style={styles.infoValue}>{fmt(profile.stats?.total_gb || 0)} GB</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>تعداد فروشنده</Text>
                  <Text style={styles.infoValue}>{profile.stats?.seller_count || 0} نفر</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>کمیسیون کل</Text>
                  <Text style={styles.infoValue}>{fmt(profile.stats?.total_commission || 0)} ؋</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>GB فروخته</Text>
                  <Text style={styles.infoValue}>{fmt(profile.stats?.total_gb || 0)} GB</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>مانده بدهی</Text>
                  <Text style={[styles.infoValue, { color: profile.debt > 0 ? colors.danger : colors.success }]}>
                    {fmt(profile.debt || 0)} GB
                  </Text>
                </View>
              </>
            )}
          </View>
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 خروج از حساب</Text>
      </TouchableOpacity>

      <Text style={styles.version}>HotSpot Manager v1.0</Text>
      <Text style={styles.serverUrl}>🌐 hotspot-manager.pages.dev</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  avatarSection: {
    backgroundColor: colors.brand, padding: 30, alignItems: 'center',
    paddingBottom: 40,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  name: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 6 },
  roleBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 99, marginBottom: 4 },
  roleText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  username: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  infoSection: { padding: 12, marginTop: -20 },
  infoCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, elevation: 3,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary, textAlign: 'right', marginBottom: 12 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderColor: '#f1f5f9',
  },
  infoLabel: { fontSize: 13, color: colors.textMuted },
  infoValue: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  logoutBtn: {
    marginHorizontal: 12, marginBottom: 8, backgroundColor: '#fff',
    borderRadius: 14, padding: 16, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.danger + '40',
  },
  logoutText: { color: colors.danger, fontSize: 15, fontWeight: '700' },
  version: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginBottom: 4 },
  serverUrl: { textAlign: 'center', color: colors.textMuted, fontSize: 11, marginBottom: 20 },
});
