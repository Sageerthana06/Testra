const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { protect, JWT_SECRET } = require('../middleware/auth');

// @route   POST /api/auth/login
// @desc    பயனர் உள்நுழைவு (Login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // 1. உள்ளீடுகளைச் சரிபார்த்தல்
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    // 2. பயனரைத் தரவுத்தளத்தில் தேடுதல்
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 3. கடவுச்சொல்லை ஒப்பிடுதல் (Bcrypt Compare)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // 4. பயனர் கணக்கு செயலில் உள்ளதா எனப் பார்த்தல்
    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'User account is deactivated' });
    }

    // 5. JWT டோக்கன் உருவாக்குதல்
    const token = jwt.sign(
      { id: user.id, role: user.role, branchId: user.branchId },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        branchId: user.branchId
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// @route   POST /api/auth/gps
// @desc    GPS இருப்பிடத்தைப் புதுப்பித்தல்
router.post('/gps', protect, async (req, res) => {
  const { latitude, longitude } = req.body;
  if (!latitude || !longitude) {
    return res.status(400).json({ success: false, message: 'Location data required' });
  }

  try {
    const query = `
      UPDATE users 
      SET gps_location = $1 
      WHERE id = $2
    `;
    const gpsData = JSON.stringify({ lat: latitude, lng: longitude, updatedAt: new Date() });
    await pool.query(query, [gpsData, req.user.id]);

    res.json({ success: true, message: 'GPS Location updated' });
  } catch (error) {
    console.error('GPS update error:', error);
    res.status(500).json({ success: false, message: 'Error updating GPS' });
  }
});

module.exports = router;