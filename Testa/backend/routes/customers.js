const express = require('express');
const router = express.Router();
const pool = require('../db');
const { protect } = require('../middleware/auth');
const dbFallback = require('../utils/dbFallback');

router.post('/', protect, async (req, res) => {
  try {
    const {
      companyName, contactPerson, designation, mobile, phone, email, address, country,
      businessType, customerType, paymentTerms, creditLimit, accountId, marketingId,
      branchId, notes, status, createdRole
    } = req.body;

    if (!companyName || companyName.trim() === '') {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }
    if (!mobile || mobile.trim() === '') {
      return res.status(400).json({ success: false, message: 'Mobile is required' });
    }

    if (pool) {
      const query = `
        INSERT INTO customers (
          company_name, contact_person, designation, mobile, phone, email, address, country,
          business_type, customer_type, payment_terms, credit_limit, account_id, marketing_id,
          branch_id, notes, status, created_role, created_by, outstanding_balance, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 0, NOW())
        RETURNING *
      `;
      const values = [
        companyName, contactPerson, designation, mobile, phone, email?.toLowerCase(), address, country,
        businessType, customerType, paymentTerms, creditLimit, accountId, marketingId,
        branchId, notes, status, createdRole, req.user.id
      ];
      const result = await pool.query(query, values);

      // Send back the customer with camelCase mapping for frontend
      const row = result.rows[0];
      return res.status(201).json({
        success: true,
        message: 'Customer added successfully',
        data: {
          _id: row.id,
          name: row.company_name,
          contactPerson: row.contact_person,
          designation: row.designation,
          mobile: row.mobile,
          phone: row.phone,
          email: row.email,
          address: row.address,
          country: row.country,
          businessType: row.business_type,
          customerType: row.customer_type,
          paymentTerms: row.payment_terms,
          creditLimit: row.credit_limit,
          accountId: row.account_id,
          marketingId: row.marketing_id,
          branchId: row.branch_id,
          notes: row.notes,
          status: row.status,
          createdRole: row.created_role,
          createdBy: row.created_by,
          outstandingBalance: row.outstanding_balance,
          createdAt: row.created_at
        },
      });
    }

    // JSON Fallback
    const newCust = {
      name: companyName,
      contactPerson, designation, mobile, phone, email, address, country,
      businessType, customerType, paymentTerms, creditLimit, accountId, marketingId,
      branchId, notes, status, createdRole, createdBy: req.user.id, outstandingBalance: 0,
      createdAt: new Date().toISOString()
    };
    const saved = dbFallback.insertOne('customers', newCust);
    return res.status(201).json({
      success: true,
      message: 'Customer added successfully',
      data: saved
    });

  } catch (error) {
    console.error('🔴 DB Error:', error.message);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    let customers = [];
    if (pool) {
      const result = await pool.query('SELECT * FROM customers ORDER BY created_at DESC');
      customers = result.rows.map(row => ({
        _id: row.id,
        name: row.company_name,
        contactPerson: row.contact_person,
        designation: row.designation,
        mobile: row.mobile,
        phone: row.phone,
        email: row.email,
        address: row.address,
        country: row.country,
        businessType: row.business_type,
        customerType: row.customer_type,
        paymentTerms: row.payment_terms,
        creditLimit: row.credit_limit,
        accountId: row.account_id,
        marketingId: row.marketing_id,
        branchId: row.branch_id,
        notes: row.notes,
        status: row.status,
        createdRole: row.created_role,
        createdBy: row.created_by,
        outstandingBalance: row.outstanding_balance,
        createdAt: row.created_at
      }));
    } else {
      customers = dbFallback.getCollection('customers') || [];
    }

    // Filtering rules:
    // Super Admin / Admin -> See all
    // Branch Manager -> See customers in their branch
    // Marketing -> See customers they created (or maybe all in their branch? Let's say their own)
    const userRole = req.user.role;
    if (userRole === 'branch_manager') {
      customers = customers.filter(c => c.branchId === req.user.branchId);
    } else if (userRole === 'marketing') {
      customers = customers.filter(c => c.createdBy === req.user.id);
    }

    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('🔴 DB Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;