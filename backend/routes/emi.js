const express = require('express');
const router = express.Router();
const { client, generateId } = require('../db');

router.get('/', async (req, res) => {
  try {
    const r = await client.execute('SELECT * FROM emi_plans ORDER BY created_at DESC');
    const data = r.rows.map(p => ({ _id: p.id, name: p.name, panCard: p.pan_card, mobile: p.mobile, accNo: p.acc_no, emiStartDate: p.emi_start_date, emiEndDate: p.emi_end_date, totalEmi: p.total_emi, totalPaidEmi: p.total_paid_emi, totalAmt: p.total_amt, amtLeft: p.amt_left, status: p.status }));
    res.json({ success: true, data, total: data.length });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const total = (await client.execute('SELECT COUNT(*) as c FROM emi_plans')).rows[0].c;
    const active = (await client.execute("SELECT COUNT(*) as c FROM emi_plans WHERE status='active'")).rows[0].c;
    res.json({ success: true, data: { total, active } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.delete('/all', async (req, res) => {
  try {
    await client.execute('DELETE FROM emi_plans');
    res.json({ success: true, message: 'All EMI plans deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post('/', async (req, res) => {
  try {
    const id = generateId();
    const { name, panCard, mobile, address, accNo, emiStartDate, emiEndDate, totalEmi, totalPaidEmi, totalAmt, amtLeft } = req.body;
    await client.execute({ sql: 'INSERT INTO emi_plans (id,name,pan_card,mobile,address,acc_no,emi_start_date,emi_end_date,total_emi,total_paid_emi,total_amt,amt_left) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', args: [id, name, panCard, mobile, address, accNo, emiStartDate, emiEndDate, totalEmi, totalPaidEmi, totalAmt, amtLeft] });
    res.status(201).json({ success: true, data: { _id: id, ...req.body } });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, accNo, emiStartDate, emiEndDate, totalEmi, totalPaidEmi, totalAmt, amtLeft, status } = req.body;
    await client.execute({ sql: 'UPDATE emi_plans SET name=?,acc_no=?,emi_start_date=?,emi_end_date=?,total_emi=?,total_paid_emi=?,total_amt=?,amt_left=?,status=? WHERE id=?', args: [name, accNo, emiStartDate, emiEndDate, totalEmi, totalPaidEmi, totalAmt, amtLeft, status, req.params.id] });
    res.json({ success: true, data: { _id: req.params.id, ...req.body } });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await client.execute({ sql: 'DELETE FROM emi_plans WHERE id=?', args: [req.params.id] });
    res.json({ success: true, message: 'EMI Plan deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post('/bulk', async (req, res) => {
  try {
    const stmts = req.body.map(p => ({ sql: 'INSERT OR IGNORE INTO emi_plans (id,name,pan_card,mobile,address,acc_no,emi_start_date,emi_end_date,total_emi,total_paid_emi,total_amt,amt_left) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)', args: [generateId(), p.name, p.panCard, p.mobile, p.address, p.accNo, p.emiStartDate, p.emiEndDate, p.totalEmi, p.totalPaidEmi, p.totalAmt, p.amtLeft] }));
    await client.batch(stmts, 'write');
    res.status(201).json({ success: true, count: stmts.length });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
});

module.exports = router;
