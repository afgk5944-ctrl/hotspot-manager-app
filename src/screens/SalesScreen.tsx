import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, RefreshControl,
  TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator
} from 'react-native';
import { useApi } from '../api/useApi';
import { useAuth } from '../context/AuthContext';
import { colors, commonStyles } from '../utils/theme';

const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(Math.round(n || 0));

export default function SalesScreen() {
  const api = useApi();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showAdd, setShowAdd] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);
  const [form, setForm] = useState({ package_id: '', quantity_gb: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (p = 1) => {
    try {
      const d = await api.getSales(p) as any;
      if (p === 1) setItems(d.items); else setItems(prev => [...prev, ...d.items]);
      setTotal(d.total);
    } catch {}
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => { load(); api.getPackages().then((d: any) => setPackages(d.packages || [])); }, []);

  const onRefresh = () => { setRefreshing(true); setPage(1); load(1); };
  const loadMore = () => { if (items.length < total) { const p = page + 1; setPage(p); load(p); } };

  const handleAdd = async () => {
    if (!form.package_id || !form.quantity_gb) { Alert.alert('خطا', 'پکیج و مقدار GB الزامی است'); return; }
    setSaving(true);
    try {
      const res = await api.addSale({ package_id: parseInt(form.package_id), quantity_gb: parseFloat(form.quantity_gb), notes: form.notes }) as any;
      Alert.alert('✅ موفق', `فروش ثبت شد\nمبلغ: ${fmt(res.total_price)} ؋\nکمیسیون: ${fmt(res.commission)} ؋`);
      setShowAdd(false); setForm({ package_id: '', quantity_gb: '', notes: '' }); load(1);
    } catch (e: any) { Alert.alert('خطا', e.message); }
    setSaving(false);
  };

  const handleDelete = (id: number) => {
    Alert.alert('حذف', 'آیا مطمئن هستید؟', [
      { text: 'لغو', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        await api.deleteSale(id); load(1);
      }},
    ]);
  };

  const renderItem = ({ item }: any) => (
    <View style={commonStyles.card}>
      <View style={commonStyles.rowBetween}>
        <Text style={styles.price}>{fmt(item.total_price)} ؋</Text>
        <Text style={styles.packageName}>{item.package_name}</Text>
      </View>
      <View style={[commonStyles.rowBetween, { marginTop: 8 }]}>
        <Text style={styles.meta}>{new Date(item.sale_date).toLocaleDateString('fa-IR')}</Text>
        <Text style={styles.meta}>{item.seller_name} • {item.quantity_gb} GB</Text>
      </View>
      {item.commission_amount > 0 && (
        <Text style={styles.commission}>کمیسیون: {fmt(item.commission_amount)} ؋</Text>
      )}
      {user?.role === 'owner' && (
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteBtnText}>🗑 حذف</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* Add button */}
      <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
        <Text style={styles.addBtnText}>+ ثبت فروش جدید</Text>
      </TouchableOpacity>

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.brand} /> : (
        <FlatList
          data={items} renderItem={renderItem} keyExtractor={i => i.id.toString()}
          contentContainerStyle={{ padding: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand]} />}
          onEndReached={loadMore} onEndReachedThreshold={0.3}
          ListEmptyComponent={<Text style={commonStyles.emptyState}>هیچ فروشی ثبت نشده</Text>}
        />
      )}

      {/* Add Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>ثبت فروش جدید</Text>

            <Text style={commonStyles.label}>پکیج</Text>
            <View style={styles.select}>
              {packages.map(p => (
                <TouchableOpacity key={p.id}
                  style={[styles.selectItem, form.package_id == p.id && styles.selectItemActive]}
                  onPress={() => setForm(f => ({ ...f, package_id: p.id }))}>
                  <Text style={[styles.selectText, form.package_id == p.id && { color: '#fff' }]}>
                    {p.name} ({fmt(p.price_per_gb)} ؋/GB)
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={commonStyles.label}>مقدار (GB)</Text>
            <TextInput style={commonStyles.input} placeholder="مثال: 10" keyboardType="decimal-pad" value={form.quantity_gb} onChangeText={v => setForm(f => ({ ...f, quantity_gb: v }))} />

            <Text style={commonStyles.label}>یادداشت (اختیاری)</Text>
            <TextInput style={commonStyles.input} placeholder="..." value={form.notes} onChangeText={v => setForm(f => ({ ...f, notes: v }))} />

            <TouchableOpacity style={commonStyles.btn} onPress={handleAdd} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={commonStyles.btnText}>ثبت فروش</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[commonStyles.btn, commonStyles.btnOutline, { marginTop: 8 }]} onPress={() => setShowAdd(false)}>
              <Text style={commonStyles.btnOutlineText}>انصراف</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    backgroundColor: colors.brand, margin: 12, borderRadius: 12,
    padding: 14, alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  price: { fontSize: 15, fontWeight: '800', color: colors.success },
  packageName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textMuted },
  commission: { fontSize: 12, color: colors.warning, marginTop: 4, textAlign: 'right' },
  deleteBtn: { marginTop: 8, alignSelf: 'flex-start', padding: 6 },
  deleteBtnText: { color: colors.danger, fontSize: 12, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36, maxHeight: '90%',
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: colors.textPrimary, textAlign: 'right', marginBottom: 16 },
  select: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  selectItem: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
    borderWidth: 1.5, borderColor: colors.border,
  },
  selectItemActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  selectText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
});
