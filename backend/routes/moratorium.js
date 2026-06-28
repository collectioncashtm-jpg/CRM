const express = require('express');
const router = express.Router();
const { client, generateId } = require('../db');

router.get('/', async (req, res) => {
  try {
    const r = await client.execute('SELECT * FROM moratoria ORDER BY created_at DESC');
    const data = r.rows.map(m => ({ _id: m.id, accNo: m.acc_no, moratoriumStart: m.moratorium_start, moratoriumEnd: m.moratorium_end, interestAccrual: m.interest_accrual, newEmiEndDate: m.new_emi_end_date, status: m.status }));
    res.json({ success: true, data });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.delete('/all', async (req, res) => {
  try {
    await client.execute('DELETE FROM moratoria');
    res.json({ success: true, message: 'All moratoria deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { accNo, moratoriumStart, moratoriumEnd, interestAccrual, newEmiEndDate, status } = req.body;
    const id = generateId();
    await client.execute({ sql: 'INSERT INTO moratoria (id,acc_no,moratorium_start,moratorium_end,interest_accrual,new_emi_end_date,status) VALUES (?,?,?,?,?,?,?)', args: [id, accNo, moratoriumStart, moratoriumEnd, interestAccrual || 'no', newEmiEndDate, status || 'Active'] });
    res.status(201).json({ success: true, data: { _id: id, ...req.body } });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
});

router.post('/bulk', async (req, res) => {
  try {
    const stmts = req.body.map(m => ({ sql: 'INSERT OR IGNORE INTO moratoria (id,acc_no,moratorium_start,moratorium_end,interest_accrual,new_emi_end_date,status) VALUES (?,?,?,?,?,?,?)', args: [generateId(), m.accNo, m.moratoriumStart, m.moratoriumEnd, m.interestAccrual || 'no', m.newEmiEndDate, m.status || 'Active'] }));
    await client.batch(stmts, 'write');
    res.status(201).json({ success: true, count: stmts.length });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
});

module.exports = router;
