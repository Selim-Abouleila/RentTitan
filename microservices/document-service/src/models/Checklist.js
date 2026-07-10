const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  idCard: { type: Boolean, default: false },
  proofOfIncome: { type: Boolean, default: false },
  proofOfAddress: { type: Boolean, default: false },
  guarantorId: { type: Boolean, default: false },
  guarantorIncome: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Checklist', checklistSchema);
