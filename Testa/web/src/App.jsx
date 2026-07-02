import React, { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Award, Shield, AlertTriangle,
  MapPin, RefreshCw, Send, CheckCircle2, QrCode, FileText, Download, Share2,
  Smartphone, Plus, Landmark, Moon, Sun, Trash2, UserCheck, Settings, Network,
  LogOut, Lock, Mail, ChevronRight, Briefcase, Eye, EyeOff, UserPlus, X,
  Building2, Phone, Globe, CreditCard, ClipboardList, Hash, Tag, ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import logoImg from './logo.png';

const BACKEND_URL = 'http://localhost:5001/api';

// ─── Role permissions for Add Customer (ported from mobile) ───────────────────
const ROLE_PERMISSIONS = {
  super_admin: {
    canSetCreditLimit: true, maxCreditLimit: null,
    canAssignBranch: true, canAssignAccountId: true,
    canSetPaymentTerms: true, canSetMarketingId: true,
    autoStatus: 'active', submitLabel: '✅ Save Customer',
    badgeLabel: '👑 Super Admin — Full Access', badgeColor: '#DC2626',
  },
  admin: {
    canSetCreditLimit: true, maxCreditLimit: null,
    canAssignBranch: true, canAssignAccountId: false,
    canSetPaymentTerms: true, canSetMarketingId: true,
    autoStatus: 'active', submitLabel: '✅ Save Customer',
    badgeLabel: '💼 Admin — Operational Access', badgeColor: '#EAB308',
  },
  branch_manager: {
    canSetCreditLimit: true, maxCreditLimit: 500000,
    canAssignBranch: false, canAssignAccountId: false,
    canSetPaymentTerms: true, canSetMarketingId: false,
    autoStatus: 'active', submitLabel: '✅ Save Customer',
    badgeLabel: '🏢 Branch Manager — Branch Scope', badgeColor: '#34D399',
  },
  marketing: {
    canSetCreditLimit: false, maxCreditLimit: 0,
    canAssignBranch: false, canAssignAccountId: false,
    canSetPaymentTerms: false, canSetMarketingId: false,
    autoStatus: 'pending_approval', submitLabel: '📤 Submit for Approval',
    badgeLabel: '📣 Marketing Staff — Pending Approval', badgeColor: '#3B82F6',
    showApprovalNote: true,
  },
};

const PAYMENT_TERMS = ['Immediate', 'Net 15', 'Net 30', 'Net 60'];
const BUSINESS_TYPES = ['Retailer', 'Wholesaler', 'Distributor', 'Exporter', 'Importer', 'Other'];
const CUSTOMER_TYPES = ['Import', 'Export', 'Both', 'Local'];
const COUNTRIES = ['Sri Lanka', 'Germany', 'UAE', 'USA', 'UK', 'Singapore', 'India', 'China', 'Other'];

// ─── Mini Select Component ─────────────────────────────────────────────────────
function SelectField({ label, value, options, onChange, icon: Icon }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</label>
      <div className="relative">
        {Icon && <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />}
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-8 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-100 text-xs appearance-none focus:outline-none focus:border-white/30 transition-colors`}
        >
          <option value="">-- Select {label} --</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Locked field ──────────────────────────────────────────────────────────────
function LockedField({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</label>
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-xs text-slate-500 italic">
        <Lock size={11} className="opacity-50 shrink-0" /> {value}
      </div>
    </div>
  );
}

// ─── Input field ──────────────────────────────────────────────────────────────
function InputField({ label, value, onChange, placeholder, type = 'text', icon: Icon }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</label>
      <div className="relative">
        {Icon && <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-colors`}
        />
      </div>
    </div>
  );
}

// ─── Section card inside modal ─────────────────────────────────────────────────
function SectionCard({ title, icon, children }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-slate-900/40 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/6 bg-slate-950/40">
        <span className="text-base">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider opacity-80">{title}</span>
      </div>
      <div className="p-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}

// ─── Permission badge row ──────────────────────────────────────────────────────
function PermRow({ label, allowed, partial }) {
  const color = allowed ? '#4ADE80' : partial ? '#FDE047' : '#F87171';
  const icon = allowed ? '✅' : partial ? '⚠️' : '❌';
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
      <span className="text-[11px] text-slate-400">{label}</span>
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ color, borderColor: color + '55', background: color + '18' }}>
        {icon} {allowed ? 'Yes' : partial ? 'Limited' : 'No'}
      </span>
    </div>
  );
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [theme, setTheme] = useState('lightgreen');

  // Auth
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRole, setLoginRole] = useState('super_admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // App
  const [isOffline, setIsOffline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showBiometrics, setShowBiometrics] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [gpsLocations, setGpsLocations] = useState([
    { lat: 6.9271, lng: 79.8612, name: 'Colombo Head Office' },
    { lat: 6.9312, lng: 79.8592, name: 'Marketing Officer (Moving...)' }
  ]);
  const [offlineQueue, setOfflineQueue] = useState([]);

  // Active tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // ─── Add Customer Modal State ────────────────────────────────────────────────
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [custLoading, setCustLoading] = useState(false);
  const [showPermPanel, setShowPermPanel] = useState(false);

  // Customer form fields
  const [custForm, setCustForm] = useState({
    companyName: '', contactPerson: '', designation: '',
    mobile: '', phone: '', email: '',
    address: '', country: 'Sri Lanka',
    businessType: '', customerType: '', paymentTerms: '',
    creditLimit: '', accountId: '', marketingId: '',
    selectedBranchId: '', notes: '',
  });

  const resetCustForm = () => setCustForm({
    companyName: '', contactPerson: '', designation: '',
    mobile: '', phone: '', email: '',
    address: '', country: 'Sri Lanka',
    businessType: '', customerType: '', paymentTerms: '',
    creditLimit: '', accountId: '', marketingId: '',
    selectedBranchId: '', notes: '',
  });

  // ERP Data
  const [metrics, setMetrics] = useState({
    totalSales: 28625000, totalPurchases: 12200000, totalExpenses: 3150000,
    netProfit: 13275000, pendingPayments: 5700000, activeCustomers: 3,
    stockAlerts: 2, totalCustomers: 3, totalSuppliers: 2, totalStaff: 4, totalBranches: 3
  });
  const [charts, setCharts] = useState({
    dailySales: [
      { date: '06-15', sales: 7500000, purchases: 0 },
      { date: '06-16', sales: 0, purchases: 2000000 },
      { date: '06-17', sales: 0, purchases: 0 },
      { date: '06-18', sales: 4400000, purchases: 0 },
      { date: '06-19', sales: 0, purchases: 3200000 },
      { date: '06-20', sales: 1725000, purchases: 0 },
      { date: '06-21', sales: 15000000, purchases: 7000000 }
    ],
    expenses: [
      { category: 'Fuel', amount: 350000 }, { category: 'Salary', amount: 2000000 },
      { category: 'Office', amount: 150000 }, { category: 'Electricity', amount: 650000 },
    ],
  });

  const [sales, setSales] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [staff, setStaff] = useState([]);
  const [payments, setPayments] = useState([]);

  const [saleForm, setSaleForm] = useState({ customerId: '', productId: '', quantity: 1, unitPrice: 0 });
  const [purchaseForm, setPurchaseForm] = useState({ supplierName: '', productName: '', quantity: 50, costPrice: 1200 });
  const [expenseForm, setExpenseForm] = useState({ description: '', category: 'fuel', amount: '' });
  const [paymentForm, setPaymentForm] = useState({ invoiceNumber: '', amountReceived: '', paymentMethod: 'cash' });
  const [branchForm, setBranchForm] = useState({ name: '', code: '', location: '' });
  const [staffForm, setStaffForm] = useState({ name: '', email: '', password: 'password123', role: 'marketing', branchId: '', commissionRate: 5, salary: 45000 });
  const [salesOrderForm, setSalesOrderForm] = useState({
    customer_name: '', business_type: '', invoice_no: '', invoice_status: 'Pending', amount: '', paid_amount: '',
    outstanding_amount: '', branch_id: '', account_id: '', marketing_id: ''
  });
  const [editSalesOrderId, setEditSalesOrderId] = useState(null);

  // Mock fallback
  const generateMockFallback = () => {
    setProducts([
      { _id: 'p_tea', name: 'Premium Ceylon Tea (1kg)', sku: 'PRD-TEA-001', currentStock: 1500, buyPrice: 1200, sellPrice: 2100, lowStockThreshold: 100, category: 'Agriculture' },
      { _id: 'p_cinnamon', name: 'Organic Cinnamon Quills (500g)', sku: 'PRD-CIN-002', currentStock: 80, buyPrice: 2500, sellPrice: 3800, lowStockThreshold: 100, category: 'Spices' },
      { _id: 'p_pepper', name: 'Black Pepper Whole (1kg)', sku: 'PRD-PEP-003', currentStock: 450, buyPrice: 1600, sellPrice: 2450, lowStockThreshold: 50, category: 'Spices' },
      { _id: 'p_cardamom', name: 'Green Cardamom Pods (250g)', sku: 'PRD-CAR-004', currentStock: 30, buyPrice: 3200, sellPrice: 4800, lowStockThreshold: 50, category: 'Spices' },
    ]);
    setCustomers([
      { _id: 'c_goldex', name: 'Goldex Global Imports LLC', mobile: '+14155552671', address: 'San Francisco, CA, USA', businessType: 'Wholesaler', customerType: 'Import', country: 'USA', contactPerson: 'John Doe', email: 'john@goldex.com', outstandingBalance: 450000, branchId: 'b_colombo', status: 'active', paymentTerms: 'Net 30' },
      { _id: 'c_eurofoods', name: 'EuroFoods Hamburg Gmbh', mobile: '+49405559812', address: 'Hamburg, Germany', businessType: 'Distributor', customerType: 'Export', country: 'Germany', contactPerson: 'Hans Mueller', email: 'hans@eurofoods.de', outstandingBalance: 0, branchId: 'b_colombo', status: 'active', paymentTerms: 'Net 15' },
      { _id: 'c_asiafood', name: 'AsiaFood Import KK', mobile: '+81355556290', address: 'Tokyo, Japan', businessType: 'Retailer', customerType: 'Both', country: 'Japan', contactPerson: 'Tanaka San', email: 'tanaka@asiafood.jp', outstandingBalance: 120000, branchId: 'b_colombo', status: 'active', paymentTerms: 'Net 60' },
    ]);
    setSales([
      { _id: 's_01', invoiceNumber: 'INV-20260615-001', customerId: 'c_goldex', customerName: 'Goldex Global Imports LLC', totalAmount: 750000, paidAmount: 300000, outstandingAmount: 450000, deliveryStatus: 'completed', paymentStatus: 'partially_paid', createdAt: '2026-06-15T10:00:00Z' },
      { _id: 's_02', invoiceNumber: 'INV-20260618-002', customerId: 'c_eurofoods', customerName: 'EuroFoods Hamburg Gmbh', totalAmount: 440000, paidAmount: 440000, outstandingAmount: 0, deliveryStatus: 'delivered', paymentStatus: 'paid', createdAt: '2026-06-18T14:30:00Z' },
      { _id: 's_03', invoiceNumber: 'INV-20260620-003', customerId: 'c_asiafood', customerName: 'AsiaFood Import KK', totalAmount: 172500, paidAmount: 52500, outstandingAmount: 120000, deliveryStatus: 'on_going', paymentStatus: 'partially_paid', createdAt: '2026-06-20T09:15:00Z' },
    ]);
    setPurchases([
      { _id: 'po_01', poNumber: 'PO-20260610-001', supplierName: 'Nuwara Eliya Tea Estates', totalAmount: 2400000, paymentStatus: 'paid', createdAt: '2026-06-10T08:00:00Z' },
    ]);
    setExpenses([
      { _id: 'e_01', date: '2026-06-16T12:00:00Z', description: 'Vehicle fuel for marketing trip', category: 'fuel', amount: 35000 },
      { _id: 'e_02', date: '2026-06-17T09:00:00Z', description: 'Office electricity bill June', category: 'electricity', amount: 65000 },
    ]);
    setBranches([
      { _id: 'b_colombo', name: 'Colombo Head Office', code: 'COL-01', location: 'Colombo, Sri Lanka', status: 'active' },
      { _id: 'b_galle', name: 'Galle Southern Branch', code: 'GAL-02', location: 'Galle, Sri Lanka', status: 'active' },
      { _id: 'b_kandy', name: 'Kandy Hill Branch', code: 'KAN-03', location: 'Kandy, Sri Lanka', status: 'active' },
    ]);
    setStaff([
      { _id: 'u_superadmin', name: 'Super Admin Owner', email: 'superadmin@erp.com', role: 'super_admin', salary: 150000, status: 'active' },
      { _id: 'u_admin', name: 'Admin Manager', email: 'admin@erp.com', role: 'admin', salary: 80000, status: 'active' },
      { _id: 'u_manager', name: 'Colombo Branch Manager', email: 'manager@erp.com', role: 'branch_manager', salary: 95000, status: 'active' },
      { _id: 'u_marketing', name: 'Marketing Officer', email: 'marketing@erp.com', role: 'marketing', salary: 45000, status: 'active' },
    ]);
  };

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [metricsRes, salesRes, productsRes, custRes, expRes, branchRes, staffRes, purchaseRes, paymentsRes, salesOrdersRes] = await Promise.all([
        fetch(`${BACKEND_URL}/reports/dashboard`, { headers }).then(r => r.json()),
        fetch(`${BACKEND_URL}/sales`, { headers }).then(r => r.json()),
        fetch(`${BACKEND_URL}/products`, { headers }).then(r => r.json()),
        fetch(`${BACKEND_URL}/customers`, { headers }).then(r => r.json()),
        fetch(`${BACKEND_URL}/expenses`, { headers }).then(r => r.json()),
        fetch(`${BACKEND_URL}/branches`, { headers }).then(r => r.json()),
        fetch(`${BACKEND_URL}/staff`, { headers }).then(r => r.status === 403 ? { success: true, data: [] } : r.json()).catch(() => ({ success: true, data: [] })),
        fetch(`${BACKEND_URL}/purchases`, { headers }).then(r => r.json()),
        fetch(`${BACKEND_URL}/payments`, { headers }).then(r => r.json()),
        fetch(`${BACKEND_URL}/sales-orders`, { headers }).then(r => r.json()),
      ]);
      if (metricsRes.success) { setMetrics(metricsRes.metrics); setCharts(metricsRes.charts); }
      if (salesRes.success) setSales(salesRes.data);
      if (productsRes.success) setProducts(productsRes.data);
      if (custRes.success) setCustomers(custRes.data);
      if (expRes.success) setExpenses(expRes.data);
      if (branchRes.success) setBranches(branchRes.data);
      if (staffRes.success && staffRes.data.length) setStaff(staffRes.data);
      if (purchaseRes.success) setPurchases(purchaseRes.data);
      if (paymentsRes.success) setPayments(paymentsRes.data);
      if (salesOrdersRes.success) setSalesOrders(salesOrdersRes.data);
    } catch (error) {
      console.warn('API error, using mock data:', error.message);
      generateMockFallback();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.body.className = '';
    document.body.classList.add('dark', 'bg-slate-950', 'text-slate-100', `theme-${theme}`);
  }, [theme, isDarkMode]);

  useEffect(() => {
    if (token) { fetchData(); }
    const gpsInterval = setInterval(() => {
      setGpsLocations(prev => {
        const next = [...prev];
        next[1] = { ...next[1], lat: 6.9312 + (Math.random() - 0.5) * 0.005, lng: 79.8592 + (Math.random() - 0.5) * 0.005 };
        return next;
      });
    }, 8000);
    return () => clearInterval(gpsInterval);
  }, [token]);

  const syncOfflineQueue = async () => {
    if (!offlineQueue.length) return;
    setIsLoading(true);
    alert(`📶 Internet restored! Synchronizing ${offlineQueue.length} offline transactions...`);
    for (const item of offlineQueue) {
      try {
        await fetch(`${BACKEND_URL}/${item.url}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(item.body) });
      } catch (e) { console.warn('Sync item failed:', item); }
    }
    setOfflineQueue([]);
    alert('✅ Sync completed.');
    fetchData();
  };

  useEffect(() => { if (!isOffline && offlineQueue.length > 0) syncOfflineQueue(); }, [isOffline]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    const emailInput = loginEmail.trim().toLowerCase();
    if (!emailInput || !loginPassword) { setLoginError('Please enter both email and password.'); setIsLoading(false); return; }
    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: emailInput, password: loginPassword }) }).then(r => r.json());
      if (res.success) {
        setToken(res.token); setCurrentUser(res.user);
        if (res.user.role === 'super_admin') setTheme('red');
        else if (res.user.role === 'admin') setTheme('yellow');
        else setTheme('lightgreen');
      } else {
        throw new Error(res.message || 'Invalid credentials.');
      }
    } catch (err) {
      const mockUsers = [
        { id: 'u_superadmin', name: 'Super Admin Owner', email: 'superadmin@testraa.lk', password: 'admin123', role: 'super_admin', branchId: 'b_colombo' },
        { id: 'u_admin', name: 'Admin Manager', email: 'admin@testraa.lk', password: 'admin123', role: 'admin', branchId: 'b_colombo' },
        { id: 'u_manager', name: 'Colombo Branch Manager', email: 'manager@testraa.lk', password: 'admin123', role: 'branch_manager', branchId: 'b_colombo' },
        { id: 'u_marketing', name: 'Marketing Officer', email: 'marketing@testraa.lk', password: 'admin123', role: 'marketing', branchId: 'b_colombo' },
      ];
      const found = mockUsers.find(u => u.email === emailInput && u.password === loginPassword);
      if (found) {
        setToken('simulated_jwt');
        setCurrentUser({ id: found.id, name: found.name, email: found.email, role: found.role, branchId: found.branchId });
        if (found.role === 'super_admin') setTheme('red');
        else if (found.role === 'admin') setTheme('yellow');
        else setTheme('lightgreen');
        generateMockFallback();
      } else setLoginError('Invalid email or password. Use demo credentials.');
    } finally { setIsLoading(false); }
  };

  const handleLogout = () => { setCurrentUser(null); setToken(null); setLoginEmail(''); setLoginPassword(''); setLoginError(''); };

  const autofillDemo = (roleKey) => {
    setLoginRole(roleKey);
    const creds = {
      super_admin: { email: 'superadmin@testraa.lk', pass: 'admin123', theme: 'red' },
      admin: { email: 'admin@testraa.lk', pass: 'admin123', theme: 'yellow' },
      branch_manager: { email: 'manager@testraa.lk', pass: 'admin123', theme: 'lightgreen' },
      marketing: { email: 'marketing@testraa.lk', pass: 'admin123', theme: 'lightgreen' },
    };
    const t = creds[roleKey];
    setLoginEmail(t.email); setLoginPassword(t.pass); setTheme(t.theme);
  };

  // ─── Add Customer Submit ───────────────────────────────────────────────────────
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!custForm.companyName || !custForm.contactPerson || !custForm.mobile) {
      alert('Company name, contact person, and mobile are required.'); return;
    }
    const perm = ROLE_PERMISSIONS[currentUser.role];
    setCustLoading(true);

    const payload = {
      companyName: custForm.companyName, contactPerson: custForm.contactPerson,
      designation: custForm.designation, mobile: custForm.mobile, phone: custForm.phone,
      email: custForm.email, address: custForm.address, country: custForm.country,
      businessType: custForm.businessType, customerType: custForm.customerType,
      paymentTerms: perm.canSetPaymentTerms ? custForm.paymentTerms : undefined,
      creditLimit: perm.canSetCreditLimit ? parseFloat(custForm.creditLimit) || 0 : 0,
      accountId: perm.canAssignAccountId ? custForm.accountId : undefined,
      marketingId: perm.canSetMarketingId ? custForm.marketingId : currentUser.role === 'marketing' ? currentUser.id : undefined,
      branchId: perm.canAssignBranch ? custForm.selectedBranchId || currentUser.branchId : currentUser.branchId,
      notes: custForm.notes,
      status: perm.autoStatus,
      createdRole: currentUser.role,
    };

    try {
      const res = await fetch(`${BACKEND_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      }).then(r => r.json());

      if (res.success) {
        alert(`✅ Customer "${custForm.companyName}" saved successfully!`);
        fetchData();
      } else {
        // Offline/mock: add locally
        throw new Error(res.message || 'Server error');
      }
    } catch {
      // Add locally in mock mode
      const newCust = {
        _id: 'c_' + Date.now(),
        name: custForm.companyName,
        mobile: custForm.mobile,
        address: custForm.address,
        businessType: custForm.businessType,
        customerType: custForm.customerType,
        country: custForm.country,
        contactPerson: custForm.contactPerson,
        email: custForm.email,
        outstandingBalance: 0,
        branchId: payload.branchId,
        status: perm.autoStatus,
        paymentTerms: custForm.paymentTerms,
      };
      setCustomers(prev => [...prev, newCust]);
      setMetrics(prev => ({ ...prev, totalCustomers: prev.totalCustomers + 1, activeCustomers: prev.activeCustomers + (perm.autoStatus === 'active' ? 1 : 0) }));
      alert(perm.autoStatus === 'pending_approval'
        ? `📤 Customer "${custForm.companyName}" submitted for approval!`
        : `✅ Customer "${custForm.companyName}" added successfully!`
      );
    } finally {
      setCustLoading(false);
      setShowAddCustomer(false);
      resetCustForm();
    }
  };

  const handleCreateSale = async (e) => {
    e.preventDefault();
    const prod = products.find(p => p._id === saleForm.productId);
    const cust = customers.find(c => c._id === saleForm.customerId);
    if (!prod || !cust) return alert('Select customer and product!');
    if (prod.currentStock < saleForm.quantity) return alert(`Insufficient stock! Only ${prod.currentStock} left.`);
    const price = parseFloat(saleForm.unitPrice) || prod.sellPrice;
    const body = { customerId: saleForm.customerId, products: [{ productId: saleForm.productId, quantity: parseInt(saleForm.quantity), unitPrice: price }], paidAmount: 0 };

    if (isOffline) {
      setOfflineQueue(prev => [...prev, { url: 'sales', body }]);
      setSales(prev => [...prev, { _id: 'temp_' + Date.now(), invoiceNumber: 'INV-TEMP-OFFLINE', customerName: cust.name, totalAmount: saleForm.quantity * price, paidAmount: 0, outstandingAmount: saleForm.quantity * price, deliveryStatus: 'pending', paymentStatus: 'unpaid', createdAt: new Date().toISOString() }]);
      alert('Offline Mode: Sale queued for sync.');
    } else {
      setIsLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/sales`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) }).then(r => r.json());
        if (res.success) { alert(`Invoice ${res.data.invoiceNumber} created!`); fetchData(); }
        else alert(res.message);
      } catch { alert('Server unreachable.'); } finally { setIsLoading(false); }
    }
    setSaleForm({ customerId: '', productId: '', quantity: 1, unitPrice: 0 });
  };

  const handleCreatePurchase = async (e) => {
    e.preventDefault();
    if (!purchaseForm.supplierName || !purchaseForm.productName) return alert('Fill all purchase fields');
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/purchases`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(purchaseForm) }).then(r => r.json());
      if (res.success) { alert(`PO ${res.data.poNumber} created. Stock increased!`); fetchData(); }
    } catch { alert('Failed to connect.'); } finally { setIsLoading(false); }
    setPurchaseForm({ supplierName: '', productName: '', quantity: 50, costPrice: 1200 });
  };

  const handleCreateSalesOrder = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = editSalesOrderId ? `${BACKEND_URL}/sales-orders/${editSalesOrderId}` : `${BACKEND_URL}/sales-orders`;
      const method = editSalesOrderId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(salesOrderForm)
      }).then(r => r.json());
      if (res.success) {
        alert(editSalesOrderId ? 'Sales Order Updated!' : 'Sales Order Created!');
        fetchData();
        setSalesOrderForm({ customer_name: '', business_type: 'Retail', invoice_no: '', invoice_status: 'Pending', amount: '', branch_id: '', account_id: '', marketing_id: '' });
        setEditSalesOrderId(null);
      } else {
        throw new Error(res.message || 'Server error');
      }
    } catch (err) {
      console.error(err);
      if (isOffline || token === 'simulated_jwt' || err.message === 'Failed to fetch') {
        const amountVal = parseFloat(salesOrderForm.amount) || 0;
        const paidVal = parseFloat(salesOrderForm.paid_amount) || 0;
        const newOrder = {
          _id: 'so_' + Date.now(),
          order_no: 'SO-TEMP-' + Math.floor(Math.random() * 1000),
          order_date: new Date().toISOString(),
          customer_name: salesOrderForm.customer_name,
          business_type: salesOrderForm.business_type,
          invoice_no: salesOrderForm.invoice_no,
          invoice_status: salesOrderForm.invoice_status,
          amount: amountVal,
          paid_amount: paidVal, // புதிய புலம் (இதைச் சேர்க்கவும்)
          outstanding_amount: Math.max(0, amountVal - paidVal),
          branch_id: salesOrderForm.branch_id || currentUser.branchId,
          account_id: salesOrderForm.account_id,
          marketing_id: salesOrderForm.marketing_id || (currentUser.role === 'marketing' ? currentUser.id : ''),
          created_role: currentUser.role
        };
        if (editSalesOrderId) {
          setSalesOrders(prev => prev.map(o => (o._id === editSalesOrderId || o.id === editSalesOrderId) ? { ...o, ...newOrder, _id: o._id, id: o.id } : o));
          alert('Offline Mode: Sales Order Updated locally!');
        } else {
          setSalesOrders(prev => [newOrder, ...prev]);
          alert('Offline Mode: Sales Order Created locally!');
        }
        setSalesOrderForm({ customer_name: '', business_type: 'Retail', invoice_no: '', invoice_status: 'Pending', amount: '', branch_id: '', account_id: '', marketing_id: '' });
        setEditSalesOrderId(null);
      } else {
        alert('Error: ' + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSalesOrder = (order) => {
    setEditSalesOrderId(order._id || order.id);
    setSalesOrderForm({
      customer_name: order.customer_name || '',
      business_type: order.business_type || 'Retail',
      invoice_no: order.invoice_no || '',
      invoice_status: order.invoice_status || 'Pending',
      amount: order.amount || '',
      branch_id: order.branch_id || '',
      account_id: order.account_id || '',
      marketing_id: order.marketing_id || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteSalesOrder = async (id) => {
    if (currentUser.role !== 'super_admin' && currentUser.role !== 'admin') return alert('Access Denied');
    if (!confirm('Delete this Sales Order?')) return;
    setIsLoading(true);
    try {
      await fetch(`${BACKEND_URL}/sales-orders/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      alert('Order deleted.'); fetchData();
    } catch { alert('Failed.'); } finally { setIsLoading(false); }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.description || !expenseForm.amount) return alert('Fill expense fields');
    const body = { description: expenseForm.description, category: expenseForm.category, amount: parseFloat(expenseForm.amount) };
    if (isOffline) {
      setOfflineQueue(prev => [...prev, { url: 'expenses', body }]);
      setExpenses(prev => [...prev, { _id: 'temp_' + Date.now(), ...body, date: new Date().toISOString() }]);
      alert('Offline: Expense queued.');
    } else {
      setIsLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/expenses`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(body) }).then(r => r.json());
        if (res.success) { alert('Expense logged.'); fetchData(); }
      } catch { alert('Failed.'); } finally { setIsLoading(false); }
    }
    setExpenseForm({ description: '', category: 'fuel', amount: '' });
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.invoiceNumber || !paymentForm.amountReceived) return alert('Fill payment details');
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/payments`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(paymentForm) }).then(r => r.json());
      if (res.success) { alert('Payment recorded!'); fetchData(); }
      else alert(res.message);
    } catch { alert('Error updating payment.'); } finally { setIsLoading(false); }
    setPaymentForm({ invoiceNumber: '', amountReceived: '', paymentMethod: 'cash' });
  };

  const handleCreateBranch = async (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'super_admin') return alert('Access Denied');
    if (!branchForm.name || !branchForm.code || !branchForm.location) return alert('Fill all fields');
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/branches`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(branchForm) }).then(r => r.json());
      if (res.success) { alert('Branch established!'); fetchData(); }
      else alert(res.message);
    } catch { alert('Failed to connect.'); } finally { setIsLoading(false); }
    setBranchForm({ name: '', code: '', location: '' });
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'super_admin') return alert('Access Denied');
    if (!staffForm.name || !staffForm.email) return alert('Fill staff credentials');
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/staff`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(staffForm) }).then(r => r.json());
      if (res.success) { alert('Staff recruited!'); fetchData(); }
      else alert(res.message);
    } catch { alert('Error.'); } finally { setIsLoading(false); }
    setStaffForm({ name: '', email: '', password: 'password123', role: 'marketing', branchId: '', commissionRate: 5, salary: 45000 });
  };

  const deleteSaleOrder = async (id) => {
    if (currentUser?.role !== 'super_admin') return alert('Access Denied');
    if (!confirm('Cancel this order?')) return;
    setIsLoading(true);
    try {
      await fetch(`${BACKEND_URL}/sales/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      alert('Order cancelled.'); fetchData();
    } catch { alert('Failed.'); } finally { setIsLoading(false); }
  };

  const formatLKR = (amount) => 'Rs. ' + Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const getRoleBadgeColor = (role) => {
    if (role === 'super_admin') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (role === 'admin') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    if (role === 'branch_manager') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  };
  const getRoleLabel = (r) => {
    if (r === 'super_admin') return '👑 Super Admin';
    if (r === 'admin') return '👨‍💼 Operational Admin';
    if (r === 'branch_manager') return '🏢 Branch Manager';
    return '💼 Marketing Officer';
  };
  const COLORS_LIST = ['#EF4444', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];

  // ─── LOGIN SCREEN ──────────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 bg-gradient-to-tr from-red-600 to-yellow-500 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-10 bg-gradient-to-tr from-emerald-500 to-yellow-400 pointer-events-none"></div>

        <div className="flex flex-col items-center gap-3 mb-6 text-center z-10">
          <div className="p-3 bg-slate-900/80 rounded-3xl border border-white/10 shadow-2xl">
            <img src={logoImg} className="w-20 h-20 object-contain" alt="TESTRAA Logo" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight font-serif uppercase">TESTRAA</h1>
            <div className="h-0.5 w-24 mx-auto my-2 rounded bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-400"></div>
            <p className="text-[11px] opacity-60 uppercase tracking-widest font-bold">Enterprise Resource Planning Portal</p>
          </div>
        </div>

        <div className="glass-card w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl z-10">
          <div className="grid grid-cols-4 border-b border-white/5 bg-slate-900/60 p-1.5 gap-1">
            {[
              { id: 'super_admin', label: 'Super Admin', icon: '👑' },
              { id: 'admin', label: 'Admin', icon: '💼' },
              { id: 'branch_manager', label: 'Manager', icon: '🏢' },
              { id: 'marketing', label: 'Marketing', icon: '📣' }
            ].map(portal => (
              <button key={portal.id} onClick={() => { setLoginRole(portal.id); autofillDemo(portal.id); setLoginError(''); }}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-300 ${loginRole === portal.id ? 'bg-slate-950/80 shadow-inner border border-white/10 text-slate-100' : 'opacity-50 hover:opacity-80 text-slate-400'}`}>
                <span className="text-lg mb-0.5">{portal.icon}</span>
                <span className="text-[9px] font-bold tracking-wider uppercase text-center">{portal.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6 flex flex-col gap-5">
            <div className={`p-4 rounded-2xl border text-xs ${loginRole === 'super_admin' ? 'bg-red-500/5 border-red-500/20 text-red-200' : loginRole === 'admin' ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-200' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-200'}`}>
              <div className="flex gap-2.5 items-start">
                <Shield size={16} className="shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold uppercase tracking-wider mb-1">{loginRole.replace('_', ' ')} Portal</h4>
                  <p className="opacity-75">
                    {loginRole === 'super_admin' && 'Complete corporate privileges — branches, staff, invoices, payroll.'}
                    {loginRole === 'admin' && 'Operational management — inventory, payments, expenses, reports.'}
                    {loginRole === 'branch_manager' && 'Branch scope — sales invoices, local expenses, customer management.'}
                    {loginRole === 'marketing' && 'Field operations — add customers, generate invoices, GPS tracking.'}
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="block mb-1 opacity-70 font-semibold uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={14} className="absolute inset-y-0 left-0 ml-3.5 my-auto text-slate-400 pointer-events-none" />
                  <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="name@testraa.lk"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-slate-100 focus:outline-none focus:border-white/25" required />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="opacity-70 font-semibold uppercase tracking-wider">Password</label>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="opacity-50 hover:opacity-100 transition-opacity text-[10px] flex items-center gap-1">
                    {showPassword ? <><EyeOff size={10} /> Hide</> : <><Eye size={10} /> Show</>}
                  </button>
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute inset-y-0 left-0 ml-3.5 my-auto text-slate-400 pointer-events-none" />
                  <input type={showPassword ? 'text' : 'password'} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-slate-100 focus:outline-none focus:border-white/25" required />
                </div>
              </div>
              {loginError && <div className="text-red-400 bg-red-950/30 border border-red-500/20 p-3 rounded-xl text-center font-medium">⚠️ {loginError}</div>}
              <button type="submit" disabled={isLoading}
                className="w-full py-3.5 rounded-xl text-slate-950 font-bold transition-all flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary-hex) 50%, var(--primary-dark) 100%)' }}>
                {isLoading ? <><RefreshCw size={16} className="animate-spin" /><span>Authenticating...</span></> : <><span>Enter Dashboard</span><ChevronRight size={16} /></>}
              </button>
            </form>

            <div className="border-t border-white/5 pt-4 flex flex-wrap gap-1.5 justify-center">
              {[
                { id: 'super_admin', label: 'Super Admin', style: 'border-red-900 hover:bg-red-950/20 text-red-400' },
                { id: 'admin', label: 'Admin', style: 'border-yellow-900 hover:bg-yellow-950/20 text-yellow-400' },
                { id: 'branch_manager', label: 'Branch Manager', style: 'border-emerald-900 hover:bg-emerald-950/20 text-emerald-400' },
                { id: 'marketing', label: 'Marketing', style: 'border-blue-900 hover:bg-blue-950/20 text-blue-400' },
              ].map(d => (
                <button key={d.id} onClick={() => { autofillDemo(d.id); setLoginError(''); }} className={`text-[9px] font-bold px-2 py-1.5 rounded-lg border transition-all ${d.style}`}>
                  Demo: {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-[10px] opacity-40 mt-6 z-10">TESTRAA ERP v2.0 • Sri Lanka • Red / Yellow / Green Theme</p>
      </div>
    );
  }

  // ─── CURRENT ROLE PERMISSIONS ──────────────────────────────────────────────────
  const perm = ROLE_PERMISSIONS[currentUser.role] || ROLE_PERMISSIONS.marketing;

  // ─── ADD CUSTOMER MODAL ────────────────────────────────────────────────────────
  const AddCustomerModal = () => (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl my-4">
        <div className="glass-card rounded-3xl overflow-hidden shadow-2xl border" style={{ borderColor: 'rgba(var(--p), 0.25)' }}>
          {/* Modal Header */}
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'rgba(var(--p), 0.15)', background: 'linear-gradient(135deg, rgba(var(--p),0.12) 0%, rgba(var(--p),0.04) 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ background: 'rgba(var(--p),0.2)' }}>
                <UserPlus size={20} style={{ color: 'var(--primary-hex)' }} />
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--primary-light)' }}>Add New Customer</h2>
                <p className="text-[10px] opacity-60">Complete customer profile — role-restricted fields applied automatically</p>
              </div>
            </div>
            <button onClick={() => { setShowAddCustomer(false); resetCustForm(); }}
              className="p-2 rounded-xl bg-slate-900/60 hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-all border border-white/5">
              <X size={16} />
            </button>
          </div>

          {/* Role Badge & Permission Toggle */}
          <div className="px-5 pt-4 flex items-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold" style={{ borderColor: perm.badgeColor + '55', color: perm.badgeColor, background: perm.badgeColor + '18' }}>
              {perm.badgeLabel}
            </div>
            <button onClick={() => setShowPermPanel(!showPermPanel)}
              className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:border-white/25 transition-all flex items-center gap-1.5">
              <Shield size={10} /> {showPermPanel ? 'Hide' : 'View'} Permissions
            </button>
          </div>

          {/* Permission panel */}
          {showPermPanel && (
            <div className="mx-5 mt-3 p-4 rounded-2xl bg-slate-900/60 border border-white/8">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-3">Role Access Matrix</p>
              <PermRow label="Set Credit Limit" allowed={perm.canSetCreditLimit} partial={perm.maxCreditLimit !== null && perm.canSetCreditLimit} />
              <PermRow label="Assign Branch" allowed={perm.canAssignBranch} />
              <PermRow label="Set Account ID" allowed={perm.canAssignAccountId} />
              <PermRow label="Assign Marketing ID" allowed={perm.canSetMarketingId} />
              <PermRow label="Set Payment Terms" allowed={perm.canSetPaymentTerms} />
              <PermRow label="Instant Approval" allowed={perm.autoStatus === 'active'} />
            </div>
          )}

          {perm.showApprovalNote && (
            <div className="mx-5 mt-3 p-3 rounded-xl bg-yellow-950/40 border border-yellow-500/30 text-xs text-yellow-200">
              ⚠️ As Marketing Staff, new customers require Admin approval before they become active.
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAddCustomer} className="p-5 flex flex-col gap-4">
            <SectionCard title="Company Information" icon="🏢">
              <InputField label="Company Name *" value={custForm.companyName} onChange={v => setCustForm(p => ({ ...p, companyName: v }))} placeholder="e.g. Goldex Global Imports LLC" icon={Building2} />
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Customer Type" value={custForm.customerType} options={CUSTOMER_TYPES} onChange={v => setCustForm(p => ({ ...p, customerType: v }))} />
                <SelectField label="Business Type" value={custForm.businessType} options={BUSINESS_TYPES} onChange={v => setCustForm(p => ({ ...p, businessType: v }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Country" value={custForm.country} options={COUNTRIES} onChange={v => setCustForm(p => ({ ...p, country: v }))} icon={Globe} />
                <InputField label="Address" value={custForm.address} onChange={v => setCustForm(p => ({ ...p, address: v }))} placeholder="Street, City" icon={MapPin} />
              </div>
            </SectionCard>

            <SectionCard title="Contact Details" icon="📋">
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Contact Person *" value={custForm.contactPerson} onChange={v => setCustForm(p => ({ ...p, contactPerson: v }))} placeholder="Full name" icon={Users} />
                <InputField label="Designation" value={custForm.designation} onChange={v => setCustForm(p => ({ ...p, designation: v }))} placeholder="e.g. Procurement Manager" icon={Briefcase} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Mobile *" value={custForm.mobile} onChange={v => setCustForm(p => ({ ...p, mobile: v }))} placeholder="+94 77 000 0000" icon={Phone} />
                <InputField label="Office Phone" value={custForm.phone} onChange={v => setCustForm(p => ({ ...p, phone: v }))} placeholder="+94 11 000 0000" icon={Phone} />
              </div>
              <InputField label="Email" value={custForm.email} onChange={v => setCustForm(p => ({ ...p, email: v }))} placeholder="contact@company.com" type="email" icon={Mail} />
            </SectionCard>

            <SectionCard title="Financial Settings" icon="💰">
              {perm.canSetCreditLimit
                ? <InputField label={`Credit Limit (Rs.)${perm.maxCreditLimit ? ' — Max: Rs.' + perm.maxCreditLimit.toLocaleString() : ''}`} value={custForm.creditLimit} onChange={v => setCustForm(p => ({ ...p, creditLimit: v }))} placeholder="0.00" type="number" icon={CreditCard} />
                : <LockedField label="Credit Limit (Rs.)" value="Set by Admin only 🔒" />
              }
              {perm.canSetPaymentTerms
                ? <SelectField label="Payment Terms" value={custForm.paymentTerms} options={PAYMENT_TERMS} onChange={v => setCustForm(p => ({ ...p, paymentTerms: v }))} />
                : <LockedField label="Payment Terms" value="Set by Admin only 🔒" />
              }
            </SectionCard>

            <SectionCard title="Branch & Assignment" icon="🏬">
              {perm.canAssignBranch
                ? <SelectField label="Assign to Branch" value={branches.find(b => b._id === custForm.selectedBranchId)?.name || ''} options={branches.map(b => b.name)} onChange={name => { const f = branches.find(b => b.name === name); setCustForm(p => ({ ...p, selectedBranchId: f?._id || '' })); }} icon={Building2} />
                : <LockedField label="Branch" value={`${currentUser.branchId} (Auto — Your Branch) 🔒`} />
              }
              {perm.canAssignAccountId
                ? <InputField label="Account ID" value={custForm.accountId} onChange={v => setCustForm(p => ({ ...p, accountId: v }))} placeholder="ACC-001" icon={Hash} />
                : <LockedField label="Account ID" value="Assigned by Admin 🔒" />
              }
              {perm.canSetMarketingId
                ? <InputField label="Marketing Staff ID" value={custForm.marketingId} onChange={v => setCustForm(p => ({ ...p, marketingId: v }))} placeholder="MKT-001" icon={Tag} />
                : <LockedField label="Marketing Staff" value={currentUser.role === 'marketing' ? `${currentUser.name} (Auto) 🔒` : 'Auto-assigned 🔒'} />
              }
              <LockedField label="Customer Status (Auto)" value={perm.autoStatus === 'active' ? '✅ Active (Approved)' : '⏳ Pending Admin Approval'} />
            </SectionCard>

            <SectionCard title="Notes" icon="📝">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-60">Remarks / Source</label>
                <textarea value={custForm.notes} onChange={e => setCustForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder={currentUser.role === 'marketing' ? 'e.g. Met at trade fair, interested in bulk spice order...' : 'Any additional notes about this customer...'}
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-100 text-xs placeholder:text-slate-600 focus:outline-none focus:border-white/30 transition-colors resize-none" />
              </div>
            </SectionCard>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setShowAddCustomer(false); resetCustForm(); }}
                className="flex-1 py-3 rounded-xl border border-white/15 text-slate-300 hover:bg-white/5 transition-all text-sm font-bold">
                Cancel
              </button>
              <button type="submit" disabled={custLoading}
                className="flex-[2] py-3 rounded-xl text-slate-950 font-bold transition-all flex items-center justify-center gap-2 text-sm hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--primary-hex) 50%, var(--primary-dark) 100%)', boxShadow: '0 4px 20px rgba(var(--p), 0.4)' }}>
                {custLoading ? <><RefreshCw size={15} className="animate-spin" /> Saving...</> : <><UserPlus size={15} />{perm.submitLabel}</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // ─── NAV TABS ──────────────────────────────────────────────────────────────────
  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'sales', label: 'Sales', icon: FileText },
    { id: 'sales_orders', label: 'Sales Orders', icon: ClipboardList },
    { id: 'stock', label: 'Stock', icon: AlertTriangle },
    { id: 'operations', label: 'Operations', icon: Settings },
  ];

  // ─── MAIN DASHBOARD ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, rgb(11,15,25) 0%, rgb(15,23,42) 100%)' }}>
      <div className="fixed top-0 left-0 right-0 h-[3px] z-50" style={{ background: 'linear-gradient(90deg, var(--primary-dark), var(--primary-hex), var(--primary-light), var(--primary-hex), var(--primary-dark))' }}></div>

      {/* Header */}
      <header className="glass-panel sticky top-[3px] z-40 border-b px-4 md:px-6 py-3.5 flex flex-wrap justify-between items-center gap-3 shadow-xl" style={{ borderBottomColor: 'rgba(var(--p), 0.2)' }}>
        <div className="flex items-center gap-3 order-1">
          <div className="w-11 h-11 rounded-xl bg-slate-900/60 p-1 flex items-center justify-center border border-white/10">
            <img src={logoImg} className="w-9 h-9 object-contain" alt="TESTRAA" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight uppercase font-serif">TESTRAA</h1>
            <p className="text-[10px] opacity-60 uppercase tracking-widest font-bold">Export & Import ERP</p>
          </div>
        </div>

        {/* Nav Tabs */}
        <nav className="flex w-full md:w-auto overflow-x-auto items-center gap-1 bg-slate-900/60 p-1 rounded-2xl border border-white/5 order-3 md:order-2 mt-1 md:mt-0">
          {navTabs.map(tab => {
            const TabIcon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${activeTab === tab.id ? 'text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                style={activeTab === tab.id ? { background: 'linear-gradient(135deg, var(--primary-light), var(--primary-hex))' } : {}}>
                <TabIcon size={13} />
                {tab.label}
                {tab.id === 'customers' && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/20 font-bold">{customers.length}</span>}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2.5 flex-wrap order-2 md:order-3">
          <div className="flex items-center gap-2 bg-slate-900/60 py-1.5 px-3 rounded-xl border border-white/5 text-xs">
            <span className="font-bold text-slate-100">{currentUser.name}</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${getRoleBadgeColor(currentUser.role)}`}>{currentUser.role.replace('_', ' ').toUpperCase()}</span>
          </div>

          {/* Theme switcher */}
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
            {[{ id: 'red', color: 'bg-red-600' }, { id: 'yellow', color: 'bg-yellow-500' }, { id: 'lightgreen', color: 'bg-emerald-500' }].map(t => (
              <button key={t.id} onClick={() => setTheme(t.id)} className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${theme === t.id ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                <span className={`w-3.5 h-3.5 rounded-sm ${t.color}`}></span>
              </button>
            ))}
          </div>

          <button onClick={() => setIsOffline(!isOffline)} className={`flex items-center gap-1 text-xs px-2.5 py-2 rounded-xl border transition-all ${isOffline ? 'bg-rose-950/40 text-rose-400 border-rose-800' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800'}`}>
            <Network size={13} className={isOffline ? '' : 'animate-pulse'} />
            <span className="font-bold text-[11px] hidden sm:inline">{isOffline ? 'Offline' : 'Online'}</span>
          </button>

          <button onClick={() => setShowBiometrics(true)} className="p-2 rounded-xl glass-btn text-slate-400" title="Biometrics"><Smartphone size={15} /></button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-xl glass-btn text-slate-400">{isDarkMode ? <Sun size={15} /> : <Moon size={15} />}</button>
          <button onClick={fetchData} className="p-2 rounded-xl glass-btn text-slate-400" disabled={isLoading}><RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} /></button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all">
            <LogOut size={13} /> <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-5 flex flex-col gap-5 animate-fade-in">

        {/* ─── DASHBOARD TAB ──────────────────────────────────────────────────────── */}
        {activeTab === 'dashboard' && (
          <>
            {/* KPI Cards — styled like maintenance dashboard with colored icons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Sales', value: formatLKR(metrics.totalSales), icon: TrendingUp, iconBg: 'bg-blue-500', cardBg: 'from-blue-500/10 to-blue-500/3', tag: '+12.4% this month', tagColor: 'text-blue-400' },
                { label: 'Purchases', value: formatLKR(metrics.totalPurchases), icon: TrendingDown, iconBg: 'bg-yellow-500', cardBg: 'from-yellow-500/10 to-yellow-500/3', tag: '+24.1% supply', tagColor: 'text-yellow-400' },
                { label: 'Expenses', value: formatLKR(metrics.totalExpenses), icon: DollarSign, iconBg: 'bg-red-500', cardBg: 'from-red-500/10 to-red-500/3', tag: '-5.2% overhead', tagColor: 'text-emerald-400' },
                { label: 'Net Profit', value: formatLKR(metrics.netProfit), icon: Award, iconBg: 'bg-emerald-500', cardBg: 'from-emerald-500/10 to-emerald-500/3', tag: 'Sales − (P+E)', tagColor: 'text-emerald-400', highlight: true },
                { label: 'Customers', value: metrics.totalCustomers, icon: Users, iconBg: 'bg-purple-500', cardBg: 'from-purple-500/10 to-purple-500/3', tag: `${metrics.activeCustomers} active`, tagColor: 'text-purple-400' },
              ].map(({ label, value, icon: Icon, iconBg, cardBg, tag, tagColor, highlight }) => (
                <div key={label} className={`glass-card rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden bg-gradient-to-br ${cardBg} ${highlight ? 'border-primary/30' : ''}`}
                  style={highlight ? { borderColor: 'rgba(var(--p), 0.3)' } : {}}>
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-semibold opacity-60 uppercase tracking-wider">{label}</span>
                    <div className={`p-2.5 rounded-xl ${iconBg}`}><Icon size={16} className="text-white" /></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold font-mono tracking-tight"
                      style={highlight ? { color: 'var(--primary-light)' } : {}}>{value}</h3>
                    <span className={`text-[11px] font-medium ${tagColor}`}>{tag}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Second row KPI — like maintenance dashboard bottom row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Invoices', value: sales.length, icon: FileText, iconBg: 'bg-teal-600', tag: `${sales.filter(s => s.outstandingAmount > 0).length} pending`, tagColor: 'text-yellow-400' },
                { label: 'Products/SKUs', value: products.length, icon: Tag, iconBg: 'bg-orange-500', tag: `${products.filter(p => p.currentStock <= p.lowStockThreshold).length} low stock`, tagColor: 'text-red-400' },
                { label: 'Active Staff', value: staff.length, icon: UserCheck, iconBg: 'bg-indigo-500', tag: `Active: ${staff.filter(s => s.status === 'active').length}`, tagColor: 'text-indigo-400' },
                { label: 'Branches', value: branches.length, icon: Landmark, iconBg: 'bg-pink-600', tag: 'All Active', tagColor: 'text-pink-400' },
              ].map(({ label, value, icon: Icon, iconBg, tag, tagColor }) => (
                <div key={label} className="glass-card rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden">
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-semibold opacity-60 uppercase tracking-wider">{label}</span>
                    <div className={`p-2.5 rounded-xl ${iconBg}`}><Icon size={16} className="text-white" /></div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold">{value}</h3>
                    <span className={`text-[11px] font-medium ${tagColor}`}>{tag}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            {currentUser.role !== 'marketing' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="glass-card p-5 rounded-2xl">
                  <h3 className="text-sm font-bold opacity-80 mb-4 flex items-center gap-2">
                    <TrendingUp size={16} style={{ color: 'var(--primary-hex)' }} /> Sales vs. Purchases (LKR)
                  </h3>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={charts.dailySales}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={11} />
                        <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} tickFormatter={v => (v / 1000000).toFixed(1) + 'M'} />
                        <Tooltip formatter={v => formatLKR(v)} contentStyle={{ backgroundColor: '#0F172A', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <Legend />
                        <Line type="monotone" dataKey="sales" name="Sales" stroke="var(--primary-hex)" strokeWidth={2.5} activeDot={{ r: 7 }} />
                        <Line type="monotone" dataKey="purchases" name="Purchases" stroke="#3B82F6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="glass-card p-5 rounded-2xl">
                  <h3 className="text-sm font-bold opacity-80 mb-4 flex items-center gap-2">
                    <DollarSign size={16} className="text-red-400" /> Expenses by Category
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className="w-44 h-44 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={charts.expenses.filter(e => e.amount > 0)} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="amount" nameKey="category">
                            {charts.expenses.filter(e => e.amount > 0).map((_, i) => <Cell key={i} fill={COLORS_LIST[i % COLORS_LIST.length]} />)}
                          </Pie>
                          <Tooltip formatter={v => formatLKR(v)} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-2 text-xs">
                      {charts.expenses.filter(e => e.amount > 0).map((e, i) => (
                        <div key={e.category} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS_LIST[i % COLORS_LIST.length] }}></span>
                          <span className="opacity-80">{e.category}: <b className="font-mono">{formatLKR(e.amount)}</b></span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── CUSTOMERS TAB ──────────────────────────────────────────────────────── */}
        {activeTab === 'customers' && (
          <div className="flex flex-col gap-4">
            {/* Header with Add Customer button */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold font-serif flex items-center gap-2">
                  <span className="p-2 rounded-xl" style={{ background: 'rgba(var(--p), 0.15)' }}>
                    <Users size={20} style={{ color: 'var(--primary-hex)' }} />
                  </span>
                  <span style={{ color: 'var(--primary-light)' }}>Customer Management</span>
                </h2>
                <p className="text-xs opacity-60 ml-12">{customers.length} customers • {customers.filter(c => c.status === 'pending_approval').length} pending approval</p>
              </div>
              <button onClick={() => setShowAddCustomer(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-950 font-bold text-sm transition-all hover:brightness-110 shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--primary-light), var(--primary-hex))', boxShadow: '0 4px 16px rgba(var(--p), 0.35)' }}>
                <UserPlus size={16} /> Add New Customer
              </button>
            </div>

            {/* Customer Grid Cards — styled like maintenance dashboard stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {customers.map((c, i) => (
                <div key={c._id} className="glass-card rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden hover:scale-[1.01] transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 rounded-full -mr-10 -mt-10 blur-2xl opacity-20"
                    style={{ background: COLORS_LIST[i % COLORS_LIST.length] }}></div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0"
                        style={{ background: COLORS_LIST[i % COLORS_LIST.length] }}>
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm leading-tight">{c.name}</h3>
                        <p className="text-[11px] opacity-60">{c.contactPerson} {c.designation ? `• ${c.designation}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${c.status === 'active' || !c.status ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800' : 'bg-yellow-950/50 text-yellow-400 border-yellow-800'}`}>
                        {c.status === 'pending_approval' ? '⏳ PENDING' : '✅ ACTIVE'}
                      </span>
                      <span className="text-[9px] opacity-50 font-mono">{c.country}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 opacity-70"><Phone size={11} /><span>{c.mobile}</span></div>
                    <div className="flex items-center gap-1.5 opacity-70"><Mail size={11} /><span className="truncate">{c.email || '—'}</span></div>
                    <div className="flex items-center gap-1.5 opacity-70"><Tag size={11} /><span>{c.businessType || '—'}</span></div>
                    <div className="flex items-center gap-1.5 opacity-70"><Globe size={11} /><span>{c.customerType || '—'}</span></div>
                  </div>

                  <div className="border-t border-white/6 pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] opacity-50 font-semibold uppercase tracking-wider">Outstanding Balance</p>
                      <p className={`text-sm font-bold font-mono ${(c.outstandingBalance || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {formatLKR(c.outstandingBalance || 0)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] opacity-50 font-semibold uppercase tracking-wider">Payment Terms</p>
                      <p className="text-xs font-bold" style={{ color: 'var(--primary-hex)' }}>{c.paymentTerms || 'Immediate'}</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Customer Card */}
              <button onClick={() => setShowAddCustomer(true)}
                className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/10 hover:border-white/25 transition-all group cursor-pointer">
                <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ background: 'rgba(var(--p), 0.15)' }}>
                  <UserPlus size={24} style={{ color: 'var(--primary-hex)' }} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm" style={{ color: 'var(--primary-light)' }}>Add New Customer</p>
                  <p className="text-[11px] opacity-50 mt-0.5">{perm.badgeLabel}</p>
                </div>
              </button>
            </div>
          </div>
        )}


        {/* ─── SALES ORDERS TAB ─────────────────────────────────────────────────── */}
        {activeTab === 'sales_orders' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold font-serif flex items-center gap-2">
              <span className="p-2 rounded-xl" style={{ background: 'rgba(var(--p), 0.15)' }}><ClipboardList size={20} style={{ color: 'var(--primary-hex)' }} /></span>
              <span style={{ color: 'var(--primary-light)' }}>Sales Orders</span>
            </h2>

            {/* Sales Order Form (For Admin, Branch Manager, Marketing) */}
            {(currentUser.role !== 'super_admin' || editSalesOrderId) && (
              <div className="glass-card p-5 rounded-2xl" style={{ borderColor: 'rgba(var(--p), 0.12)' }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--primary-light)' }}>
                  {editSalesOrderId ? '✏️ Edit Sales Order' : '➕ Create New Sales Order'}
                </h3>
                <form onSubmit={handleCreateSalesOrder} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-1">Customer Name</label>
                    <input type="text" value={salesOrderForm.customer_name} onChange={e => setSalesOrderForm({ ...salesOrderForm, customer_name: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-1">Business Type</label>
                    <input type="text" value={salesOrderForm.business_type} onChange={e => setSalesOrderForm({ ...salesOrderForm, business_type: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-1">Invoice No</label>
                    <input type="text" value={salesOrderForm.invoice_no} onChange={e => setSalesOrderForm({ ...salesOrderForm, invoice_no: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-1">Invoice Status</label>
                    <select value={salesOrderForm.invoice_status} onChange={e => setSalesOrderForm({ ...salesOrderForm, invoice_status: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-100">
                      <option value="success">success</option>
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>

                    </select>
                  </div>
                  {/* Total Amount */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-1">Total Amount (LKR)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={salesOrderForm.amount}
                      onChange={e => setSalesOrderForm({ ...salesOrderForm, amount: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs"
                      required
                    />
                  </div>

                  {/* Paid Amount */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-1">Paid Amount (LKR)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={salesOrderForm.paid_amount}
                      onChange={e => setSalesOrderForm({ ...salesOrderForm, paid_amount: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs"
                    />
                  </div>

                  {/* Outstanding Amount  */}
                  <div className="col-span-2 md:col-span-4 mt-2">
                    <span className="text-rose-400 text-xs font-bold">
                      Outstanding Amount: {formatLKR(Math.max(0, (parseFloat(salesOrderForm.amount) || 0) - (parseFloat(salesOrderForm.paid_amount) || 0)))}
                    </span>
                  </div>

                  {['super_admin', 'admin'].includes(currentUser.role) && (
                    <>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-1">address</label>
                        <input type="text" value={salesOrderForm.branch_id} onChange={e => setSalesOrderForm({ ...salesOrderForm, branch_id: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-1">Account ID</label>
                        <input type="text" value={salesOrderForm.account_id} onChange={e => setSalesOrderForm({ ...salesOrderForm, account_id: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 block mb-1">Marketing ID</label>
                        <input type="text" value={salesOrderForm.marketing_id} onChange={e => setSalesOrderForm({ ...salesOrderForm, marketing_id: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" />
                      </div>
                    </>
                  )}
                  <div className="col-span-2 md:col-span-4 flex justify-end gap-2 mt-2">
                    {editSalesOrderId && (
                      <button type="button" onClick={() => { setEditSalesOrderId(null); setSalesOrderForm({ customer_name: '', business_type: 'Retail', invoice_no: '', invoice_status: 'Pending', amount: '', branch_id: '', account_id: '', marketing_id: '' }); }} className="px-6 py-2.5 rounded-xl text-slate-300 font-bold text-xs border border-white/20 hover:bg-white/5 transition-all">Cancel Edit</button>
                    )}
                    <button type="submit" className="px-6 py-2.5 rounded-xl text-slate-950 font-bold text-xs transition-all hover:brightness-110" style={{ background: 'linear-gradient(135deg, var(--primary-light), var(--primary-hex))' }}>
                      {editSalesOrderId ? '✅ Update Order' : '✅ Save Sales Order'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Sales Orders Tables (For Super Admin and Admin) */}
            {['super_admin', 'admin'].includes(currentUser.role) && (
              <div className="flex flex-col gap-6 mt-4">
                {[
                  { role: 'super_admin', label: '👑 Super Admin Sales Orders', color: 'text-red-400' },
                  { role: 'admin', label: '💼 Admin Sales Orders', color: 'text-yellow-400' },
                  { role: 'branch_manager', label: '🏢 Branch Manager Sales Orders', color: 'text-emerald-400' },
                  { role: 'marketing', label: '📣 Marketing Staff Sales Orders', color: 'text-blue-400' },
                  { role: 'other', label: '❓ Other / Uncategorized', color: 'text-slate-400' }
                ].map(group => {
                  const groupOrders = salesOrders.filter(o =>
                    group.role === 'other'
                      ? !['super_admin', 'admin', 'branch_manager', 'marketing'].includes(o.created_role)
                      : o.created_role === group.role
                  );

                  if (group.role === 'other' && groupOrders.length === 0) return null;

                  return (
                    <div key={group.role} className="glass-card rounded-2xl overflow-hidden">
                      <div className="p-4 border-b border-white/10 bg-slate-900/60 flex items-center justify-between">
                        <h3 className={`font-bold uppercase tracking-wider text-xs ${group.color}`}>{group.label}</h3>
                        <span className="text-[10px] bg-slate-950 px-2 py-1 rounded-lg border border-white/5 opacity-70">
                          {groupOrders.length} Orders
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                          <thead>
                            <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider opacity-55">
                              <th className="py-3.5 px-4">Order No / Date</th>
                              <th className="py-3.5 px-4">Customer Name</th>
                              <th className="py-3.5 px-4">Business Type</th>
                              <th className="py-3.5 px-4">Invoice No / Status</th>
                              <th className="py-3.5 px-4">Amount</th>
                              <th className="py-3.5 px-4">Paid</th>            {/* புதியது */}
                              <th className="py-3.5 px-4">Outstanding</th>
                              <th className="py-3.5 px-4">IDs (Br / Acc / Mkt)</th>
                              <th className="py-3.5 px-4 text-center">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupOrders.map(order => (
                              <tr key={order._id || order.id} className="border-b border-white/5 hover:bg-white/3 transition-all">
                                {/* 1. Order No / Date */}
                                <td className="py-3 px-4 font-mono font-bold" style={{ color: 'var(--primary-hex)' }}>
                                  {order.order_no}<br /><span className="text-[9px] opacity-60">{new Date(order.order_date || order.created_at).toLocaleDateString()}</span>
                                </td>

                                {/* 2. Customer Name */}
                                <td className="py-3 px-4 font-semibold">{order.customer_name}</td>

                                {/* 3. Business Type */}
                                <td className="py-3 px-4">{order.business_type}</td>

                                {/* 4. Invoice No / Status */}
                                <td className="py-3 px-4">
                                  {order.invoice_no || '—'}<br />
                                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${order.invoice_status === 'Paid' ? 'text-emerald-400 border-emerald-400/30' : order.invoice_status === 'Cancelled' ? 'text-rose-400 border-rose-400/30' : 'text-yellow-400 border-yellow-400/30'}`}>
                                    {order.invoice_status}
                                  </span>
                                </td>

                                {/* 5. Amount */}
                                <td className="py-3 px-4 font-mono">{formatLKR(order.amount)}</td>

                                {/* 6. Paid Amount (புதியது) */}
                                <td className="py-3 px-4 font-mono text-emerald-400">
                                  {formatLKR(order.paid_amount || 0)}
                                </td>

                                {/* 7. Outstanding Amount (புதியது) */}
                                <td className="py-3 px-4 font-mono font-bold text-rose-400">
                                  {formatLKR(Math.max(0, (parseFloat(order.amount) || 0) - (parseFloat(order.paid_amount) || 0)))}
                                </td>

                                {/* 8. IDs (BR / ACC / MKT) */}
                                <td className="py-3 px-4 text-[10px] opacity-70">
                                  B: {order.branch_id || '—'} <br />
                                  A: {order.account_id || '—'} <br />
                                  M: {order.marketing_id || '—'}
                                </td>

                                {/* 9. Actions */}
                                <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    {['super_admin', 'admin'].includes(currentUser.role) && (
                                      <>
                                        <button onClick={() => handleEditSalesOrder(order)} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-colors" title="Edit"><Settings size={13} /></button>
                                        <button onClick={() => deleteSalesOrder(order._id || order.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors" title="Delete"><Trash2 size={13} /></button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}

                            {/* No data found */}
                            {groupOrders.length === 0 && (
                              <tr><td colSpan="9" className="text-center py-8 opacity-40">No sales orders found.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── STOCK TAB ──────────────────────────────────────────────────────────── */}
        {activeTab === 'stock' && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold font-serif flex items-center gap-2">
              <span className="p-2 rounded-xl" style={{ background: 'rgba(var(--p), 0.15)' }}><AlertTriangle size={20} style={{ color: 'var(--primary-hex)' }} /></span>
              <span style={{ color: 'var(--primary-light)' }}>Stock Control & Alerts</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map(prod => {
                const isLow = prod.currentStock <= prod.lowStockThreshold;
                const pct = Math.min(100, (prod.currentStock / 2000) * 100);
                return (
                  <div key={prod._id} className="glass-card p-5 rounded-2xl flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm">{prod.name}</h4>
                        <span className="text-[10px] font-mono opacity-50">{prod.sku} • {prod.category}</span>
                      </div>
                      {isLow && <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 animate-pulse font-bold">LOW STOCK</span>}
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1 opacity-70">
                        <span>Stock: <b>{prod.currentStock.toLocaleString()} units</b></span>
                        <span>Threshold: {prod.lowStockThreshold}</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: isLow ? '#ef4444' : 'var(--primary-hex)' }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-white/5 pt-2 opacity-80 font-mono">
                      <span>Cost: <b>{formatLKR(prod.buyPrice)}</b></span>
                      <span>Sell: <b>{formatLKR(prod.sellPrice)}</b></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ─── OPERATIONS TAB ─────────────────────────────────────────────────────── */}
        {activeTab === 'operations' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Left column */}
            <div className="flex flex-col gap-4">
              {/* Purchase Order */}
              {currentUser.role !== 'branch_manager' && currentUser.role !== 'marketing' && (
                <div className="glass-card p-5 rounded-2xl" style={{ borderColor: 'rgba(var(--p), 0.12)' }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--primary-light)' }}>➕ Create Purchase Order</h3>
                  <form onSubmit={handleCreatePurchase} className="grid grid-cols-2 gap-3">
                    <div className="col-span-2"><input type="text" placeholder="Supplier Name" value={purchaseForm.supplierName} onChange={e => setPurchaseForm({ ...purchaseForm, supplierName: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" required /></div>
                    <div className="col-span-2"><input type="text" placeholder="Product Name" value={purchaseForm.productName} onChange={e => setPurchaseForm({ ...purchaseForm, productName: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" required /></div>
                    <input type="number" min="1" value={purchaseForm.quantity} onChange={e => setPurchaseForm({ ...purchaseForm, quantity: parseInt(e.target.value) || 1 })} className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" required />
                    <input type="number" step="0.01" value={purchaseForm.costPrice} onChange={e => setPurchaseForm({ ...purchaseForm, costPrice: parseFloat(e.target.value) || 0 })} className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" required />
                    <div className="col-span-2 flex justify-between items-center">
                      <span className="text-blue-400 text-sm font-bold font-mono">Total: {formatLKR(purchaseForm.quantity * purchaseForm.costPrice)}</span>
                      <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">Authorize PO</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Expense */}
              {currentUser.role !== 'marketing' && (
                <div className="glass-card p-5 rounded-2xl">
                  <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--primary-light)' }}>➕ Log Expense</h3>
                  <form onSubmit={handleAddExpense} className="grid grid-cols-2 gap-3">
                    <div className="col-span-2"><input type="text" placeholder="Description" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" required /></div>
                    <select value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })} className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs">
                      {['fuel', 'salary', 'marketing', 'office', 'electricity', 'transport', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="number" step="0.01" placeholder="Amount" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" required />
                    <div className="col-span-2 flex justify-end">
                      <button type="submit" className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs">Log Expense</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Payment */}
              {currentUser.role !== 'Marketing' && (
                <div className="glass-card p-5 rounded-2xl">
                  <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--primary-light)' }}>💵Payment received</h3>
                  <form onSubmit={handleRecordPayment} className="grid grid-cols-2 gap-3">
                    <form onSubmit={handleRecordPayment}
                      className="grid grid-cols-2 gap-3">

                      <input
                        type="text"
                        placeholder="Payment No"
                        value={paymentForm.paymentNo}
                        onChange={e =>
                          setPaymentForm({
                            ...paymentForm,
                            paymentNo: e.target.value
                          })
                        }
                        className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs"
                      />

                      <input
                        type="text"
                        placeholder="Invoice No"
                        value={paymentForm.invoiceNo}
                        onChange={e =>
                          setPaymentForm({
                            ...paymentForm,
                            invoiceNo: e.target.value
                          })
                        }
                        className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs"
                      />

                      <input
                        type="text"
                        placeholder="Customer Name"
                        value={paymentForm.customerName}
                        onChange={e =>
                          setPaymentForm({
                            ...paymentForm,
                            customerName: e.target.value
                          })
                        }
                        className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs"
                      />

                      <input
                        type="text"
                        placeholder="Marketing Staff"
                        value={paymentForm.marketingStaff}
                        onChange={e =>
                          setPaymentForm({
                            ...paymentForm,
                            marketingStaff: e.target.value
                          })
                        }
                        className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs"
                      />

                      <input
                        type="date"
                        value={paymentForm.paymentDate}
                        onChange={e =>
                          setPaymentForm({
                            ...paymentForm,
                            paymentDate: e.target.value
                          })
                        }
                        className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs"
                      />

                      <select
                        value={paymentForm.paymentType}
                        onChange={e =>
                          setPaymentForm({
                            ...paymentForm,
                            paymentType: e.target.value
                          })
                        }
                        className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs"
                      >
                        <option value="Advance">Advance</option>
                        <option value="Final">Final</option>
                      </select>

                      <select
                        value={paymentForm.paymentMode}
                        onChange={e =>
                          setPaymentForm({
                            ...paymentForm,
                            paymentMode: e.target.value
                          })
                        }
                        className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs"
                      >
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                      </select>

                      <select
                        value={paymentForm.depositedTo}
                        onChange={e =>
                          setPaymentForm({
                            ...paymentForm,
                            depositedTo: e.target.value
                          })
                        }
                        className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs"
                      >
                        <option value="Cash Hand">Cash Hand</option>
                        <option value="Bank Account">Bank Account</option>
                      </select>

                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Amount"
                          value={paymentForm.amount}
                          onChange={e =>
                            setPaymentForm({
                              ...paymentForm,
                              amount: e.target.value
                            })
                          }
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs"
                        />
                      </div>

                      <div className="col-span-2">
                        <textarea
                          placeholder="Remarks"
                          value={paymentForm.remarks}
                          onChange={e =>
                            setPaymentForm({
                              ...paymentForm,
                              remarks: e.target.value
                            })
                          }
                          className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs"
                        />
                      </div>

                      <div className="col-span-2 flex justify-end">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-bold text-xs"
                        >
                          Record Payment
                        </button>
                      </div>

                    </form>
                    <div className="col-span-2">
                      <select value={paymentForm.invoiceNumber} onChange={e => { const s = sales.find(s => s.invoiceNumber === e.target.value); setPaymentForm({ ...paymentForm, invoiceNumber: e.target.value, amountReceived: s ? s.outstandingAmount : 0 }); }} className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" required>
                        <option value="">-- Select Invoice --</option>
                        {sales.filter(s => s.outstandingAmount > 0).map(s => <option key={s._id} value={s.invoiceNumber}>{s.invoiceNumber} (Bal: {formatLKR(s.outstandingAmount)})</option>)}
                      </select>
                    </div>
                    <select value={paymentForm.paymentMethod} onChange={e => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })} className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs">
                      <option value="cash">Cash</option><option value="bank_transfer">Bank Transfer</option><option value="cheque">Cheque</option>
                    </select>
                    <input type="number" step="0.01" placeholder="Amount" value={paymentForm.amountReceived} onChange={e => setPaymentForm({ ...paymentForm, amountReceived: parseFloat(e.target.value) || 0 })} className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" required />
                    <div className="col-span-2 flex justify-end">
                      <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs">Record Payment</button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Right column — Super Admin only */}
            <div className="flex flex-col gap-4">
              {currentUser.role === 'super_admin' ? (
                <>
                  <div className="glass-card p-5 rounded-2xl">
                    <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--primary-light)' }}>🏢 Establish Branch</h3>
                    <form onSubmit={handleCreateBranch} className="grid grid-cols-2 gap-3">
                      <div className="col-span-2"><input type="text" placeholder="Branch Name" value={branchForm.name} onChange={e => setBranchForm({ ...branchForm, name: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" required /></div>
                      <input type="text" placeholder="Code (GAL-02)" value={branchForm.code} onChange={e => setBranchForm({ ...branchForm, code: e.target.value })} className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" required />
                      <input type="text" placeholder="Location" value={branchForm.location} onChange={e => setBranchForm({ ...branchForm, location: e.target.value })} className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" required />
                      <div className="col-span-2 flex justify-end">
                        <button type="submit" className="px-5 py-2.5 rounded-xl text-slate-950 font-bold text-xs" style={{ background: 'linear-gradient(135deg, var(--primary-light), var(--primary-hex))' }}>🏢 Establish Branch</button>
                      </div>
                    </form>
                  </div>

                  <div className="glass-card p-5 rounded-2xl">
                    <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--primary-light)' }}>💼 Recruit Staff</h3>
                    <form onSubmit={handleCreateStaff} className="grid grid-cols-2 gap-3">
                      <div className="col-span-2"><input type="text" placeholder="Full Name" value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" required /></div>
                      <div className="col-span-2"><input type="email" placeholder="Email" value={staffForm.email} onChange={e => setStaffForm({ ...staffForm, email: e.target.value })} className="w-full p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" required /></div>
                      <select value={staffForm.role} onChange={e => setStaffForm({ ...staffForm, role: e.target.value })} className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs">
                        <option value="admin">Admin</option><option value="branch_manager">Branch Manager</option><option value="marketing">Marketing</option>
                      </select>
                      <select value={staffForm.branchId} onChange={e => setStaffForm({ ...staffForm, branchId: e.target.value })} className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs">
                        <option value="">Select Branch</option>
                        {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                      </select>
                      <input type="number" placeholder="Commission %" value={staffForm.commissionRate} onChange={e => setStaffForm({ ...staffForm, commissionRate: parseInt(e.target.value) || 0 })} className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" />
                      <input type="number" placeholder="Salary (Rs.)" value={staffForm.salary} onChange={e => setStaffForm({ ...staffForm, salary: parseInt(e.target.value) || 0 })} className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-xs" />
                      <div className="col-span-2 flex justify-end">
                        <button type="submit" className="px-5 py-2.5 rounded-xl text-slate-950 font-bold text-xs" style={{ background: 'linear-gradient(135deg, var(--primary-light), var(--primary-hex))' }}>💼 Hire Staff</button>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <div className="glass-card p-6 rounded-2xl flex flex-col items-center gap-3 text-center">
                  <Shield size={32} className="text-red-400" />
                  <h3 className="font-bold">Corporate Settings Restricted</h3>
                  <p className="text-xs opacity-60 max-w-xs">Branch creation and staff recruitment are locked to Super Admin only. Contact the system owner.</p>
                </div>
              )}

              {/* GPS Tracker */}
              <div className="glass-card p-5 rounded-2xl flex flex-col gap-3">
                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--primary-light)' }}>
                  <MapPin size={15} style={{ color: 'var(--primary-hex)' }} /> GPS Staff Locator
                </h3>
                <div className="relative w-full h-40 rounded-xl bg-slate-900 border border-white/10 overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-5 pointer-events-none">
                    {Array.from({ length: 24 }).map((_, i) => <div key={i} className="border-r border-b border-white"></div>)}
                  </div>
                  <div className="absolute flex flex-col items-center" style={{ left: '60%', top: '50%' }}>
                    <span className="w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-slate-950 animate-ping absolute"></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-slate-950 relative"></span>
                    <span className="text-[8px] bg-slate-950/80 px-1 py-0.5 rounded border border-white/10 mt-1 font-mono">Marketing</span>
                  </div>
                  <div className="absolute flex flex-col items-center" style={{ left: '20%', top: '30%' }}>
                    <span className="w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-950"></span>
                    <span className="text-[8px] bg-slate-950/80 px-1 py-0.5 rounded border border-white/10 mt-1 font-mono">Head Office</span>
                  </div>
                </div>
                <p className="text-[10px] opacity-50">Marketing staff GPS updates every 30 seconds.</p>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ─── ADD CUSTOMER MODAL ────────────────────────────────────────────────── */}
      {showAddCustomer && <AddCustomerModal />}

      {/* ─── QR Modal ─────────────────────────────────────────────────────────── */}
      {showQrModal && selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-md p-6 rounded-3xl flex flex-col items-center gap-5 relative" style={{ borderColor: 'rgba(var(--p), 0.3)' }}>
            <button onClick={() => setShowQrModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold">✕</button>
            <h3 className="text-lg font-bold font-serif" style={{ color: 'var(--primary-light)' }}>QR Invoice Sheet</h3>
            <div className="p-4 bg-white rounded-2xl">
              <div className="w-40 h-40 border-4 border-slate-950 flex flex-wrap p-1 gap-1">
                <div className="w-10 h-10 border-[5px] border-slate-950 bg-white"></div>
                <div className="w-10 h-10 flex flex-col gap-1 justify-around"><div className="h-1.5 bg-slate-950 w-full"></div><div className="h-1.5 bg-slate-950 w-2/3"></div></div>
                <div className="w-10 h-10 border-[5px] border-slate-950 bg-white"></div>
                <div className="w-10 h-10 bg-slate-950 rounded-sm"></div>
                <div className="w-10 h-10 flex flex-wrap gap-0.5 p-1"><div className="w-2.5 h-2.5 bg-slate-950"></div><div className="w-2 h-2 bg-slate-950"></div></div>
                <div className="w-10 h-10 border-[5px] border-slate-950 bg-white"></div>
                <div className="w-10 h-10 bg-slate-950"></div>
                <div className="w-10 h-10 border-2 border-dashed border-slate-950 flex items-center justify-center font-bold text-slate-950 font-serif text-sm">T</div>
              </div>
            </div>
            <div className="text-center text-xs border-y border-white/5 py-3 w-full">
              <p className="font-mono font-bold" style={{ color: 'var(--primary-hex)' }}>{selectedInvoice.invoiceNumber}</p>
              <p className="opacity-80 mt-1">Customer: <b>{selectedInvoice.customerName}</b></p>
              <p className="opacity-80">Outstanding: <span className="text-rose-400 font-bold">{formatLKR(selectedInvoice.outstandingAmount)}</span></p>
            </div>
            <div className="grid grid-cols-3 gap-3 w-full text-xs font-semibold">
              <button onClick={() => alert('PDF exporting...')} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 text-red-400"><FileText size={18} /><span>PDF</span></button>
              <button onClick={() => alert('Excel exporting...')} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 text-emerald-400"><Download size={18} /><span>Excel</span></button>
              <button onClick={() => alert('Opening WhatsApp...')} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/5 text-green-400"><Share2 size={18} /><span>WhatsApp</span></button>
            </div>
            <button onClick={() => setShowQrModal(false)} className="text-xs opacity-60 underline hover:text-white">Close</button>
          </div>
        </div>
      )}

      {/* ─── Biometrics Modal ──────────────────────────────────────────────────── */}
      {showBiometrics && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-sm p-8 rounded-3xl flex flex-col items-center gap-6 relative" style={{ borderColor: 'rgba(var(--p), 0.3)' }}>
            <button onClick={() => setShowBiometrics(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold">✕</button>
            <div className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse border-2" style={{ background: 'rgba(var(--p), 0.12)', borderColor: 'var(--primary-hex)' }}>
              <Smartphone size={28} style={{ color: 'var(--primary-hex)' }} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold font-serif" style={{ color: 'var(--primary-light)' }}>Biometric Verification</h3>
              <p className="text-xs opacity-60 mt-1">Place fingerprint or align Face ID</p>
            </div>
            {!biometricSuccess ? (
              <button onClick={() => { setBiometricSuccess(true); setTimeout(() => { setShowBiometrics(false); alert('Face ID Verified!'); }, 1200); }}
                className="w-full py-3 rounded-xl text-slate-950 font-bold text-sm hover:brightness-110 transition-all"
                style={{ background: 'linear-gradient(135deg, var(--primary-light), var(--primary-hex))' }}>
                Scan (Face ID / Touch ID)
              </button>
            ) : (
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm"><CheckCircle2 size={18} /> Clearance Granted!</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
