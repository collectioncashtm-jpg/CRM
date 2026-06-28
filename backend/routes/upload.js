const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { Customer, EmiPlan, Topup, Moratorium } = require('../models');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

function parseCSVFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

// Upload Customer CSV
router.post('/customers', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const data = await parseCSVFile(req.file.path);
    const customers = data.map(row => ({
      name: row.name || row.Name || '',
      panCard: row.pan_card || row.pan || '',
      phoneNo: row.phone_no || row.phone || '',
      accNo: row.acc_no || row.account_no || '',
      disbursedDate: row.disbursed_date || row.disbursedDate || null,
      disbursedAmt: parseFloat(row.disbursed_amt || row.disbursed_amount || 0) || 0,
      overdue: parseFloat(row.overdue || row.overdue_amt || 0) || 0,
      status: (row.status || 'active').toLowerCase()
    })).filter(c => c.name && c.accNo);

    const result = await Customer.insertMany(customers, { ordered: false });
    fs.unlinkSync(req.file.path); // Clean up

    res.json({ success: true, count: result.length, message: `${result.length} customers imported` });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Upload EMI CSV
router.post('/emi', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const data = await parseCSVFile(req.file.path);
    const emiPlans = data.map(row => ({
      name: row.name || '',
      dob: row.dob || null,
      panCard: row.pan_card || row.pan || '',
      mobile: row.mobile || row.phone_no || '',
      address: row.address || '',
      accNo: row.acc_no || row.account_no || '',
      emiStartDate: row.emi_start_date || null,
      emiEndDate: row.emi_end_date || null,
      totalEmi: parseInt(row.total_emi || 0) || 0,
      totalPaidEmi: parseInt(row.total_paid_emi || 0) || 0,
      totalAmt: parseFloat(row.total_amt || 0) || 0,
      amtLeft: parseFloat(row.amt_left || 0) || 0
    })).filter(e => e.accNo);

    const result = await EmiPlan.insertMany(emiPlans, { ordered: false });
    fs.unlinkSync(req.file.path);

    res.json({ success: true, count: result.length });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Upload Top-up CSV
router.post('/topup', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const data = await parseCSVFile(req.file.path);
    const topups = data.map(row => ({
      accNo: row.acc_no || row.account_no || '',
      topupAmount: parseFloat(row.topup_amount || 0) || 0,
      emiStartDate: row.emi_start_date || null,
      emiEndDate: row.emi_end_date || null,
      monthlyEmi: parseFloat(row.monthly_emi || 0) || 0,
      status: row.status || 'Active'
    })).filter(t => t.accNo);

    const result = await Topup.insertMany(topups, { ordered: false });
    fs.unlinkSync(req.file.path);

    res.json({ success: true, count: result.length });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Upload Moratorium CSV
router.post('/moratorium', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const data = await parseCSVFile(req.file.path);
    const moratoria = data.map(row => ({
      accNo: row.acc_no || row.account_no || '',
      moratoriumStart: row.moratorium_start || null,
      moratoriumEnd: row.moratorium_end || null,
      interestAccrual: row.interest_accrual || 'no',
      newEmiEndDate: row.new_emi_end_date || null,
      status: row.status || 'Active'
    })).filter(m => m.accNo);

    const result = await Moratorium.insertMany(moratoria, { ordered: false });
    fs.unlinkSync(req.file.path);

    res.json({ success: true, count: result.length });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
