const express = require('express');
const router = express.Router();
const { Moratorium } = require('../models');

router.get('/', async (req, res) => {
  try {
    const moratoria = await Moratorium.find().populate('customerId', 'name').sort({ createdAt: -1 });
    res.json({ success: true, data: moratoria });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const moratorium = new Moratorium(req.body);
    await moratorium.save();
    res.status(201).json({ success: true, data: moratorium });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const result = await Moratorium.insertMany(req.body, { ordered: false });
    res.status(201).json({ success: true, count: result.length });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
