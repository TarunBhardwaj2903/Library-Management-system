const Book = require('../models/Book');
const { asyncHandler } = require('../middleware/errorHandler');

exports.create = asyncHandler(async (req, res) => {
  const { serialNo, title, author, type, category, publisher, copiesTotal } = req.body;
  const total = Number(copiesTotal);
  const book = await Book.create({
    serialNo,
    title,
    author,
    type,
    category,
    publisher,
    copiesTotal: total,
    copiesAvailable: total,
  });
  res.status(201).json({ book });
});

exports.update = asyncHandler(async (req, res) => {
  const { serialNo, title, author, type, category, publisher, copiesTotal } = req.body;

  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });

  if (copiesTotal !== undefined) {
    const newTotal = Number(copiesTotal);
    const delta = newTotal - book.copiesTotal;
    book.copiesTotal = newTotal;
    book.copiesAvailable = Math.max(0, book.copiesAvailable + delta);
  }
  if (serialNo) book.serialNo = serialNo;
  if (title) book.title = title;
  if (author) book.author = author;
  if (type) book.type = type;
  if (category) book.category = category;
  if (publisher) book.publisher = publisher;

  await book.save();
  res.json({ book });
});

exports.getById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json({ book });
});

exports.list = asyncHandler(async (req, res) => {
  const books = await Book.find().sort({ createdAt: -1 });
  res.json({ books });
});
