// src/components/common/SectionCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function SectionCard({ title, icon, children, style }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { borderColor: theme.primary + '22' }, style]}>
      {title ? (
        <View style={[styles.header, { borderBottomColor: theme.primary + '22' }]}>
          {icon ? <Text style={styles.icon}>{icon}</Text> : null}
          <Text style={[styles.title, { color: theme.primaryLight }]}>{title}</Text>
        </View>
      ) : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(15,23,42,0.75)',
    borderWidth: 1,
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  icon: { fontSize: 16 },
  title: { fontSize: 14, fontWeight: '800', letterSpacing: 0.2, flex: 1 },
  body: { padding: 16 },
});
