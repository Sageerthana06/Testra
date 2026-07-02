import { create } from 'zustand';
import axiosInstance from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export const useErpStore = create((set, get) => ({
  metrics: {
    totalSales: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    netProfit: 0,
    pendingPayments: 0,
    activeCustomers: 0,
    stockAlerts: 0,
    totalStaff: 0,
    totalBranches: 0
  },
  charts: {
    dailySales: [],
    expenses: [],
    branchPerformance: []
  },
  sales: [],
  purchases: [],
  expenses: [],
  products: [],
  customers: [],
  payments: [],
  branches: [],
  staff: [],

  isLoading: false,
  isOffline: false,
  offlineQueue: [],

  // Init and sync state
  initStore: async () => {
    // Check network
    NetInfo.addEventListener(state => {
      const wasOffline = get().isOffline;
      const isConnected = state.isConnected;
      set({ isOffline: !isConnected });
      
      if (wasOffline && isConnected) {
        console.log('📶 Internet restored, running offline sync...');
        get().syncOfflineQueue();
      }
    });

    // Load offline cached data first
    await get().loadCachedData();
    
    // Fetch fresh data if online
    if (!get().isOffline) {
      await get().fetchDashboardData();
    }
  },

  // Fetch all core modules
  fetchDashboardData: async () => {
    set({ isLoading: true });
    try {
      const [reportsRes, salesRes, productsRes, custRes, expRes, branchRes] = await Promise.all([
        axiosInstance.get('/reports/dashboard'),
        axiosInstance.get('/sales'),
        axiosInstance.get('/products'),
        axiosInstance.get('/customers'),
        axiosInstance.get('/expenses'),
        axiosInstance.get('/branches')
      ]);

      const data = {
        metrics: reportsRes.data.metrics,
        charts: reportsRes.data.charts,
        sales: salesRes.data.data,
        products: productsRes.data.data,
        customers: custRes.data.data,
        expenses: expRes.data.data,
        branches: branchRes.data.data
      };

      set({ ...data, isLoading: false });
      
      // Cache values for offline usage
      await AsyncStorage.setItem('erp_cached_data', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to fetch online data, using cache:', error.message);
      set({ isLoading: false });
    }
  },

  loadCachedData: async () => {
    try {
      const cached = await AsyncStorage.getItem('erp_cached_data');
      const queue = await AsyncStorage.getItem('erp_offline_queue');
      
      if (cached) {
        const parsed = JSON.parse(cached);
        set(parsed);
      }
      if (queue) {
        set({ offlineQueue: JSON.parse(queue) });
      }
    } catch (e) {
      console.log('Error loading cache', e);
    }
  },

  // Queue actions when offline
  queueOfflineAction: async (action) => {
    const queue = [...get().offlineQueue, { ...action, id: Date.now().toString() }];
    set({ offlineQueue: queue });
    await AsyncStorage.setItem('erp_offline_queue', JSON.stringify(queue));
    
    // Optimistic UI updates
    if (action.type === 'CREATE_SALE') {
      const sales = [...get().sales, { ...action.data, invoiceNumber: 'OFFLINE-TEMP', createdAt: new Date() }];
      set({ sales });
    } else if (action.type === 'ADD_EXPENSE') {
      const expenses = [...get().expenses, { ...action.data, _id: 'TEMP_EXP', date: new Date() }];
      set({ expenses });
    }
  },

  syncOfflineQueue: async () => {
    const queue = get().offlineQueue;
    if (!queue.length) return;

    set({ isLoading: true });
    for (const action of queue) {
      try {
        if (action.type === 'CREATE_SALE') {
          await axiosInstance.post('/sales', action.data);
        } else if (action.type === 'ADD_EXPENSE') {
          await axiosInstance.post('/expenses', action.data);
        } else if (action.type === 'RECORD_PAYMENT') {
          await axiosInstance.post('/payments', action.data);
        }
      } catch (err) {
        console.error('Failed to sync offline item:', action, err.message);
      }
    }

    // Clear queue
    set({ offlineQueue: [], isLoading: false });
    await AsyncStorage.removeItem('erp_offline_queue');
    await get().fetchDashboardData();
  },

  // Create Sales Order (auto calculations handled in backend, and offline sync supported)
  createSale: async (saleData) => {
    if (get().isOffline) {
      await get().queueOfflineAction({ type: 'CREATE_SALE', data: saleData });
      return { success: true, offline: true };
    }

    try {
      set({ isLoading: true });
      const res = await axiosInstance.post('/sales', saleData);
      set({ isLoading: false });
      await get().fetchDashboardData();
      return { success: true, data: res.data.data };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error creating sale' };
    }
  },

  // Create Purchase Order (restock product)
  createPurchase: async (purchaseData) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.post('/purchases', purchaseData);
      set({ isLoading: false });
      await get().fetchDashboardData();
      return { success: true, data: res.data.data };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error processing purchase' };
    }
  },

  // Create Expense Entry
  addExpense: async (expenseData) => {
    if (get().isOffline) {
      await get().queueOfflineAction({ type: 'ADD_EXPENSE', data: expenseData });
      return { success: true, offline: true };
    }

    try {
      set({ isLoading: true });
      const res = await axiosInstance.post('/expenses', expenseData);
      set({ isLoading: false });
      await get().fetchDashboardData();
      return { success: true, data: res.data.data };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error logging expense' };
    }
  },

  // Create Payment Entry
  recordPayment: async (paymentData) => {
    if (get().isOffline) {
      await get().queueOfflineAction({ type: 'RECORD_PAYMENT', data: paymentData });
      return { success: true, offline: true };
    }

    try {
      set({ isLoading: true });
      const res = await axiosInstance.post('/payments', paymentData);
      set({ isLoading: false });
      await get().fetchDashboardData();
      return { success: true, data: res.data.data };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error recording payment' };
    }
  },

  // Register Customer
  addCustomer: async (customerData) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.post('/customers', customerData);
      set({ isLoading: false });
      await get().fetchDashboardData();
      return { success: true, data: res.data.data };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error registering customer' };
    }
  },

  // Create Branch (Super Admin Only)
  createBranch: async (branchData) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.post('/branches', branchData);
      set({ isLoading: false });
      await get().fetchDashboardData();
      return { success: true, data: res.data.data };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error creating branch' };
    }
  },

  // Register Staff Member (Super Admin Only)
  registerStaff: async (staffData) => {
    try {
      set({ isLoading: true });
      const res = await axiosInstance.post('/staff', staffData);
      set({ isLoading: false });
      await get().fetchDashboardData();
      return { success: true, data: res.data.data };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Error registering staff' };
    }
  }
}));
