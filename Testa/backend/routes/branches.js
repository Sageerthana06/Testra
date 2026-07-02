const express = require('express');
const router = express.Router();
const dbFallback = require('../utils/dbFallback');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/branches
// @desc    Get all branches
// @access  Private
router.get('/', protect, (req, res) => {
  try {
    const branches = dbFallback.getCollection('branches');
    res.json({ success: true, count: branches.length, data: branches });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/branches
// @desc    Create a new branch
// @access  Private (Super Admin Only)
router.post('/', protect, authorize('super_admin'), (req, res) => {
  const { name, code, location, managerId } = req.body;

  if (!name || !code || !location) {
    return res.status(400).json({ success: false, message: 'Please add name, code, and location' });
  }

  try {
    // Check if branch code exists
    const existing = dbFallback.findOne('branches', { code });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Branch code already exists' });
    }

    const newBranch = dbFallback.insertOne('branches', {
      name,
      code,
      location,
      managerId: managerId || '',
      status: 'active'
    });

    res.status(201).json({ success: true, data: newBranch });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/branches/:id
// @desc    Update a branch
// @access  Private (Super Admin Only)
router.put('/:id', protect, authorize('super_admin'), (req, res) => {
  const { name, code, location, managerId, status } = req.body;

  try {
    const branch = dbFallback.findById('branches', req.params.id);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    const updated = dbFallback.updateById('branches', req.params.id, {
      name: name || branch.name,
      code: code || branch.code,
      location: location || branch.location,
      managerId: managerId !== undefined ? managerId : branch.managerId,
      status: status || branch.status
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/branches/:id
// @desc    Delete a branch
// @access  Private (Super Admin Only)
router.delete('/:id', protect, authorize('super_admin'), (req, res) => {
  try {
    const branch = dbFallback.findById('branches', req.params.id);
    if (!branch) {
      return res.status(404).json({ success: false, message: 'Branch not found' });
    }

    dbFallback.deleteById('branches', req.params.id);
    res.json({ success: true, message: 'Branch deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
