const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    serialNo: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true, index: true },
    author: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Book', 'Movie'], default: 'Book' },
    category: { type: String, required: true, trim: true },
    publisher: { type: String, required: true, trim: true },
    copiesTotal: { type: Number, required: true, min: 1 },
    copiesAvailable: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
