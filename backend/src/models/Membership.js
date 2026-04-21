const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    membershipNo: { type: String, required: true, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'cancelled', 'expired'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Membership', membershipSchema);
