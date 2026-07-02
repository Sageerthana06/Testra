const express = require('express');
const router = express.Router();
const dbFallback = require('../utils/dbFallback');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products (with optional low-stock filter)
// @access  Private
router.get('/', protect, (req, res) => {
  try {
    const products = dbFallback.getCollection('products');
    const lowStockOnly = req.query.lowStock === 'true';

    if (lowStockOnly) {
      const filtered = products.filter(p => p.currentStock <= p.lowStockThreshold);
      return res.json({ success: true, count: filtered.length, data: filtered });
    }

    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Add a new product
// @access  Private (Super Admin & Admin Only)
router.post('/', protect, authorize('super_admin', 'admin'), (req, res) => {
  const { name, sku, buyPrice, sellPrice, currentStock, lowStockThreshold, category } = req.body;

  if (!name || !buyPrice || !sellPrice) {
    return res.status(400).json({ success: false, message: 'Please add name, buyPrice, and sellPrice' });
  }

  try {
    const autoSku = sku || `PRD-${name.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    
    // Check if sku exists
    const existing = dbFallback.findOne('products', { sku: autoSku });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Product SKU already exists' });
    }

    const newProduct = dbFallback.insertOne('products', {
      name,
      sku: autoSku,
      buyPrice: parseFloat(buyPrice),
      sellPrice: parseFloat(sellPrice),
      currentStock: parseFloat(currentStock) || 0,
      lowStockThreshold: parseFloat(lowStockThreshold) || 10,
      category: category || 'Other'
    });

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Super Admin & Admin Only)
router.put('/:id', protect, authorize('super_admin', 'admin'), (req, res) => {
  const { name, sku, buyPrice, sellPrice, currentStock, lowStockThreshold, category } = req.body;

  try {
    const product = dbFallback.findById('products', req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updated = dbFallback.updateById('products', req.params.id, {
      name: name || product.name,
      sku: sku || product.sku,
      buyPrice: buyPrice !== undefined ? parseFloat(buyPrice) : product.buyPrice,
      sellPrice: sellPrice !== undefined ? parseFloat(sellPrice) : product.sellPrice,
      currentStock: currentStock !== undefined ? parseFloat(currentStock) : product.currentStock,
      lowStockThreshold: lowStockThreshold !== undefined ? parseFloat(lowStockThreshold) : product.lowStockThreshold,
      category: category || product.category
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (Super Admin & Admin Only)
router.delete('/:id', protect, authorize('super_admin', 'admin'), (req, res) => {
  try {
    const product = dbFallback.findById('products', req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    dbFallback.deleteById('products', req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
