const express = require('express');
const router = express.Router();
const { Customer, Activity } = require('../models');

// GET all customers with pagination, search, filter
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { accNo: { $regex: search, $options: 'i' } },
        { panCard: { $regex: search, $options: 'i' } },
        { phoneNo: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const customers = await Customer.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Customer.countDocuments(query);

    res.json({
      success: true,
      data: customers,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET customer stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Customer.countDocuments();
    const active = await Customer.countDocuments({ status: 'active' });
    const overdue = await Customer.countDocuments({ status: 'overdue' });
    const closed = await Customer.countDocuments({ status: 'closed' });

    const totalDisbursed = await Customer.aggregate([
      { $group: { _id: null, total: { $sum: '$disbursedAmt' } } }
    ]);

    const totalOverdue = await Customer.aggregate([
      { $group: { _id: null, total: { $sum: '$overdue' } } }
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        overdue,
        closed,
        totalDisbursed: totalDisbursed[0]?.total || 0,
        totalOverdue: totalOverdue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create customer
router.post('/', async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();

    await Activity.create({
      type: 'customer_added',
      description: `New customer ${customer.name} added`,
      customerName: customer.name,
      accNo: customer.accNo,
      performedBy: 'Admin'
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// PUT update customer
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

    await Activity.create({
      type: 'customer_updated',
      description: `Customer ${customer.name} updated`,
      customerName: customer.name,
      accNo: customer.accNo
    });

    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk create customers (from CSV)
router.post('/bulk', async (req, res) => {
  try {
    const customers = req.body;
    const result = await Customer.insertMany(customers, { ordered: false });

    await Activity.create({
      type: 'csv_uploaded',
      description: `${result.length} customers uploaded via CSV`,
      performedBy: 'Admin'
    });

    res.status(201).json({ success: true, count: result.length });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
