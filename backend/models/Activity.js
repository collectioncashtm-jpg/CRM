const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['customer_added', 'customer_updated', 'payment_received', 'loan_created', 
           'emi_created', 'topup_created', 'moratorium_created', 'task_added', 
           'reminder_sent', 'csv_uploaded', 'status_changed'],
    required: true
  },
  description: { type: String, required: true },
  customerName: { type: String },
  accNo: { type: String },
  amount: { type: Number },
  performedBy: { type: String, default: 'Admin' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
