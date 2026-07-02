// src/components/common/ThemedButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../contexts/ThemeContext';

export default function ThemedButton({ title, onPress, loading, variant = 'primary', style, textStyle }) {
  const { theme } = useTheme();

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={loading}
        style={[styles.outlineBtn, { borderColor: theme.primary }, style]}
      >
        {loading
          ? <ActivityIndicator color={theme.primary} />
          : <Text style={[styles.outlineText, { color: theme.primary }, textStyle]}>{title}</Text>
        }
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={loading} style={[styles.wrapper, style]}>
      <LinearGradient
        colors={[theme.primaryDark, theme.primary, theme.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading
          ? <ActivityIndicator color="#0B0F19" />
          : <Text style={[styles.text, textStyle]}>{title}</Text>
        }
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 12, overflow: 'hidden' },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  text: { color: '#0B0F19', fontWeight: '800', fontSize: 14, letterSpacing: 0.3 },
  outlineBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  outlineText: { fontWeight: '700', fontSize: 13 },
});
