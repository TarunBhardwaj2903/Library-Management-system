const Book = require('../models/Book');
const Membership = require('../models/Membership');
const Transaction = require('../models/Transaction');
const { asyncHandler } = require('../middleware/errorHandler');
const { addDays, startOfDay, diffDays } = require('../utils/dates');
const { calcFine } = require('../utils/fine');

exports.issue = asyncHandler(async (req, res) => {
  const { bookId, membershipNo, issueDate, returnDate, remarks } = req.body;

  const membership = await Membership.findOne({ membershipNo });
  if (!membership) return res.status(404).json({ message: 'Membership not found' });
  if (membership.status !== 'active')
    return res.status(400).json({ message: 'Membership is not active' });
  if (membership.endDate < new Date())
    return res.status(400).json({ message: 'Membership has expired' });

  const book = await Book.findById(bookId);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  if (book.copiesAvailable < 1)
    return res.status(400).json({ message: 'No copies currently available' });

  const issue = startOfDay(new Date(issueDate));
  const ret = startOfDay(new Date(returnDate));
  const today = startOfDay(new Date());

  const errors = [];
  if (issue < today) errors.push({ field: 'issueDate', msg: 'Issue date cannot be earlier than today' });
  if (diffDays(ret, issue) < 0) errors.push({ field: 'returnDate', msg: 'Return date must be on/after issue date' });
  if (diffDays(ret, issue) > 15) errors.push({ field: 'returnDate', msg: 'Return date cannot exceed 15 days from issue date' });
  if (errors.length) return res.status(400).json({ errors });

  book.copiesAvailable -= 1;
  await book.save();

  const txn = await Transaction.create({
    bookId: book._id,
    membershipId: membership._id,
    issueDate: issue,
    returnDate: ret,
    remarks: remarks || '',
    status: 'issued',
  });

  res.status(201).json({ transaction: txn });
});

exports.markReturn = asyncHandler(async (req, res) => {
  const { bookId, serialNo, membershipNo, actualReturnDate } = req.body;

  let book;
  if (bookId) book = await Book.findById(bookId);
  else if (serialNo) book = await Book.findOne({ serialNo });
  if (!book) return res.status(404).json({ message: 'Book not found' });

  const membership = await Membership.findOne({ membershipNo });
  if (!membership) return res.status(404).json({ message: 'Membership not found' });

  const txn = await Transaction.findOne({
    bookId: book._id,
    membershipId: membership._id,
    status: 'issued',
  });
  if (!txn) return res.status(404).json({ message: 'No active issue found for this book/member' });

  const actual = startOfDay(new Date(actualReturnDate || new Date()));
  txn.actualReturnDate = actual;
  txn.fine = calcFine(txn.returnDate, actual);
  txn.status = 'returned';
  await txn.save();

  res.json({
    transaction: txn,
    book: { id: book._id, title: book.title, author: book.author, serialNo: book.serialNo },
  });
});

exports.payFine = asyncHandler(async (req, res) => {
  const { finePaid, remarks } = req.body;
  const txn = await Transaction.findById(req.params.id);
  if (!txn) return res.status(404).json({ message: 'Transaction not found' });
  if (txn.status === 'closed') return res.status(400).json({ message: 'Transaction already closed' });
  if (txn.status !== 'returned')
    return res.status(400).json({ message: 'Book must be returned before paying fine' });

  if (txn.fine > 0 && !finePaid) {
    return res
      .status(400)
      .json({ errors: [{ field: 'finePaid', msg: 'Fine must be paid before completing' }] });
  }

  txn.finePaid = !!finePaid || txn.fine === 0;
  txn.remarks = remarks || txn.remarks;
  txn.status = 'closed';
  await txn.save();

  const book = await Book.findById(txn.bookId);
  if (book) {
    book.copiesAvailable = Math.min(book.copiesTotal, book.copiesAvailable + 1);
    await book.save();
  }

  res.json({ transaction: txn });
});

exports.getById = asyncHandler(async (req, res) => {
  const txn = await Transaction.findById(req.params.id)
    .populate('bookId')
    .populate({ path: 'membershipId', populate: { path: 'userId', select: '-passwordHash' } });
  if (!txn) return res.status(404).json({ message: 'Transaction not found' });
  res.json({ transaction: txn });
});
