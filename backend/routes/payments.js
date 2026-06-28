const express = require('express');
const router = express.Router();
const { Payment, Customer, Activity } = require('../models');

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Payment.countDocuments();
    res.json({
      success: true,
      data: payments,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalCollected = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const todayCollected = await Payment.aggregate([
      { $match: { date: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const thisMonth = await Payment.aggregate([
      { $match: { date: { $gte: new Date(today.getFullYear(), today.getMonth(), 1) } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalCollected: totalCollected[0]?.total || 0,
        todayCollected: todayCollected[0]?.total || 0,
        thisMonth: thisMonth[0]?.total || 0,
        totalTransactions: await Payment.countDocuments()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();

    // Update customer overdue if payment type is overdue
    if (payment.type === 'Overdue Payment' || payment.type === 'EMI Payment') {
      const customer = await Customer.findOne({ accNo: payment.accNo });
      if (customer && customer.overdue > 0) {
        customer.overdue = Math.max(0, customer.overdue - payment.amount);
        if (customer.overdue === 0 && customer.status === 'overdue') {
          customer.status = 'active';
        }
        await customer.save();
      }
    }

    await Activity.create({
      type: 'payment_received',
      description: `Payment of ₹${payment.amount} received from ${payment.name}`,
      customerName: payment.name,
      accNo: payment.accNo,
      amount: payment.amount
    });

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
