const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  idCard: { type: Boolean, default: false },
  proofOfIncome: { type: [String], default: [] },
  proofOfAddress: { type: Boolean, default: false },
  guarantorId: { type: Boolean, default: false },
  guarantorIncome: { type: [String], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Checklist', checklistSchema);
