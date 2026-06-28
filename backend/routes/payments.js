const express = require('express');
const router = express.Router();
const { client, generateId } = require('../db');

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const total = (await client.execute('SELECT COUNT(*) as c FROM payments')).rows[0].c;
    const r = await client.execute({ sql: 'SELECT * FROM payments ORDER BY created_at DESC LIMIT ? OFFSET ?', args: [Number(limit), Number(offset)] });
    const data = r.rows.map(p => ({ _id: p.id, name: p.name, accNo: p.acc_no, amount: p.amount, type: p.type, date: p.date, mode: p.mode, notes: p.notes, createdAt: p.created_at }));
    res.json({ success: true, data, totalPages: Math.ceil(total / limit), currentPage: parseInt(page), total });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const totalCollected = (await client.execute('SELECT SUM(amount) as t FROM payments')).rows[0].t || 0;
    const todayCollected = (await client.execute({ sql: "SELECT SUM(amount) as t FROM payments WHERE date >= ?", args: [today] })).rows[0].t || 0;
    const thisMonth = (await client.execute({ sql: "SELECT SUM(amount) as t FROM payments WHERE date >= ?", args: [firstOfMonth] })).rows[0].t || 0;
    const totalTransactions = (await client.execute('SELECT COUNT(*) as c FROM payments')).rows[0].c;
    res.json({ success: true, data: { totalCollected, todayCollected, thisMonth, totalTransactions } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.delete('/all', async (req, res) => {
  try {
    await client.execute('DELETE FROM payments');
    res.json({ success: true, message: 'All payments deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, accNo, amount, type, date, mode, notes } = req.body;
    const id = generateId();
    await client.execute({ sql: 'INSERT INTO payments (id,name,acc_no,amount,type,date,mode,notes) VALUES (?,?,?,?,?,?,?,?)', args: [id, name, accNo, amount, type, date || new Date().toISOString(), mode || 'cash', notes || ''] });
    res.status(201).json({ success: true, data: { _id: id, ...req.body } });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
});

module.exports = router;
