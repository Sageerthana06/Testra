const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const dbFallback = require('../utils/dbFallback');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/staff
// @desc    Get all staff
// @access  Private (Super Admin Only)
router.get('/', protect, authorize('super_admin'), (req, res) => {
  try {
    const staff = dbFallback.getCollection('users').map(u => {
      // Exclude passwords
      const { password, ...rest } = u;
      return rest;
    });
    res.json({ success: true, count: staff.length, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/staff
// @desc    Register a new staff member
// @access  Private (Super Admin Only)
router.post('/', protect, authorize('super_admin'), async (req, res) => {
  const { name, email, password, role, branchId, commissionRate, salary } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'Please enter name, email, password, and role' });
  }

  try {
    // Check if user exists
    const existing = dbFallback.findOne('users', { email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Staff member with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newStaff = dbFallback.insertOne('users', {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      branchId: branchId || '',
      commissionRate: parseFloat(commissionRate) || 0,
      salary: parseFloat(salary) || 0,
      status: 'active',
      gpsLocation: { lat: 0, lng: 0, updatedAt: new Date() }
    });

    const { password: _, ...responseUser } = newStaff;
    res.status(201).json({ success: true, data: responseUser });
  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/staff/:id
// @desc    Update staff details (permissions, commission, salary, status)
// @access  Private (Super Admin Only)
router.put('/:id', protect, authorize('super_admin'), async (req, res) => {
  const { name, role, branchId, commissionRate, salary, status, password } = req.body;

  try {
    const staff = dbFallback.findById('users', req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (role !== undefined) updates.role = role;
    if (branchId !== undefined) updates.branchId = branchId;
    if (commissionRate !== undefined) updates.commissionRate = parseFloat(commissionRate);
    if (salary !== undefined) updates.salary = parseFloat(salary);
    if (status !== undefined) updates.status = status;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const updated = dbFallback.updateById('users', req.params.id, updates);
    const { password: _, ...responseUser } = updated;

    res.json({ success: true, data: responseUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/staff/:id
// @desc    Delete a staff member
// @access  Private (Super Admin Only)
router.delete('/:id', protect, authorize('super_admin'), (req, res) => {
  try {
    const staff = dbFallback.findById('users', req.params.id);
    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    // Prevent deleting self
    if (req.user.id === req.params.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    dbFallback.deleteById('users', req.params.id);
    res.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
