const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// PostgreSQL Connection (db.js இலிருந்து)
const pool = require('./db');

// Route Imports
const authRoutes = require('./routes/auth');
const branchRoutes = require('./routes/branches');
const staffRoutes = require('./routes/staff');
const productRoutes = require('./routes/products');
const customerRoutes = require('./routes/customers');
const salesRoutes = require('./routes/sales');
const salesOrderRoutes = require('./routes/salesOrders'); // ✅ NEW
const purchaseRoutes = require('./routes/purchases');
const expenseRoutes = require('./routes/expenses');
const paymentRoutes = require('./routes/payments');
const reportsRoutes = require('./routes/reports');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database Connection Test
pool.connect()
  .then(() => console.log('⚡ Connected to Neon PostgreSQL Database'))
  .catch(err => console.error('❌ Neon Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/sales-orders', salesOrderRoutes); // ✅ NEW
app.use('/api/purchases', purchaseRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportsRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    name: "TESTRAA",
    status: "online",
    dbEngine: "Neon PostgreSQL",
    version: "1.0.0"
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 ERP Backend server running on port ${PORT}`);
});