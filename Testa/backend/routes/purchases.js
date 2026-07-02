const express = require('express');
const router = express.Router();
const dbFallback = require('../utils/dbFallback');
const { protect } = require('../middleware/auth');

// Helper to auto-generate PO Number
const generatePONumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = String(Math.floor(100 + Math.random() * 900));
  return `PO-${year}${month}${day}-${random}`;
};

// @route   GET /api/purchases
// @desc    Get all purchases
// @access  Private
router.get('/', protect, (req, res) => {
  try {
    const purchases = dbFallback.getCollection('purchases');
    res.json({ success: true, count: purchases.length, data: purchases });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/purchases
// @desc    Create a new purchase order
// @access  Private
router.post('/', protect, (req, res) => {
  const { supplierName, productName, quantity, costPrice, paymentStatus = 'paid' } = req.body;

  if (!supplierName || !productName || !quantity || !costPrice) {
    return res.status(400).json({ success: false, message: 'Please add supplierName, productName, quantity, and costPrice' });
  }

  try {
    const qty = parseInt(quantity);
    const cost = parseFloat(costPrice);
    const amount = qty * cost;

    // Auto-generate PO Number
    const poNo = generatePONumber();

    // Check if the product exists in our stock. If it does, update its stock.
    const product = dbFallback.findOne('products', { name: productName });
    if (product) {
      dbFallback.updateById('products', product._id, {
        currentStock: product.currentStock + qty,
        buyPrice: cost // optionally update cost price based on latest purchase
      });
    } else {
      // If product does not exist, create it in products collection
      dbFallback.insertOne('products', {
        name: productName,
        sku: `PRD-${productName.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        buyPrice: cost,
        sellPrice: cost * 1.5, // default markup
        currentStock: qty,
        lowStockThreshold: 10,
        category: 'Spices'
      });
    }

    const newPurchase = dbFallback.insertOne('purchases', {
      poNumber: poNo,
      supplierName,
      products: [{
        productName,
        quantity: qty,
        costPrice: cost,
        amount: amount
      }],
      totalAmount: amount,
      paymentStatus,
      createdAt: new Date()
    });

    res.status(201).json({ success: true, data: newPurchase });
  } catch (error) {
    console.error('Create purchase error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
