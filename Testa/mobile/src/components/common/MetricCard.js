// src/components/common/MetricCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

export default function MetricCard({ title, value, subtitle, icon, accentColor }) {
  const { theme } = useTheme();
  const accent = accentColor || theme.primary;

  return (
    <View style={[styles.card, { borderColor: accent + '33' }]}>
      <View style={[styles.iconBox, { backgroundColor: accent + '22' }]}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color: theme.primaryLight }]}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {/* Themed glow blob */}
      <View style={[styles.glow, { backgroundColor: accent + '18' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flex: 1,
    minWidth: '47%',
    margin: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconText: { fontSize: 18 },
  title: {
    fontSize: 10,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F1F5F9',
    fontVariant: ['tabular-nums'],
  },
  subtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 4,
  },
  glow: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});
