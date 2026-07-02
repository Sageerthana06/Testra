const express = require('express');
const router = express.Router();
const dbFallback = require('../utils/dbFallback');
const { protect } = require('../middleware/auth');

// @route   GET /api/expenses
// @desc    Get all expenses
// @access  Private
router.get('/', protect, (req, res) => {
  try {
    let expenses = dbFallback.getCollection('expenses');
    
    // Branch manager gets only their branch expenses
    if (req.user.role === 'branch_manager' || req.user.role === 'marketing') {
      expenses = expenses.filter(e => e.branchId === req.user.branchId);
    }
    
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/expenses
// @desc    Add a new expense
// @access  Private
router.post('/', protect, (req, res) => {
  const { date, description, category, amount } = req.body;

  if (!description || !category || !amount) {
    return res.status(400).json({ success: false, message: 'Please add description, category, and amount' });
  }

  // Validate category
  const validCategories = ['fuel', 'salary', 'marketing', 'office', 'electricity', 'transport', 'other'];
  if (!validCategories.includes(category.toLowerCase())) {
    return res.status(400).json({ success: false, message: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
  }

  try {
    const newExpense = dbFallback.insertOne('expenses', {
      date: date ? new Date(date) : new Date(),
      description,
      category: category.toLowerCase(),
      amount: parseFloat(amount),
      branchId: req.user.branchId || 'b_colombo',
      addedBy: req.user.id
    });

    res.status(201).json({ success: true, data: newExpense });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
