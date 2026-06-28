const express = require('express');
const router = express.Router();
const { client } = require('../db');

router.get('/', async (req, res) => {
  try {
    const r = await client.execute("SELECT * FROM customers WHERE status='overdue' OR overdue > 0 ORDER BY overdue DESC");
    const data = r.rows.map(c => ({ _id: c.id, name: c.name, panCard: c.pan_card, phoneNo: c.phone_no, accNo: c.acc_no, disbursedDate: c.disbursed_date, disbursedAmt: c.disbursed_amt, overdue: c.overdue, status: c.status }));
    res.json({ success: true, data, total: data.length });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const r = await client.execute('SELECT COUNT(*) as count, SUM(overdue) as total FROM customers WHERE overdue > 0');
    const b1 = await client.execute('SELECT COUNT(*) as count, SUM(overdue) as total FROM customers WHERE overdue > 0 AND overdue <= 30000');
    const b2 = await client.execute('SELECT COUNT(*) as count, SUM(overdue) as total FROM customers WHERE overdue > 30000 AND overdue <= 60000');
    const b3 = await client.execute('SELECT COUNT(*) as count, SUM(overdue) as total FROM customers WHERE overdue > 60000 AND overdue <= 90000');
    const b4 = await client.execute('SELECT COUNT(*) as count, SUM(overdue) as total FROM customers WHERE overdue > 90000');
    res.json({ success: true, data: { totalOverdue: r.rows[0].total || 0, totalAccounts: r.rows[0].count, buckets: { '0-30k': { amount: b1.rows[0].total || 0, count: b1.rows[0].count }, '31-60k': { amount: b2.rows[0].total || 0, count: b2.rows[0].count }, '61-90k': { amount: b3.rows[0].total || 0, count: b3.rows[0].count }, '90k+': { amount: b4.rows[0].total || 0, count: b4.rows[0].count } } } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;
