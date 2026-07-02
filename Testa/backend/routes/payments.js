const express = require('express');
const router = express.Router();
const dbFallback = require('../utils/dbFallback');
const { protect } = require('../middleware/auth');

// @route   GET /api/payments
// @desc    Get all payments
// @access  Private
router.get('/', protect, (req, res) => {
  try {
    const payments = dbFallback.getCollection('payments');
    res.json({ success: true, count: payments.length, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/payments
// @desc    Record a customer payment
// @access  Private
router.post('/', protect, (req, res) => {
  const { invoiceNumber, amountReceived, paymentMethod, date } = req.body;

  if (!invoiceNumber || !amountReceived || !paymentMethod) {
    return res.status(400).json({
      success: false,
      message: 'Invoice number, amount received, and payment method are required'
    });
  }

  // ✅ Normalize: "Bank Transfer" → "bank_transfer", "Cash" → "cash"
  const normalizedMethod = paymentMethod
    .toLowerCase()
    .replace(/\s+/g, '_');

  const validMethods = ['cash', 'bank_transfer', 'cheque'];
  if (!validMethods.includes(normalizedMethod)) {
    return res.status(400).json({
      success: false,
      message: `Invalid payment method. Must be one of: ${validMethods.join(', ')}`
    });
  }

  try {
    // Find the Sales Invoice
    const sale = dbFallback.findOne('sales', { invoiceNumber });
    if (!sale) {
      return res.status(404).json({
        success: false,
        message: `Invoice "${invoiceNumber}" not found`
      });
    }

    const received = parseFloat(amountReceived);
    if (received <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount received must be greater than 0'
      });
    }

    // Update Sales Invoice
    const newPaidAmount = sale.paidAmount + received;
    const newOutstanding = Math.max(0, sale.totalAmount - newPaidAmount);
    const newPaymentStatus = newOutstanding <= 0 ? 'paid' : 'partially_paid';

    dbFallback.updateById('sales', sale._id, {
      paidAmount: newPaidAmount,
      outstandingAmount: newOutstanding,
      paymentStatus: newPaymentStatus
    });

    // Update Customer Outstanding Balance
    const customer = dbFallback.findById('customers', sale.customerId);
    if (customer) {
      dbFallback.updateById('customers', sale.customerId, {
        outstandingBalance: Math.max(0, customer.outstandingBalance - received)
      });
    }

    // Record Payment
    const payment = dbFallback.insertOne('payments', {
      invoiceNumber,
      customerId: sale.customerId,
      customerName: customer ? customer.name : 'Unknown Customer',
      amountReceived: received,
      paymentMethod: normalizedMethod,   // ✅ saved as normalized
      date: date ? new Date(date) : new Date(),
      receivedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: payment,
      invoiceOutstanding: newOutstanding,
      customerOutstanding: customer
        ? Math.max(0, customer.outstandingBalance - received)
        : 0
    });

  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;