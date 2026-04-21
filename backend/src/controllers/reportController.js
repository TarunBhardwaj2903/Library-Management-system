const Book = require('../models/Book');
const { asyncHandler } = require('../middleware/errorHandler');

exports.searchBooks = asyncHandler(async (req, res) => {
  const { title, author, type, category, serialNo } = req.query;

  const hasFilter = [title, author, type, category, serialNo].some(
    (v) => v !== undefined && String(v).trim() !== ''
  );
  if (!hasFilter) {
    return res
      .status(400)
      .json({ errors: [{ field: 'search', msg: 'Please provide at least one search field' }] });
  }

  const q = {};
  if (title) q.title = { $regex: String(title).trim(), $options: 'i' };
  if (author) q.author = { $regex: String(author).trim(), $options: 'i' };
  if (category) q.category = { $regex: String(category).trim(), $options: 'i' };
  if (serialNo) q.serialNo = { $regex: String(serialNo).trim(), $options: 'i' };
  if (type) q.type = type;

  const books = await Book.find(q).sort({ title: 1 });
  res.json({ books });
});
