// src/screens/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import MetricCard from '../../components/common/MetricCard';
import SectionCard from '../../components/common/SectionCard';
import Header from '../../components/common/Header';
import StatusBadge from '../../components/common/StatusBadge';
import {
  getDashboardMetrics,
  getProducts,
  getPurchases,
  getSalesOrders
} from '../../api';
import { formatLKR } from '../../utils/formatters';

export default function AdminDashboard({ navigation }) {
  const { user } = useAuth();
  const { theme } = useTheme();

  const [salesOrders, setSalesOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const [metrics, setMetrics] = useState({
      totalSales: 0,
      totalPurchases: 0,
      totalExpenses: 0,
      activeCustomers: 0,
      stockAlerts: 0
    });
    try {
      const [mRes, pRes, puRes, soRes] =
        await Promise.all([
          getDashboardMetrics(),
          getProducts(),
          getPurchases(),
          getSalesOrders()
        ]);
      if (mRes.data?.success) setMetrics(mRes.data.metrics);
      if (pRes.data?.success) setProducts(pRes.data.data || []);
      if (puRes.data?.success) setPurchases(puRes.data.data || []);
      if (soRes.data?.success)
        setSalesOrders(soRes.data.data || []);
    } catch { /* use default state */ }
  };

  useEffect(() => { loadData(); }, []);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };

  return (
    <LinearGradient colors={['#0B0F19', '#0F172A']} style={{ flex: 1 }}>
      <Header title="💼 Admin Dashboard" showMenu />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome */}
        <LinearGradient colors={[theme.primaryDark + 'BB', theme.primary + '44', 'transparent']} style={styles.banner}>
          <Text style={styles.bannerHi}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={[styles.bannerRole, { color: theme.primaryLight }]}>Operational Admin Access</Text>
        </LinearGradient>

        {/* Metrics */}
        <Text style={[styles.sectionLabel, { color: theme.primary }]}>📊 OPERATIONS SUMMARY</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Sales Orders"
            value={String(salesOrders.length)}
            icon="📋"
            accentColor="#8B5CF6"
          />

          <MetricCard
            title="Pending Invoices"
            value={String(
              salesOrders.filter(
                o => o.invoice_status === 'Pending'
              ).length
            )}
            icon="⏳"
            accentColor="#F59E0B"
          />
          <MetricCard title="Total Purchases" value={formatLKR(metrics.totalPurchases)} icon="🛒" />
          <MetricCard title="Total Expenses" value={formatLKR(metrics.totalExpenses)} icon="💸" />
          <MetricCard title="Customers" value={String(metrics.activeCustomers || 3)} icon="🤝" accentColor="#EC4899" />
          <MetricCard title="Stock Alerts" value={String(metrics.stockAlerts || 2)} icon="⚠️" accentColor="#EF4444" />
        </View>

        {/* Quick Nav */}
        <SectionCard title="Module Access" icon="⚡">
          <View style={styles.actionGrid}>
            {[
              { label: 'Purchase Orders', icon: '🛒', screen: 'Purchases', color: '#3B82F6' },
              { label: 'Stock Control', icon: '📦', screen: 'Products', color: '#F59E0B' },
              { label: 'Expenses', icon: '💸', screen: 'Expenses', color: '#EF4444' },
              { label: 'Add Customer', icon: '👤', screen: 'AddCustomer', color: '#EC4899' },
              { label: 'Payments', icon: '💵', screen: 'Payments', color: '#22C55E' },
              { label: 'Analytics', icon: '📊', screen: 'Analytics', color: '#14B8A6' },
            ].map((a) => (
              <TouchableOpacity
                key={a.label}
                onPress={() => navigation.navigate(a.screen)}
                style={[styles.actionBtn, { borderColor: a.color + '44' }]}
              >
                <View style={[styles.actionIcon, { backgroundColor: a.color + '22' }]}>
                  <Text style={{ fontSize: 22 }}>{a.icon}</Text>
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>

        {/* Low Stock Products */}
        <SectionCard title="Low Stock Alerts" icon="⚠️">
          {products.filter(p => p.currentStock <= p.lowStockThreshold).slice(0, 4).map((p) => (
            <View key={p._id} style={styles.stockRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.stockName}>{p.name}</Text>
                <Text style={styles.stockSku}>{p.sku}</Text>
              </View>
              <View style={styles.stockQty}>
                <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '800' }}>{p.currentStock}</Text>
                <Text style={{ color: '#64748B', fontSize: 9 }}>units</Text>
              </View>
            </View>
          ))}
          {products.filter(p => p.currentStock <= p.lowStockThreshold).length === 0 && (
            <Text style={styles.emptyText}>✅ All products are adequately stocked.</Text>
          )}
        </SectionCard>

        {/* Recent Purchases */}
        <SectionCard title="Recent Purchase Orders" icon="🛒">
          {purchases.slice(0, 3).map((po, i) => (
            <View key={po._id || i} style={styles.poRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.poNumber}>{po.poNumber}</Text>
                <Text style={styles.poSupplier}>{po.supplierName}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.poAmount, { color: theme.primaryLight }]}>{formatLKR(po.totalAmount)}</Text>
                <StatusBadge status={po.paymentStatus} />
              </View>
            </View>
          ))}
          {purchases.length === 0 && <Text style={styles.emptyText}>No purchase orders yet.</Text>}
        </SectionCard>
        {/* Recent Sales Orders */}
        <SectionCard title="Recent Sales Orders" icon="📋">

          {salesOrders.slice(0, 5).map((order, index) => (

            <View
              key={order._id || index}
              style={styles.poRow}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.poNumber}>
                  {order.order_no}
                </Text>

                <Text style={styles.poSupplier}>
                  {order.customer_name}
                </Text>

                <Text
                  style={{
                    color: '#64748B',
                    fontSize: 10
                  }}
                >
                  {order.business_type}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text
                  style={[
                    styles.poAmount,
                    { color: theme.primaryLight }
                  ]}
                >
                  {formatLKR(order.amount)}
                </Text>

                <StatusBadge
                  status={order.invoice_status}
                />
              </View>

            </View>

          ))}

          {salesOrders.length === 0 && (
            <Text style={styles.emptyText}>
              No sales orders found.
            </Text>
          )}

        </SectionCard>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  banner: { borderRadius: 16, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  bannerHi: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  bannerRole: { fontSize: 18, fontWeight: '900', marginTop: 2 },
  sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 10, marginTop: 4 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionBtn: {
    width: '30%', alignItems: 'center', paddingVertical: 14, borderRadius: 14,
    borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)',
  },
  actionIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  actionLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  stockRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  stockName: { color: '#F1F5F9', fontSize: 13, fontWeight: '700' },
  stockSku: { color: '#64748B', fontSize: 10, marginTop: 2 },
  stockQty: { alignItems: 'center' },
  poRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  poNumber: { color: '#F1F5F9', fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
  poSupplier: { color: '#64748B', fontSize: 11, marginTop: 2 },
  poAmount: { fontSize: 13, fontWeight: '800', fontVariant: ['tabular-nums'], marginBottom: 4 },
  emptyText: { color: '#64748B', fontSize: 12, textAlign: 'center', paddingVertical: 10 },
});
