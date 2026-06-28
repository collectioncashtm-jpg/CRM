const express = require('express');
const router = express.Router();
const { Customer, Payment, EmiPlan, Task, Activity } = require('../models');

router.get('/', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Basic counts
    const totalCustomers = await Customer.countDocuments();
    const activeLoans = await Customer.countDocuments({ status: 'active' });
    const overdueLoans = await Customer.countDocuments({ status: 'overdue' });
    const closedLoans = await Customer.countDocuments({ status: 'closed' });

    // Financial stats
    const totalDisbursed = await Customer.aggregate([{ $group: { _id: null, total: { $sum: '$disbursedAmt' } } }]);
    const totalOutstanding = await Customer.aggregate([{ $group: { _id: null, total: { $sum: '$overdue' } } }]);

    // Today's collections
    const todayCollections = await Payment.aggregate([
      { $match: { date: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // EMI plans count
    const emiPlans = await EmiPlan.countDocuments();
    const activeEmi = await EmiPlan.countDocuments({ status: 'active' });

    // Pending tasks
    const pendingTasks = await Task.countDocuments({ done: false });

    // Recent activities
    const recentActivities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('type description customerName amount createdAt');

    // Collection trend (last 7 days)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayCollections = await Payment.aggregate([
        { $match: { date: { $gte: date, $lt: nextDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      last7Days.push({
        date: date.toISOString().split('T')[0],
        amount: dayCollections[0]?.total || 0
      });
    }

    res.json({
      success: true,
      data: {
        kpis: {
          totalCustomers,
          activeLoans,
          overdueLoans,
          closedLoans,
          totalDisbursed: totalDisbursed[0]?.total || 0,
          totalOutstanding: totalOutstanding[0]?.total || 0,
          todayCollections: todayCollections[0]?.total || 0,
          todayCollectionCount: todayCollections[0]?.count || 0,
          emiPlans,
          activeEmi,
          pendingTasks
        },
        collectionTrend: last7Days,
        recentActivities
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
