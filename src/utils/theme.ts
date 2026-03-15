import { StyleSheet } from 'react-native';

export const colors = {
  brand: '#4f46e5',
  brandDark: '#4338ca',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  bg: '#f4f6fb',
  card: '#ffffff',
  border: '#e2e8f0',
  textPrimary: '#1e293b',
  textSecondary: '#475569',
  textMuted: '#94a3b8',
};

export const commonStyles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.card, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3, marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, textAlign: 'right' },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, textAlign: 'right', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: 10,
    padding: 12, fontSize: 15, color: colors.textPrimary,
    backgroundColor: '#f8fafc', textAlign: 'right', marginBottom: 14,
  },
  btn: {
    backgroundColor: colors.brand, borderRadius: 12,
    padding: 14, alignItems: 'center',
    shadowColor: colors.brand, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnDanger: { backgroundColor: colors.danger },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border },
  btnOutlineText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  emptyState: { textAlign: 'center', color: colors.textMuted, fontSize: 14, padding: 30 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99, fontSize: 11, fontWeight: '700' },
});
