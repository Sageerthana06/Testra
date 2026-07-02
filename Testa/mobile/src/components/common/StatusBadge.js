// src/components/common/StatusBadge.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatusBadge({ status }) {
  const map = {
    paid: { bg: '#14532D', text: '#4ADE80', label: 'PAID' },
    partially_paid: { bg: '#713F12', text: '#FDE047', label: 'PARTIAL' },
    unpaid: { bg: '#450A0A', text: '#F87171', label: 'UNPAID' },
    delivered: { bg: '#1E3A5F', text: '#60A5FA', label: 'DELIVERED' },
    completed: { bg: '#14532D', text: '#4ADE80', label: 'COMPLETED' },
    on_going: { bg: '#713F12', text: '#FDE047', label: 'ON GOING' },
    pending: { bg: '#1C1917', text: '#94A3B8', label: 'PENDING' },
    active: { bg: '#14532D', text: '#4ADE80', label: 'ACTIVE' },
  };
  const s = map[status] || { bg: '#1E293B', text: '#94A3B8', label: status?.toUpperCase() || '—' };

  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.text }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
});
