const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  priority: { 
    type: String, 
    enum: ['High', 'Medium', 'Low'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  assignedTo: { type: String, default: 'Admin' },
  customerAccNo: { type: String },
  done: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('Task', taskSchema);
