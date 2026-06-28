const express = require('express');
const router = express.Router();
const { Loan, Customer } = require('../models');

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      const customers = await Customer.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { accNo: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      query.$or = [
        { customerId: { $in: customers.map(c => c._id) } },
        { accNo: { $regex: search, $options: 'i' } }
      ];
    }

    const loans = await Loan.find(query)
      .populate('customerId', 'name phoneNo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Loan.countDocuments(query);

    res.json({
      success: true,
      data: loans,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const loan = new Loan(req.body);
    await loan.save();
    res.status(201).json({ success: true, data: loan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!loan) return res.status(404).json({ success: false, message: 'Loan not found' });
    res.json({ success: true, data: loan });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Loan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Loan deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
