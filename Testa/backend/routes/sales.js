const express = require('express');
const router = express.Router();
const dbFallback = require('../utils/dbFallback');
const { protect } = require('../middleware/auth');

// Helper to auto-generate Invoice Number
const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(100 + Math.random() * 900));
  return `INV-${year}${month}${day}-${random}`;
};

// @route   GET /api/sales
// @desc    Get all sales orders
// @access  Private
router.get('/', protect, (req, res) => {
  try {
    let sales = dbFallback.getCollection('sales');

    // Branch manager gets only their branch sales
    if (req.user.role === 'branch_manager' || req.user.role === 'marketing') {
      sales = sales.filter(s => s.branchId === req.user.branchId);
    }

    res.json({ success: true, count: sales.length, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/sales
// @desc    Create a sales order
// @access  Private
router.post('/', protect, (req, res) => {
  const { customerId, products, paidAmount = 0, deliveryStatus = 'pending' } = req.body;

  if (!customerId || !products || !products.length) {
    return res.status(400).json({ success: false, message: 'Please add customer and products' });
  }

  try {
    const customer = dbFallback.findById('customers', customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    let calculatedTotal = 0;
    const orderProducts = [];

    // Verify products and calculate prices
    for (const item of products) {
      const product = dbFallback.findById('products', item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${item.productId} not found` });
      }

      if (product.currentStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.currentStock}`
        });
      }

      const qty = parseInt(item.quantity);
      const unitPrice = parseFloat(item.unitPrice) || product.sellPrice;
      const amount = qty * unitPrice;

      calculatedTotal += amount;

      orderProducts.push({
        productId: product._id,
        productName: product.name,
        quantity: qty,
        unitPrice: unitPrice,
        amount: amount
      });
    }

    const total = parseFloat(calculatedTotal);
    const paid = parseFloat(paidAmount) || 0;
    const outstanding = total - paid;
    const paymentStatus = outstanding <= 0 ? 'paid' : (paid > 0 ? 'partially_paid' : 'unpaid');

    // Deduct Stock
    for (const item of orderProducts) {
      const product = dbFallback.findById('products', item.productId);
      dbFallback.updateById('products', item.productId, {
        currentStock: product.currentStock - item.quantity
      });
    }

    // Update Customer Outstanding Balance
    dbFallback.updateById('customers', customerId, {
      outstandingBalance: customer.outstandingBalance + outstanding
    });

    const invoiceNo = generateInvoiceNumber();

    const newSale = dbFallback.insertOne('sales', {
      invoiceNumber: invoiceNo,
      customerId,
      customerName: customer.name,
      branchId: req.user.branchId || 'b_colombo',
      products: orderProducts,
      totalAmount: total,
      paidAmount: paid,
      outstandingAmount: outstanding,
      deliveryStatus,
      paymentStatus,
      createdBy: req.user.id
    });

    // If there was any initial payment, record it in the payments collection
    if (paid > 0) {
      dbFallback.insertOne('payments', {
        invoiceNumber: invoiceNo,
        customerId,
        amountReceived: paid,
        paymentMethod: req.body.paymentMethod || 'cash',
        date: new Date(),
        receivedBy: req.user.id
      });
    }

    res.status(201).json({ success: true, data: newSale });
  } catch (error) {
    console.error('Create sales error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/sales/:id
// @desc    Update sales order status (delivery / payment)
// @access  Private
router.put('/:id', protect, (req, res) => {
  const { deliveryStatus, paidAmount } = req.body;

  try {
    const sale = dbFallback.findById('sales', req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sales order not found' });
    }

    const updates = {};
    if (deliveryStatus) {
      updates.deliveryStatus = deliveryStatus;
    }

    if (paidAmount !== undefined) {
      const newPaid = parseFloat(paidAmount);
      const diff = newPaid - sale.paidAmount;
      updates.paidAmount = newPaid;
      updates.outstandingAmount = sale.totalAmount - newPaid;
      updates.paymentStatus = updates.outstandingAmount <= 0 ? 'paid' : (newPaid > 0 ? 'partially_paid' : 'unpaid');

      // Update customer balance
      const customer = dbFallback.findById('customers', sale.customerId);
      if (customer) {
        dbFallback.updateById('customers', sale.customerId, {
          outstandingBalance: customer.outstandingBalance - diff
        });
      }
    }

    const updatedSale = dbFallback.updateById('sales', req.params.id, updates);
    res.json({ success: true, data: updatedSale });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/sales/:id
// @desc    Cancel/delete a sales order (reverts stock & balances)
// @access  Private (Super Admin Only)
router.delete('/:id', protect, (req, res) => {
  try {
    const sale = dbFallback.findById('sales', req.params.id);
    if (!sale) {
      return res.status(404).json({ success: false, message: 'Sales order not found' });
    }

    // Revert Stock
    for (const item of sale.products) {
      const product = dbFallback.findById('products', item.productId);
      if (product) {
        dbFallback.updateById('products', item.productId, {
          currentStock: product.currentStock + item.quantity
        });
      }
    }

    // Revert Customer Balance
    const customer = dbFallback.findById('customers', sale.customerId);
    if (customer) {
      dbFallback.updateById('customers', sale.customerId, {
        outstandingBalance: Math.max(0, customer.outstandingBalance - sale.outstandingAmount)
      });
    }

    dbFallback.deleteById('sales', req.params.id);
    res.json({ success: true, message: 'Sales order cancelled and deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
