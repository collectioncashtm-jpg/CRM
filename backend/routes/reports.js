const express = require('express');
const router = express.Router();
const { Customer, Payment, EmiPlan, Loan } = require('../models');

router.get('/portfolio', async (req, res) => {
  try {
    const customers = await Customer.countDocuments();
    const loans = await Loan.countDocuments();
    const totalDisbursed = await Customer.aggregate([{ $group: { _id: null, total: { $sum: '$disbursedAmt' } } }]);
    const totalOutstanding = await Customer.aggregate([{ $group: { _id: null, total: { $sum: '$overdue' } } }]);
    const emiPlans = await EmiPlan.countDocuments();

    const statusBreakdown = await Customer.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, amount: { $sum: '$disbursedAmt' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers: customers,
        totalLoans: loans,
        totalDisbursed: totalDisbursed[0]?.total || 0,
        totalOutstanding: totalOutstanding[0]?.total || 0,
        totalEmiPlans: emiPlans,
        statusBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/overdue', async (req, res) => {
  try {
    const overdue = await Customer.find({ overdue: { $gt: 0 } }).sort({ overdue: -1 });
    const total = overdue.reduce((sum, c) => sum + c.overdue, 0);

    res.json({
      success: true,
      data: { accounts: overdue, totalOverdue: total, count: overdue.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/collection', async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const monthlyPayments = await Payment.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    const dailyPayments = await Payment.aggregate([
      { $match: { date: { $gte: new Date(today.setDate(today.getDate() - 30)) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: { monthlyPayments, dailyPayments }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/emi-due', async (req, res) => {
  try {
    const today = new Date();
    const upcoming = await EmiPlan.find({
      status: 'active',
      emiEndDate: { $gte: today }
    }).sort({ emiEndDate: 1 }).limit(50);

    res.json({ success: true, data: upcoming });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
