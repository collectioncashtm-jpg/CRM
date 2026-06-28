const express = require('express');
const router = express.Router();
const { Topup, Customer } = require('../models');

router.get('/', async (req, res) => {
  try {
    const topups = await Topup.find().populate('customerId', 'name').sort({ createdAt: -1 });
    res.json({ success: true, data: topups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const topup = new Topup(req.body);
    await topup.save();
    res.status(201).json({ success: true, data: topup });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const result = await Topup.insertMany(req.body, { ordered: false });
    res.status(201).json({ success: true, count: result.length });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
