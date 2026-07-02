const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

let pool;
try {
    pool = require('../db');
} catch (_) {
    pool = null;
}
const dbFallback = require('../utils/dbFallback');

const generateOrderNo = () => {
    const d = new Date();
    const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const rnd = String(Math.floor(100 + Math.random() * 900));
    return `SO-${ymd}-${rnd}`;
};

const applyRoleFilter = (orders, user) => {
    if (user.role === 'super_admin' || user.role === 'admin') {
        return orders;
    }
    if (user.role === 'branch_manager') {
        return orders.filter(order => order.branch_id === user.branchId);
    }
    if (user.role === 'marketing') {
        return orders.filter(order => order.marketing_id === user.id);
    }
    return [];
};

// GET /api/sales-orders
router.get('/', protect, async (req, res) => {
    try {
        if (pool) {
            let query = 'SELECT * FROM sales_orders';
            const args = [];

            if (req.user.role === 'branch_manager') {
                args.push(req.user.branchId);
                query += ` WHERE branch_id = $${args.length}`;
            } else if (req.user.role === 'marketing') {
                args.push(req.user.id);
                query += ` WHERE marketing_id = $${args.length}`;
            }

            query += ' ORDER BY created_at DESC';

            const { rows } = await pool.query(query, args);
            return res.json({ success: true, count: rows.length, data: rows });
        }

        let orders = dbFallback.getCollection('sales_orders') || [];
        orders = applyRoleFilter(orders, req.user);
        orders.sort((a, b) => new Date(b.created_at || b.order_date) - new Date(a.created_at || a.order_date));
        return res.json({ success: true, count: orders.length, data: orders });
    } catch (err) {
        console.error('GET /sales-orders error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/sales-orders
router.post('/', protect, authorize('super_admin', 'admin', 'branch_manager', 'marketing'), async (req, res) => {
    const { customer_name, business_type, invoice_no, invoice_status, amount, branch_id, account_id, marketing_id } = req.body;

    if (!customer_name || !amount) {
        return res.status(400).json({ success: false, message: 'customer_name and amount are required' });
    }

    const order_no = generateOrderNo();
    const order_date = new Date();
    const created_role = req.user.role;
    
    // Fallbacks if not provided
    const final_marketing_id = marketing_id || (req.user.role === 'marketing' ? req.user.id : null);
    const final_branch_id = branch_id || req.user.branchId;
    const final_invoice_status = invoice_status || 'Pending';

    try {
        if (pool) {
            const { rows } = await pool.query(
                `INSERT INTO sales_orders
                 (order_no, customer_name, business_type, order_date, invoice_no, invoice_status, amount, branch_id, account_id, marketing_id, created_role, created_at)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
                 RETURNING *`,
                [order_no, customer_name, business_type, order_date, invoice_no, final_invoice_status, amount, final_branch_id, account_id, final_marketing_id, created_role, new Date()]
            );
            return res.status(201).json({ success: true, data: rows[0] });
        }

        const newOrder = dbFallback.insertOne('sales_orders', {
            order_no, customer_name, business_type, order_date, invoice_no,
            invoice_status: final_invoice_status, amount: parseFloat(amount),
            branch_id: final_branch_id, account_id, marketing_id: final_marketing_id,
            created_role, created_at: new Date()
        });
        return res.status(201).json({ success: true, data: newOrder });

    } catch (err) {
        console.error('POST /sales-orders error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT /api/sales-orders/:id
router.put('/:id', protect, authorize('super_admin', 'admin'), async (req, res) => {
    const { customer_name, business_type, invoice_no, invoice_status, amount, branch_id, account_id, marketing_id } = req.body;
    try {
        if (pool) {
            const { rows } = await pool.query(
                `UPDATE sales_orders
                 SET customer_name = $1, business_type = $2, invoice_no = $3, invoice_status = $4,
                     amount = $5, branch_id = $6, account_id = $7, marketing_id = $8
                 WHERE id = $9
                 RETURNING *`,
                [customer_name, business_type, invoice_no, invoice_status, amount, branch_id, account_id, marketing_id, req.params.id]
            );
            if (!rows[0]) return res.status(404).json({ success: false, message: 'Order not found' });
            return res.json({ success: true, data: rows[0] });
        }

        const updated = dbFallback.updateById('sales_orders', req.params.id, {
            customer_name, business_type, invoice_no, invoice_status, amount, branch_id, account_id, marketing_id
        });
        if (!updated) return res.status(404).json({ success: false, message: 'Order not found' });
        return res.json({ success: true, data: updated });

    } catch (err) {
        console.error('PUT /sales-orders error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE /api/sales-orders/:id
router.delete('/:id', protect, authorize('super_admin', 'admin'), async (req, res) => {
    try {
        if (pool) {
            const { rowCount } = await pool.query('DELETE FROM sales_orders WHERE id = $1', [req.params.id]);
            if (rowCount === 0) return res.status(404).json({ success: false, message: 'Order not found' });
            return res.json({ success: true, message: 'Deleted' });
        }

        const success = dbFallback.deleteById('sales_orders', req.params.id);
        if (!success) return res.status(404).json({ success: false, message: 'Order not found' });
        return res.json({ success: true, message: 'Deleted' });
    } catch (err) {
        console.error('DELETE /sales-orders error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
