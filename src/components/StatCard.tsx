import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../utils/theme';

interface Props {
  icon: string;
  label: string;
  value: string;
  color?: string;
}

export default function StatCard({ icon, label, value, color = colors.brand }: Props) {
  return (
    <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  icon: { fontSize: 24, marginBottom: 6 },
  value: { fontSize: 16, fontWeight: '800', color: colors.textPrimary, textAlign: 'right' },
  label: { fontSize: 11, color: colors.textMuted, marginTop: 2, textAlign: 'right' },
});
