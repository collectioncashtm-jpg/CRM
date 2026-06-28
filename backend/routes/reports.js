const express = require('express');
const router = express.Router();
const { client } = require('../db');

router.get('/portfolio', async (req, res) => {
  try {
    const totalCustomers = (await client.execute('SELECT COUNT(*) as c FROM customers')).rows[0].c;
    const totalDisbursed = (await client.execute('SELECT SUM(disbursed_amt) as t FROM customers')).rows[0].t || 0;
    const totalOutstanding = (await client.execute('SELECT SUM(overdue) as t FROM customers')).rows[0].t || 0;
    const totalEmiPlans = (await client.execute('SELECT COUNT(*) as c FROM emi_plans')).rows[0].c;
    const statusBreakdown = (await client.execute('SELECT status, COUNT(*) as count, SUM(disbursed_amt) as amount FROM customers GROUP BY status')).rows.map(r => ({ _id: r.status, count: r.count, amount: r.amount }));
    res.json({ success: true, data: { totalCustomers, totalLoans: totalCustomers, totalDisbursed, totalOutstanding, totalEmiPlans, statusBreakdown } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/overdue', async (req, res) => {
  try {
    const r = await client.execute('SELECT * FROM customers WHERE overdue > 0 ORDER BY overdue DESC');
    const accounts = r.rows.map(c => ({ _id: c.id, name: c.name, accNo: c.acc_no, overdue: c.overdue, status: c.status }));
    const total = accounts.reduce((s, c) => s + c.overdue, 0);
    res.json({ success: true, data: { accounts, totalOverdue: total, count: accounts.length } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/collection', async (req, res) => {
  try {
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const monthly = (await client.execute({ sql: 'SELECT type, SUM(amount) as total, COUNT(*) as count FROM payments WHERE date >= ? GROUP BY type', args: [firstOfMonth] })).rows.map(r => ({ _id: r.type, total: r.total, count: r.count }));
    const daily = (await client.execute({ sql: "SELECT substr(date,1,10) as day, SUM(amount) as total FROM payments WHERE date >= date('now','-30 days') GROUP BY day ORDER BY day", args: [] })).rows.map(r => ({ _id: r.day, total: r.total }));
    res.json({ success: true, data: { monthlyPayments: monthly, dailyPayments: daily } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/emi-due', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const r = await client.execute({ sql: "SELECT * FROM emi_plans WHERE status='active' AND emi_end_date >= ? ORDER BY emi_end_date ASC LIMIT 50", args: [today] });
    res.json({ success: true, data: r.rows });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;
