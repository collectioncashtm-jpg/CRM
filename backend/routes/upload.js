const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const { client, generateId } = require('../db');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) cb(null, true);
    else cb(new Error('Only CSV files allowed'), false);
  }
});

function parseCSVBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const results = [];
    Readable.from(buffer).pipe(csv())
      .on('data', d => results.push(d))
      .on('end', () => resolve(results))
      .on('error', err => reject(err));
  });
}

// Batch insert helper
async function batchInsert(rows, batchSize = 500) {
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    try {
      await client.batch(batch, 'write');
      inserted += batch.length;
    } catch (e) {
      console.error('Batch error:', e.message);
    }
  }
  return inserted;
}

// Upload Customer CSV
router.post('/customers', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const data = await parseCSVBuffer(req.file.buffer);

    const statements = data
      .filter(row => (row.name || row.Name) && (row.acc_no || row.account_no))
      .map(row => ({
        sql: 'INSERT OR IGNORE INTO customers (id, name, pan_card, phone_no, acc_no, disbursed_date, disbursed_amt, overdue, status) VALUES (?,?,?,?,?,?,?,?,?)',
        args: [
          generateId(),
          (row.name || row.Name || '').trim(),
          (row.pan_card || row.pan || '').trim(),
          (row.phone_no || row.phone || '').trim(),
          (row.acc_no || row.account_no || '').trim(),
          row.disbursed_date || null,
          parseFloat(row.disbursed_amt || 0) || 0,
          parseFloat(row.overdue || 0) || 0,
          (row.status || 'active').toLowerCase().trim()
        ]
      }));

    const inserted = await batchInsert(statements);

    res.json({ success: true, count: inserted, message: `${inserted} customers imported` });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Upload EMI CSV
router.post('/emi', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const data = await parseCSVBuffer(req.file.buffer);

    const statements = data
      .filter(row => row.acc_no || row.account_no)
      .map(row => ({
        sql: 'INSERT OR IGNORE INTO emi_plans (id, name, pan_card, mobile, address, acc_no, emi_start_date, emi_end_date, total_emi, total_paid_emi, total_amt, amt_left) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
        args: [
          generateId(),
          (row.name || '').trim(),
          (row.pan_card || '').trim(),
          (row.mobile || row.phone_no || '').trim(),
          (row.address || '').trim(),
          (row.acc_no || row.account_no || '').trim(),
          row.emi_start_date || null,
          row.emi_end_date || null,
          parseInt(row.total_emi || 0) || 0,
          parseInt(row.total_paid_emi || 0) || 0,
          parseFloat(row.total_amt || 0) || 0,
          parseFloat(row.amt_left || 0) || 0
        ]
      }));

    const inserted = await batchInsert(statements);
    res.json({ success: true, count: inserted });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Upload Topup CSV
router.post('/topup', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const data = await parseCSVBuffer(req.file.buffer);

    const statements = data
      .filter(row => row.acc_no || row.account_no)
      .map(row => ({
        sql: 'INSERT OR IGNORE INTO topups (id, acc_no, topup_amount, emi_start_date, emi_end_date, monthly_emi, status) VALUES (?,?,?,?,?,?,?)',
        args: [
          generateId(),
          (row.acc_no || row.account_no || '').trim(),
          parseFloat(row.topup_amount || 0) || 0,
          row.emi_start_date || null,
          row.emi_end_date || null,
          parseFloat(row.monthly_emi || 0) || 0,
          row.status || 'Active'
        ]
      }));

    const inserted = await batchInsert(statements);
    res.json({ success: true, count: inserted });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Upload Moratorium CSV
router.post('/moratorium', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const data = await parseCSVBuffer(req.file.buffer);

    const statements = data
      .filter(row => row.acc_no || row.account_no)
      .map(row => ({
        sql: 'INSERT OR IGNORE INTO moratoria (id, acc_no, moratorium_start, moratorium_end, interest_accrual, new_emi_end_date, status) VALUES (?,?,?,?,?,?,?)',
        args: [
          generateId(),
          (row.acc_no || row.account_no || '').trim(),
          row.moratorium_start || null,
          row.moratorium_end || null,
          row.interest_accrual || 'no',
          row.new_emi_end_date || null,
          row.status || 'Active'
        ]
      }));

    const inserted = await batchInsert(statements);
    res.json({ success: true, count: inserted });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
