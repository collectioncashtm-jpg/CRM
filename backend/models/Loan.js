const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  accNo: { type: String, required: true },
  loanType: { 
    type: String, 
    enum: ['personal', 'business', 'home', 'vehicle', 'gold', 'other'],
    default: 'personal'
  },
  disbursedDate: { type: Date },
  disbursedAmt: { type: Number, default: 0 },
  interestRate: { type: Number, default: 12 },
  tenureMonths: { type: Number, default: 12 },
  emiAmount: { type: Number, default: 0 },
  totalPayable: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  overdue: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['active', 'closed', 'overdue', 'written_off', 'npa'], 
    default: 'active' 
  },
  purpose: { type: String },
  collateral: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

loanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Loan', loanSchema);
