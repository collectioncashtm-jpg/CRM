const mongoose = require('mongoose');

const emiPlanSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  name: { type: String, required: true },
  dob: { type: Date },
  panCard: { type: String },
  mobile: { type: String },
  address: { type: String },
  accNo: { type: String, required: true },
  emiStartDate: { type: Date },
  emiEndDate: { type: Date },
  totalEmi: { type: Number, default: 0 },
  totalPaidEmi: { type: Number, default: 0 },
  totalAmt: { type: Number, default: 0 },
  amtLeft: { type: Number, default: 0 },
  monthlyEmi: { type: Number, default: 0 },
  interestRate: { type: Number, default: 12 },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'defaulted'], 
    default: 'active' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

emiPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('EmiPlan', emiPlanSchema);
