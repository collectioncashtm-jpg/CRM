const express = require('express');
const router = express.Router();
const { client, generateId } = require('../db');

router.get('/', async (req, res) => {
  try {
    const r = await client.execute('SELECT * FROM topups ORDER BY created_at DESC');
    const data = r.rows.map(t => ({ _id: t.id, accNo: t.acc_no, topupAmount: t.topup_amount, emiStartDate: t.emi_start_date, emiEndDate: t.emi_end_date, monthlyEmi: t.monthly_emi, status: t.status }));
    res.json({ success: true, data });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.delete('/all', async (req, res) => {
  try {
    await client.execute('DELETE FROM topups');
    res.json({ success: true, message: 'All topups deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { accNo, topupAmount, emiStartDate, emiEndDate, monthlyEmi, status } = req.body;
    const id = generateId();
    await client.execute({ sql: 'INSERT INTO topups (id,acc_no,topup_amount,emi_start_date,emi_end_date,monthly_emi,status) VALUES (?,?,?,?,?,?,?)', args: [id, accNo, topupAmount, emiStartDate, emiEndDate, monthlyEmi, status || 'Active'] });
    res.status(201).json({ success: true, data: { _id: id, ...req.body } });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
});

router.post('/bulk', async (req, res) => {
  try {
    const stmts = req.body.map(t => ({ sql: 'INSERT OR IGNORE INTO topups (id,acc_no,topup_amount,emi_start_date,emi_end_date,monthly_emi,status) VALUES (?,?,?,?,?,?,?)', args: [generateId(), t.accNo, t.topupAmount, t.emiStartDate, t.emiEndDate, t.monthlyEmi, t.status || 'Active'] }));
    await client.batch(stmts, 'write');
    res.status(201).json({ success: true, count: stmts.length });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
});

module.exports = router;
