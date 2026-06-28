const mongoose = require('mongoose');

const moratoriumSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  accNo: { type: String, required: true },
  moratoriumStart: { type: Date, required: true },
  moratoriumEnd: { type: Date, required: true },
  interestAccrual: { 
    type: String, 
    enum: ['yes', 'no'], 
    default: 'no' 
  },
  newEmiEndDate: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'cancelled'], 
    default: 'active' 
  },
  reason: { type: String },
  approvedBy: { type: String, default: 'Admin' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Moratorium', moratoriumSchema);
