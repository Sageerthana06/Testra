// src/api/index.js
import api from './axios';

// ─── Branches ──────────────────────────────────────────────────
export const getBranches = () => api.get('/branches');
export const createBranch = (data) => api.post('/branches', data);

// ─── Customers ─────────────────────────────────────────────────
export const getCustomers = () => api.get('/customers');
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

// ─── Products ──────────────────────────────────────────────────
export const getProducts = () => api.get('/products');
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);

// ─── Sales ─────────────────────────────────────────────────────
export const getSales = () => api.get('/sales');
export const createSale = (data) => api.post('/sales', data);
export const deleteSale = (id) => api.delete(`/sales/${id}`);

// ─── Purchases ─────────────────────────────────────────────────
export const getPurchases = () => api.get('/purchases');
export const createPurchase = (data) => api.post('/purchases', data);

// ─── Expenses ──────────────────────────────────────────────────
export const getExpenses = () => api.get('/expenses');
export const createExpense = (data) => api.post('/expenses', data);

// ─── Payments ──────────────────────────────────────────────────
export const getPayments = () => api.get('/payments');
export const createPayment = (data) => api.post('/payments', data);

// ─── Reports / Dashboard ───────────────────────────────────────
export const getDashboardMetrics = () => api.get('/reports/dashboard');

// ─── Staff ─────────────────────────────────────────────────────
export const getStaff = () => api.get('/staff');
export const createStaff = (data) => api.post('/staff', data);
