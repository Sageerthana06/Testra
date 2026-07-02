// src/components/common/Header.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function Header({ title, showBack, showMenu }) {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={['#0B0F19', '#0F172A']}
      style={styles.header}
    >
      {/* Top accent bar */}
      <View style={[styles.accentBar, { backgroundColor: theme.primary }]} />

      <View style={styles.row}>
        <View style={styles.left}>
          {showBack && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          )}
          {showMenu && (
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.iconBtn}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.title, { color: theme.primaryLight }]}>{title}</Text>
        </View>

        <TouchableOpacity
          onPress={logout}
          style={[styles.logoutBtn, { borderColor: '#EF4444' + '44' }]}
        >
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {user && (
        <View style={[styles.userBadge, { backgroundColor: theme.primary + '18', borderColor: theme.primary + '33' }]}>
          <Text style={[styles.userRole, { color: theme.primary }]}>
            {user.role?.replace('_', ' ').toUpperCase()}
          </Text>
          <Text style={styles.userName}>{user.name}</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  accentBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 3,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconBtn: { padding: 6 },
  backIcon: { color: '#F1F5F9', fontSize: 20 },
  menuIcon: { color: '#F1F5F9', fontSize: 20 },
  title: { fontSize: 18, fontWeight: '800', letterSpacing: 0.2, flex: 1 },
  logoutBtn: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  logoutText: { color: '#EF4444', fontSize: 11, fontWeight: '700' },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  userRole: { fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  userName: { fontSize: 10, color: '#94A3B8', fontWeight: '600' },
});
