const express = require('express');
const router = express.Router();
const { client } = require('../db');

router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const totalCustomers = (await client.execute('SELECT COUNT(*) as c FROM customers')).rows[0].c;
    const activeLoans = (await client.execute("SELECT COUNT(*) as c FROM customers WHERE status='active'")).rows[0].c;
    const overdueLoans = (await client.execute("SELECT COUNT(*) as c FROM customers WHERE status='overdue'")).rows[0].c;
    const closedLoans = (await client.execute("SELECT COUNT(*) as c FROM customers WHERE status='closed'")).rows[0].c;
    const totalDisbursed = (await client.execute('SELECT SUM(disbursed_amt) as t FROM customers')).rows[0].t || 0;
    const totalOutstanding = (await client.execute('SELECT SUM(overdue) as t FROM customers')).rows[0].t || 0;
    const todayCollections = (await client.execute({ sql: 'SELECT SUM(amount) as t, COUNT(*) as c FROM payments WHERE date >= ?', args: [today] })).rows[0];
    const emiPlans = (await client.execute('SELECT COUNT(*) as c FROM emi_plans')).rows[0].c;
    const pendingTasks = (await client.execute("SELECT COUNT(*) as c FROM tasks WHERE status='pending'")).rows[0].c;

    const recentActivities = (await client.execute('SELECT * FROM activities ORDER BY created_at DESC LIMIT 10')).rows.map(a => ({ type: a.type, description: a.description, customerName: a.customer_name, amount: a.amount, createdAt: a.created_at }));

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const nextStr = next.toISOString().split('T')[0];
      const amount = (await client.execute({ sql: 'SELECT SUM(amount) as t FROM payments WHERE date >= ? AND date < ?', args: [dateStr, nextStr] })).rows[0].t || 0;
      last7Days.push({ date: dateStr, amount });
    }

    res.json({ success: true, data: { kpis: { totalCustomers, activeLoans, overdueLoans, closedLoans, totalDisbursed, totalOutstanding, todayCollections: todayCollections.t || 0, todayCollectionCount: todayCollections.c || 0, emiPlans, pendingTasks }, collectionTrend: last7Days, recentActivities } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

module.exports = router;
