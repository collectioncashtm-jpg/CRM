const mongoose = require('mongoose');

const topupSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  accNo: { type: String, required: true },
  topupAmount: { type: Number, required: true },
  emiStartDate: { type: Date },
  emiEndDate: { type: Date },
  monthlyEmi: { type: Number, default: 0 },
  interestRate: { type: Number, default: 12 },
  status: { 
    type: String, 
    enum: ['active', 'closed'], 
    default: 'active' 
  },
  reason: { type: String },
  approvedBy: { type: String, default: 'Admin' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Topup', topupSchema);
