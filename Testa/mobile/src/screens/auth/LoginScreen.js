// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Alert, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import InputField from '../../components/common/InputField';
import ThemedButton from '../../components/common/ThemedButton';

const { width } = Dimensions.get('window');

const ROLE_PORTALS = [
  { key: 'super_admin', label: 'Super Admin', icon: '👑', email: 'superadmin@erp.com', theme: 'red' },
  { key: 'admin', label: 'Admin', icon: '💼', email: 'admin@erp.com', theme: 'yellow' },
  { key: 'branch_manager', label: 'Manager', icon: '🏢', email: 'manager@erp.com', theme: 'lightgreen' },
  { key: 'marketing', label: 'Marketing', icon: '📣', email: 'marketing@erp.com', theme: 'lightgreen' },
];

const PORTAL_INFO = {
  super_admin: 'Full corporate access. Manage branches, staff, and system settings.',
  admin: 'Operational control. Handle purchases, stock, expenses, and supplier management.',
  branch_manager: 'Branch operations. Create sales, manage customers and delivery status.',
  marketing: 'Field sales. Add customers, create invoices, track commissions.',
};

export default function LoginScreen() {
  const { login } = useAuth();
  const { theme, switchTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('super_admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePortalSelect = (portal) => {
    setSelectedRole(portal.key);
    setEmail(portal.email);
    setPassword('admin123');
    setError('');
    switchTheme(portal.theme);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.message || 'Login failed. Try demo credentials.');
    }
  };

  const activePortal = ROLE_PORTALS.find(p => p.key === selectedRole);

  return (
    <LinearGradient colors={['#0B0F19', '#0F172A', '#0B0F19']} style={styles.bg}>
      {/* Top accent bar */}
      <View style={[styles.topBar, { backgroundColor: theme.primary }]} />

      {/* Floating background orbs */}
      <View style={[styles.orb1, { backgroundColor: theme.primary + '18' }]} />
      <View style={[styles.orb2, { backgroundColor: theme.primaryDark + '22' }]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Brand Header */}
          <View style={styles.brand}>
            <LinearGradient
              colors={[theme.primaryDark + '88', theme.primary + '44']}
              style={styles.logoBox}
            >
              <Text style={styles.logoIcon}>🏭</Text>
            </LinearGradient>
            <Text style={[styles.brandName, { color: theme.primaryLight }]}>TESTRAA</Text>
            <View style={[styles.brandLine, { backgroundColor: theme.primary }]} />
            <Text style={styles.brandSub}>EXPORT & IMPORT (PVT) LTD</Text>
            <Text style={styles.brandTag}>Enterprise Resource Planning Portal</Text>
          </View>

          {/* Role Portal Tabs */}
          <View style={styles.portalTabs}>
            {ROLE_PORTALS.map(portal => (
              <TouchableOpacity
                key={portal.key}
                onPress={() => handlePortalSelect(portal)}
                style={[
                  styles.portalTab,
                  selectedRole === portal.key && {
                    backgroundColor: theme.primary + '22',
                    borderColor: theme.primary + '88',
                  },
                ]}
              >
                <Text style={styles.portalIcon}>{portal.icon}</Text>
                <Text style={[
                  styles.portalLabel,
                  selectedRole === portal.key && { color: theme.primaryLight },
                ]}>
                  {portal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Login Card */}
          <View style={[styles.card, { borderColor: theme.primary + '33' }]}>

            {/* Role Info Banner */}
            <View style={[styles.roleBanner, {
              backgroundColor: theme.primary + '12',
              borderColor: theme.primary + '33',
            }]}>
              <Text style={styles.rolePortalIcon}>{activePortal?.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rolePortalTitle, { color: theme.primaryLight }]}>
                  {selectedRole.replace('_', ' ').toUpperCase()} PORTAL
                </Text>
                <Text style={styles.rolePortalDesc}>{PORTAL_INFO[selectedRole]}</Text>
              </View>
            </View>

            {/* Form */}
            <InputField
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="name@erp.com"
              keyboardType="email-address"
            />
            <InputField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
            />

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️  {error}</Text>
              </View>
            ) : null}

            <ThemedButton
              title={loading ? 'Authenticating...' : `Enter ${activePortal?.label || ''} Dashboard →`}
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
            />



          </View>

          <Text style={styles.footer}>
            TESTRAA ERP v2.0  •  Sri Lanka  •  Red / Yellow / Green Themes
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  topBar: { height: 3, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 99 },
  orb1: {
    position: 'absolute', top: 80, left: -60,
    width: 200, height: 200, borderRadius: 100,
  },
  orb2: {
    position: 'absolute', bottom: 100, right: -60,
    width: 180, height: 180, borderRadius: 90,
  },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  brand: { alignItems: 'center', marginBottom: 28 },
  logoBox: {
    width: 72, height: 72, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  logoIcon: { fontSize: 36 },
  brandName: { fontSize: 28, fontWeight: '900', letterSpacing: 4 },
  brandLine: { width: 48, height: 3, borderRadius: 2, marginVertical: 8 },
  brandSub: { color: '#94A3B8', fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  brandTag: { color: '#475569', fontSize: 9, marginTop: 4, letterSpacing: 1 },

  portalTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 14,
    padding: 6,
    gap: 4,
    marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  portalTab: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    borderRadius: 10, borderWidth: 1, borderColor: 'transparent',
  },
  portalIcon: { fontSize: 18, marginBottom: 4 },
  portalLabel: { fontSize: 9, color: '#64748B', fontWeight: '700', textAlign: 'center' },

  card: {
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderWidth: 1, borderRadius: 22,
    padding: 22, marginBottom: 20,
  },
  roleBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 20,
  },
  rolePortalIcon: { fontSize: 22, marginTop: 2 },
  rolePortalTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 },
  rolePortalDesc: { fontSize: 11, color: '#64748B', lineHeight: 16 },

  errorBox: {
    backgroundColor: '#450A0A', borderRadius: 10, padding: 10, marginBottom: 12,
    borderWidth: 1, borderColor: '#991B1B',
  },
  errorText: { color: '#FCA5A5', fontSize: 12, fontWeight: '600' },
  loginBtn: { marginTop: 4 },


});
