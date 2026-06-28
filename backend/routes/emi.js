const express = require('express');
const router = express.Router();
const { EmiPlan, Customer } = require('../models');

router.get('/', async (req, res) => {
  try {
    const plans = await EmiPlan.find().populate('customerId', 'name phoneNo').sort({ createdAt: -1 });
    res.json({ success: true, data: plans, total: plans.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const total = await EmiPlan.countDocuments();
    const active = await EmiPlan.countDocuments({ status: 'active' });
    const covered = await EmiPlan.distinct('accNo');
    res.json({ success: true, data: { total, active, covered: covered.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const plan = new EmiPlan(req.body);
    await plan.save();
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const plan = await EmiPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ success: false, message: 'EMI Plan not found' });
    res.json({ success: true, data: plan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await EmiPlan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'EMI Plan deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/bulk', async (req, res) => {
  try {
    const result = await EmiPlan.insertMany(req.body, { ordered: false });
    res.status(201).json({ success: true, count: result.length });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
