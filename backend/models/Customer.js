const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  panCard: { type: String, trim: true, uppercase: true },
  phoneNo: { type: String, trim: true },
  accNo: { type: String, required: true, unique: true, trim: true },
  disbursedDate: { type: Date },
  disbursedAmt: { type: Number, default: 0 },
  overdue: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['active', 'closed', 'overdue', 'written_off'], 
    default: 'active' 
  },
  email: { type: String, trim: true },
  address: { type: String, trim: true },
  dob: { type: Date },
  agentAssigned: { type: String, default: 'Admin' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

customerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

customerSchema.index({ name: 'text', accNo: 'text', panCard: 'text', phoneNo: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
