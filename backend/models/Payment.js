const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  name: { type: String, required: true },
  accNo: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['EMI Payment', 'Part Payment', 'Overdue Payment', 'Pre-closure', 'Top-up Payment'],
    default: 'EMI Payment'
  },
  date: { type: Date, default: Date.now },
  mode: { 
    type: String, 
    enum: ['cash', 'cheque', 'upi', 'bank_transfer', 'auto_debit'],
    default: 'cash'
  },
  transactionId: { type: String },
  notes: { type: String },
  recordedBy: { type: String, default: 'Admin' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
