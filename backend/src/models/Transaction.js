const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    membershipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Membership', required: true },
    issueDate: { type: Date, required: true },
    returnDate: { type: Date, required: true },
    actualReturnDate: { type: Date },
    fine: { type: Number, default: 0, min: 0 },
    finePaid: { type: Boolean, default: false },
    remarks: { type: String, trim: true },
    status: { type: String, enum: ['issued', 'returned', 'closed'], default: 'issued' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
