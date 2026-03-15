import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, RefreshControl,
  TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useApi } from '../api/useApi';
import { useAuth } from '../context/AuthContext';
import { colors, commonStyles } from '../utils/theme';

const fmt = (n: number) => new Intl.NumberFormat('fa-IR').format(Math.round(n || 0));

export default function PaymentsScreen() {
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
  const [form, setForm] = useState({ seller_id: '', amount: '', payment_method: 'cash', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (p = 1) => {
    try {
      const d = await api.getPayments(p) as any;
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
    if (!form.seller_id || !form.amount) { Alert.alert('خطا', 'فروشنده و مبلغ الزامی است'); return; }
    setSaving(true);
    try {
      await api.addPayment({
        seller_id: parseInt(form.seller_id),
        amount: parseFloat(form.amount),
        payment_method: form.payment_method,
        notes: form.notes,
      });
      Alert.alert('✅ موفق', 'پرداخت با موفقیت ثبت شد');
      setShowAdd(false); setForm({ seller_id: '', amount: '', payment_method: 'cash', notes: '' }); load(1);
    } catch (e: any) { Alert.alert('خطا', e.message); }
    setSaving(false);
  };

  const handleDelete = (id: number) => {
    Alert.alert('حذف', 'آیا مطمئن هستید؟', [
      { text: 'لغو', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: async () => {
        await api.deletePayment(id); load(1);
      }},
    ]);
  };

  const methodLabel = (m: string) => {
    const map: any = { cash: 'نقد', bank: 'بانک', online: 'آنلاین' };
    return map[m] || m;
  };

  const renderItem = ({ item }: any) => (
    <View style={commonStyles.card}>
      <View style={commonStyles.rowBetween}>
        <Text style={styles.amount}>{fmt(item.amount)} ؋</Text>
        <Text style={styles.sellerName}>{item.seller_name}</Text>
      </View>
      <View style={[commonStyles.rowBetween, { marginTop: 6 }]}>
        <Text style={styles.date}>{new Date(item.payment_date).toLocaleDateString('fa-IR')}</Text>
        <View style={styles.methodBadge}>
          <Text style={styles.methodText}>{methodLabel(item.payment_method)}</Text>
        </View>
      </View>
      {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
      <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
        <Text style={styles.deleteBtnText}>🗑 حذف</Text>
      </TouchableOpacity>
    </View>
  );

  const methods = ['cash', 'bank', 'online'];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {isOwner && (
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>+ ثبت پرداخت</Text>
        </TouchableOpacity>
      )}

      {loading ? <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.brand} /> : (
        <FlatList
          data={items} renderItem={renderItem} keyExtractor={i => i.id.toString()}
          contentContainerStyle={{ padding: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.brand]} />}
          onEndReached={loadMore} onEndReachedThreshold={0.3}
          ListEmptyComponent={<Text style={commonStyles.emptyState}>هیچ پرداختی ثبت نشده</Text>}
        />
      )}

      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>ثبت پرداخت جدید</Text>

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

              <Text style={commonStyles.label}>مبلغ (افغانی)</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="مثال: 5000"
                keyboardType="decimal-pad"
                value={form.amount}
                onChangeText={v => setForm(f => ({ ...f, amount: v }))}
              />

              <Text style={commonStyles.label}>روش پرداخت</Text>
              <View style={[styles.select, { marginBottom: 14 }]}>
                {methods.map(m => (
                  <TouchableOpacity key={m}
                    style={[styles.selectItem, form.payment_method === m && styles.selectItemActive]}
                    onPress={() => setForm(f => ({ ...f, payment_method: m }))}>
                    <Text style={[styles.selectText, form.payment_method === m && { color: '#fff' }]}>
                      {m === 'cash' ? 'نقد' : m === 'bank' ? 'بانک' : 'آنلاین'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={commonStyles.label}>یادداشت (اختیاری)</Text>
              <TextInput
                style={commonStyles.input}
                placeholder="..."
                value={form.notes}
                onChangeText={v => setForm(f => ({ ...f, notes: v }))}
              />

              <TouchableOpacity style={commonStyles.btn} onPress={handleAdd} disabled={saving}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={commonStyles.btnText}>ثبت پرداخت</Text>}
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
  amount: { fontSize: 16, fontWeight: '800', color: colors.success },
  sellerName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  date: { fontSize: 12, color: colors.textMuted },
  notes: { fontSize: 12, color: colors.textSecondary, marginTop: 4, textAlign: 'right' },
  methodBadge: { backgroundColor: '#e0e7ff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 99 },
  methodText: { fontSize: 11, fontWeight: '700', color: colors.brand },
  deleteBtn: { marginTop: 8, alignSelf: 'flex-start', padding: 4 },
  deleteBtnText: { color: colors.danger, fontSize: 12, fontWeight: '600' },
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
