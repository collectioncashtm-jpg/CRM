const express = require('express');
const router = express.Router();
const { client, generateId } = require('../db');

// GET all customers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    let where = '1=1';
    const args = [];

    if (status) {
      where += ' AND status = ?';
      args.push(status);
    }
    if (search) {
      where += ' AND (name LIKE ? OR acc_no LIKE ? OR pan_card LIKE ? OR phone_no LIKE ?)';
      args.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const countRes = await client.execute({ sql: `SELECT COUNT(*) as total FROM customers WHERE ${where}`, args });
    const total = countRes.rows[0].total;

    const dataRes = await client.execute({
      sql: `SELECT * FROM customers WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      args: [...args, Number(limit), Number(offset)]
    });

    const customers = dataRes.rows.map(r => ({
      _id: r.id,
      name: r.name,
      panCard: r.pan_card,
      phoneNo: r.phone_no,
      accNo: r.acc_no,
      disbursedDate: r.disbursed_date,
      disbursedAmt: r.disbursed_amt,
      overdue: r.overdue,
      status: r.status,
      agentAssigned: r.agent_assigned,
      createdAt: r.created_at
    }));

    res.json({
      success: true,
      data: customers,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET customer stats
router.get('/stats', async (req, res) => {
  try {
    const total = (await client.execute('SELECT COUNT(*) as c FROM customers')).rows[0].c;
    const active = (await client.execute("SELECT COUNT(*) as c FROM customers WHERE status='active'")).rows[0].c;
    const overdue = (await client.execute("SELECT COUNT(*) as c FROM customers WHERE status='overdue'")).rows[0].c;
    const closed = (await client.execute("SELECT COUNT(*) as c FROM customers WHERE status='closed'")).rows[0].c;
    const disbursed = (await client.execute('SELECT SUM(disbursed_amt) as t FROM customers')).rows[0].t || 0;
    const totalOverdue = (await client.execute('SELECT SUM(overdue) as t FROM customers')).rows[0].t || 0;

    res.json({ success: true, data: { total, active, overdue, closed, totalDisbursed: disbursed, totalOverdue } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE all customers
router.delete('/all', async (req, res) => {
  try {
    const result = await client.execute('DELETE FROM customers');
    res.json({ success: true, message: `All customers deleted` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single customer
router.get('/:id', async (req, res) => {
  try {
    const r = await client.execute({ sql: 'SELECT * FROM customers WHERE id = ?', args: [req.params.id] });
    if (!r.rows.length) return res.status(404).json({ success: false, message: 'Customer not found' });
    const c = r.rows[0];
    res.json({ success: true, data: { _id: c.id, name: c.name, panCard: c.pan_card, phoneNo: c.phone_no, accNo: c.acc_no, disbursedDate: c.disbursed_date, disbursedAmt: c.disbursed_amt, overdue: c.overdue, status: c.status } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create customer
router.post('/', async (req, res) => {
  try {
    const { name, panCard, phoneNo, accNo, disbursedDate, disbursedAmt, overdue, status } = req.body;
    const id = generateId();
    await client.execute({
      sql: 'INSERT INTO customers (id, name, pan_card, phone_no, acc_no, disbursed_date, disbursed_amt, overdue, status) VALUES (?,?,?,?,?,?,?,?,?)',
      args: [id, name, panCard, phoneNo, accNo, disbursedDate, disbursedAmt || 0, overdue || 0, status || 'active']
    });
    res.status(201).json({ success: true, data: { _id: id, name, panCard, phoneNo, accNo } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update customer
router.put('/:id', async (req, res) => {
  try {
    const { name, panCard, phoneNo, accNo, disbursedDate, disbursedAmt, overdue, status } = req.body;
    await client.execute({
      sql: 'UPDATE customers SET name=?, pan_card=?, phone_no=?, acc_no=?, disbursed_date=?, disbursed_amt=?, overdue=?, status=?, updated_at=datetime("now") WHERE id=?',
      args: [name, panCard, phoneNo, accNo, disbursedDate, disbursedAmt, overdue, status, req.params.id]
    });
    res.json({ success: true, data: { _id: req.params.id, ...req.body } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE single customer
router.delete('/:id', async (req, res) => {
  try {
    await client.execute({ sql: 'DELETE FROM customers WHERE id = ?', args: [req.params.id] });
    res.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
