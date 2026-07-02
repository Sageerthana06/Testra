const express = require('express');
const router = express.Router();
const dbFallback = require('../utils/dbFallback');
const { protect } = require('../middleware/auth');

// @route   GET /api/reports/dashboard
// @desc    Get dashboard metrics & charts data
// @access  Private
router.get('/dashboard', protect, (req, res) => {
  try {
    let sales = dbFallback.getCollection('sales');
    let purchases = dbFallback.getCollection('purchases');
    let expenses = dbFallback.getCollection('expenses');
    const products = dbFallback.getCollection('products');
    const customers = dbFallback.getCollection('customers');
    const staff = dbFallback.getCollection('users');
    const branches = dbFallback.getCollection('branches');

    // Filter by branch if manager or marketing staff
    if (req.user.role === 'branch_manager' || req.user.role === 'marketing') {
      sales = sales.filter(s => s.branchId === req.user.branchId);
      expenses = expenses.filter(e => e.branchId === req.user.branchId);
    }

    // Calculations
    const totalSales = sales.reduce(
      (sum, item) => sum + (Number(item.totalAmount) || 0),
      0
    );

    const totalPurchases = purchases.reduce(
      (sum, item) => sum + (Number(item.totalAmount) || 0),
      0
    );

    const totalExpenses = expenses.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
    const netProfit = totalSales - (totalPurchases + totalExpenses);

    const pendingPayments = sales.reduce(
      (sum, item) => sum + (Number(item.outstandingAmount) || 0),
      0
    );
    const activeCustomersCount = customers.length;
    const stockAlertsCount = products.filter(p => p.currentStock <= p.lowStockThreshold).length;

    // Daily Sales (Last 7 Days)
    const dailySalesMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      dailySalesMap[dateStr] = { date: dateStr, sales: 0, purchases: 0 };
    }

    sales.forEach(sale => {
      if (!sale.createdAt) return;

      const dateStr = new Date(sale.createdAt)
        .toISOString()
        .split('T')[0];

      if (dailySalesMap[dateStr]) {
        dailySalesMap[dateStr].sales += Number(sale.totalAmount) || 0;
      }
    });

    purchases.forEach(pur => {
      if (!pur.createdAt) return;

      const dateStr = new Date(pur.createdAt)
        .toISOString()
        .split('T')[0];

      if (dailySalesMap[dateStr]) {
        dailySalesMap[dateStr].purchases += Number(pur.totalAmount) || 0;
      }
    });

    const dailySalesData = Object.values(dailySalesMap);

    // Expense Category Breakdown
    const expenseBreakdown = {
      fuel: 0,
      salary: 0,
      marketing: 0,
      office: 0,
      electricity: 0,
      transport: 0,
      other: 0
    };

    expenses.forEach(e => {
      const cat = (e.category || 'other').toLowerCase();

      if (expenseBreakdown[cat] !== undefined) {
        expenseBreakdown[cat] += Number(e.amount) || 0;
      } else {
        expenseBreakdown.other += Number(e.amount) || 0;
      }
    });

    const expenseChartData = Object.keys(expenseBreakdown).map(key => ({
      category: key.charAt(0).toUpperCase() + key.slice(1),
      amount: expenseBreakdown[key]
    }));

    // Branch Performance (Sales vs Expenses per branch)
    const branchPerformance = (branches || []).map(br => {
      const branchSales = sales.filter(s => s.branchId === br._id).reduce((sum, item) => sum + item.totalAmount, 0);
      const branchExpenses = expenses.filter(e => e.branchId === br._id).reduce((sum, item) => sum + item.amount, 0);
      return {
        branchName: br.name,
        sales: branchSales,
        expenses: branchExpenses,
        profit: branchSales - branchExpenses
      };
    });

    res.json({
      success: true,
      metrics: {
        totalSales,
        totalPurchases,
        totalExpenses,
        netProfit,
        pendingPayments,
        activeCustomers: activeCustomersCount,
        stockAlerts: stockAlertsCount,
        totalCustomers: customers.length,
        totalSuppliers: 3, // mock count based on mock purchases
        totalStaff: staff.length,
        totalBranches: branches.length
      },
      charts: {
        dailySales: dailySalesData,
        expenses: expenseChartData,
        branchPerformance: branchPerformance
      }
    });
  } catch (error) {
    console.error('Reports dashboard error:', error);
    res.status(500).json({ success: false, message: 'Server error generating reports' });
  }
});

module.exports = router;
