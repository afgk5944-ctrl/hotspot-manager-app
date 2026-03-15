import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, RefreshControl,
  TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useApi } from '../api/useApi';
import { useAuth } from '../context/AuthContext';
import { colors, commonStyles } from '../utils/theme';

const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(Math.round(n || 0));

export default function AllocationsScreen() {
  const api = useApi();
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [sellers, setSellers] = useState<any[]>([]);
  const [form, setForm] = useState({ seller_id: '', gb_amount: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (p = 1) => {
    try {
      const d = await api.getAllocations(p) as any;
      if (p === 1) setItems(d.items); else setItems(prev => [...prev, ...d.items]);
      setTotal(d.total);
    } catch {}
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
    if (isOwner) api.getSellers().then((d: any) => setSellers(d.sellers || []));
  }, []);

  const onRefresh = () => { setRefreshing(true); setPage(1); load(1); };
  const loadMore = () => { if (items.length < total) { const p = page + 1; setPage(p); load(p); } };

  const handleAdd = async () => {
    if (!form.seller_id || !form.gb_amount) { Alert.alert('خطا', 'فروشنده و مقدار GB الزامی است'); return; }
    setSaving(true);
    try {
      await api.addAllocation({ seller_id: parseInt(form.seller_id), gb_amount: parseFloat(form.gb_amount), notes: form.notes });
      Alert.alert('✅ موفق', 'تخصیص با موفقیت ثبت شد');
      setShowAdd(false); setForm({ seller_id: '', gb_amount: '', notes: '' }); load(1);
    } catch (e: any) { Alert.alert('خطا', e.message); }
    setSaving(false);
  };

  const renderItem = ({ item }: any) => (
    <View style={commonStyles.card}>
      <View style={commonStyles.rowBetween}>
        <Text style={styles.gbAmount}>{fmt(item.gb_amount)} GB</Text>
        <Text style={styles.sellerName}>{item.seller_name}</Text>
      </View>
      <View style={[commonStyles.rowBetween, { marginTop: 6 }]}>
        <Text style={styles.date}>{new Date(item.allocation_date).toLocaleDateString('fa-IR')}</Text>
        {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {isOwner && (
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>+ تخصیص جدید</Text>
        </TouchableOpacity>
      )}

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.brand} /> : (
        <FlatList
          data={items} renderItem={renderItem} keyExtractor={i => i.id.toString()}
          contentContainerStyle={{ padding: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand]} />}
          onEndReached={loadMore} onEndReachedThreshold={0.3}
          ListEmptyComponent={<Text style={commonStyles.emptyState}>هیچ تخصیصی ثبت نشده</Text>}
        />
      )}

      {/* Add Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>تخصیص GB جدید</Text>

              <Text style={commonStyles.label}>فروشنده</Text>
              <View style={styles.select}>
                {sellers.map(s => (
                  <TouchableOpacity key={s.id}
                    style={[styles.selectItem, form.seller_id == s.id && styles.selectItemActive]}
                    onPress={() => setForm(f => ({ ...f, seller_id: s.id }))}>
                    <Text style={[styles.selectText, form.seller_id == s.id && { color: '#fff' }]}>
                      {s.full_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={commonStyles.label}>مقدار GB</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="مثال: 50"
                keyboardType="decimal-pad"
                value={form.gb_amount}
                onChangeText={v => setForm(f => ({ ...f, gb_amount: v }))}
              />

              <Text style={commonStyles.label}>یادداشت (اختیاری)</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="..."
                value={form.notes}
                onChangeText={v => setForm(f => ({ ...f, notes: v }))}
              />

              <TouchableOpacity style={commonStyles.btn} onPress={handleAdd} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={commonStyles.btnText}>ثبت تخصیص</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[commonStyles.btn, commonStyles.btnOutline, { marginTop: 8 }]} onPress={() => setShowAdd(false)}>
                <Text style={commonStyles.btnOutlineText}>انصراف</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: { backgroundColor: colors.brand, margin: 12, borderRadius: 12, padding: 14, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  gbAmount: { fontSize: 16, fontWeight: '800', color: colors.brand },
  sellerName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  date: { fontSize: 12, color: colors.textMuted },
  notes: { fontSize: 12, color: colors.textSecondary, flex: 1, textAlign: 'right' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36,
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, textAlign: 'right', marginBottom: 16 },
  select: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  selectItem: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: colors.border },
  selectItemActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  selectText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
});
