const express = require('express');
const router = express.Router();
const { Customer } = require('../models');

router.get('/', async (req, res) => {
  try {
    const overdue = await Customer.find({
      $or: [
        { status: 'overdue' },
        { overdue: { $gt: 0 } }
      ]
    }).sort({ overdue: -1 });

    res.json({ success: true, data: overdue, total: overdue.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalOverdue = await Customer.aggregate([
      { $match: { overdue: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$overdue' }, count: { $sum: 1 } } }
    ]);

    const bucket030 = await Customer.aggregate([
      { $match: { overdue: { $gt: 0, $lte: 30000 } } },
      { $group: { _id: null, total: { $sum: '$overdue' }, count: { $sum: 1 } } }
    ]);

    const bucket3160 = await Customer.aggregate([
      { $match: { overdue: { $gt: 30000, $lte: 60000 } } },
      { $group: { _id: null, total: { $sum: '$overdue' }, count: { $sum: 1 } } }
    ]);

    const bucket6190 = await Customer.aggregate([
      { $match: { overdue: { $gt: 60000, $lte: 90000 } } },
      { $group: { _id: null, total: { $sum: '$overdue' }, count: { $sum: 1 } } }
    ]);

    const bucket90plus = await Customer.aggregate([
      { $match: { overdue: { $gt: 90000 } } },
      { $group: { _id: null, total: { $sum: '$overdue' }, count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        totalOverdue: totalOverdue[0]?.total || 0,
        totalAccounts: totalOverdue[0]?.count || 0,
        buckets: {
          '0-30k': { amount: bucket030[0]?.total || 0, count: bucket030[0]?.count || 0 },
          '31-60k': { amount: bucket3160[0]?.total || 0, count: bucket3160[0]?.count || 0 },
          '61-90k': { amount: bucket6190[0]?.total || 0, count: bucket6190[0]?.count || 0 },
          '90k+': { amount: bucket90plus[0]?.total || 0, count: bucket90plus[0]?.count || 0 }
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
