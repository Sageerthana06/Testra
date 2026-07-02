// src/screens/superadmin/SuperAdminDashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet, RefreshControl,
  TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

import MetricCard from '../../components/common/MetricCard';
import SectionCard from '../../components/common/SectionCard';
import Header from '../../components/common/Header';

import { getDashboardMetrics, getStaff, getBranches } from '../../api';
import { formatLKR } from '../../utils/formatters';

const MOCK_METRICS = {
  totalSales: 28625000,
  totalPurchases: 12200000,
  totalExpenses: 3150000,
  netProfit: 13275000,
  activeCustomers: 3,
  totalBranches: 3,
  totalStaff: 4,
  stockAlerts: 2,
};

export default function SuperAdminDashboard({ navigation }) {

  const { user } = useAuth();
  const { theme, themeName, switchTheme } = useTheme();

  const [metrics, setMetrics] = useState(MOCK_METRICS);
  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const THEMES = [
    { key: 'red', color: '#DC2626' },
    { key: 'yellow', color: '#EAB308' },
    { key: 'green', color: '#34D399' },
  ];

  const loadData = useCallback(async () => {
    try {
      const [mRes, sRes, bRes] = await Promise.all([
        getDashboardMetrics(),
        getStaff(),
        getBranches(),
      ]);

      if (mRes?.data?.success) setMetrics(mRes.data.metrics);
      if (sRes?.data?.success) setStaff(sRes.data.data || []);
      if (bRes?.data?.success) setBranches(bRes.data.data || []);

    } catch (err) {
      console.log('Dashboard API Error:', err);
      Alert.alert('Error', 'Failed to load dashboard data');
      setMetrics(MOCK_METRICS);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation, loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <LinearGradient colors={['#0B0F19', '#0F172A']} style={{ flex: 1 }}>

      <Header title="👑 Super Admin" showMenu />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >

        {/* Welcome Banner */}
        <LinearGradient
          colors={[theme.primaryDark + 'CC', theme.primary + '66', 'transparent']}
          style={styles.welcomeBanner}
        >
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={[styles.welcomeName, { color: theme.primaryLight }]}>
            {user?.name}
          </Text>
          <Text style={styles.welcomeSub}>
            Full corporate control activated.
          </Text>
        </LinearGradient>

        {/* Theme Switcher */}
        <SectionCard title="Dashboard Theme" icon="🎨">
          <View style={styles.themeRow}>
            {THEMES.map((t) => (
              <TouchableOpacity
                key={t.key}
                onPress={() => switchTheme(t.key)}
                style={[
                  styles.themeBtn,
                  { backgroundColor: t.color },
                  themeName === t.key && styles.themeBtnActive,
                ]}
              >
                <Text style={styles.themeLabel}>{t.key.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>

        {/* Financial KPIs */}
        <Text style={[styles.sectionLabel, { color: theme.primary }]}>
          📊 FINANCIAL OVERVIEW
        </Text>

        <View style={styles.metricsGrid}>
          <MetricCard title="Total Sales" value={formatLKR(metrics.totalSales)} icon="📈" />
          <MetricCard title="Net Profit" value={formatLKR(metrics.netProfit)} icon="💰" />
          <MetricCard title="Purchases" value={formatLKR(metrics.totalPurchases)} icon="🛒" />
          <MetricCard title="Expenses" value={formatLKR(metrics.totalExpenses)} icon="💸" />
        </View>

        {/* Corporate Stats */}
        <Text style={[styles.sectionLabel, { color: theme.primary }]}>
          🏢 CORPORATE OVERVIEW
        </Text>

        <View style={styles.metricsGrid}>
          <MetricCard title="Branches" value={String(metrics.totalBranches)} icon="🏢" />
          <MetricCard title="Staff" value={String(metrics.totalStaff)} icon="👥" />
          <MetricCard title="Customers" value={String(metrics.activeCustomers)} icon="🤝" />
          <MetricCard title="Alerts" value={String(metrics.stockAlerts)} icon="⚠️" />
        </View>

        {/* Quick Actions */}
        <SectionCard title="Quick Actions" icon="⚡">

          <View style={styles.actionGrid}>

            {[
              { label: 'Staff', screen: 'Staff', icon: '👥' },
              { label: 'Branches', screen: 'Branches', icon: '🏢' },
              { label: 'Sales', screen: 'Sales', icon: '📋' },
              { label: 'Expenses', screen: 'Expenses', icon: '💸' },
              { label: 'Products', screen: 'Products', icon: '📦' },
              { label: 'Reports', screen: 'Reports', icon: '📊' },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.actionBtn}
                onPress={() => navigation.navigate(item.screen)}
              >
                <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                <Text style={styles.actionLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}

          </View>

        </SectionCard>

        {/* Branch List */}
        {branches.length > 0 && (
          <SectionCard title="Branch Status" icon="🏆">

            {branches.map((b, i) => (
              <View key={b._id || i} style={styles.branchRow}>

                <Text style={styles.branchName}>{b.name}</Text>
                <Text style={styles.branchLocation}>{b.location}</Text>

                <Text
                  style={[
                    styles.status,
                    { color: b.status === 'active' ? '#4ADE80' : '#F87171' }
                  ]}
                >
                  {b.status}
                </Text>

              </View>
            ))}

          </SectionCard>
        )}

      </ScrollView>
    </LinearGradient>
  );
}