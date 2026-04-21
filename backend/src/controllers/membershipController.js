const Membership = require('../models/Membership');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { addMonths } = require('../utils/dates');

const DURATION_MONTHS = { '6m': 6, '1y': 12, '2y': 24 };

async function nextMembershipNo() {
  const last = await Membership.findOne().sort({ createdAt: -1 }).lean();
  if (!last || !last.membershipNo) return 'M0001';
  const n = parseInt(String(last.membershipNo).slice(1), 10) || 0;
  return 'M' + String(n + 1).padStart(4, '0');
}

exports.create = asyncHandler(async (req, res) => {
  const { userId, duration = '6m', startDate } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const months = DURATION_MONTHS[duration];
  if (!months) return res.status(400).json({ errors: [{ field: 'duration', msg: 'Invalid duration' }] });

  const start = startDate ? new Date(startDate) : new Date();
  const end = addMonths(start, months);

  const membership = await Membership.create({
    membershipNo: await nextMembershipNo(),
    userId,
    startDate: start,
    endDate: end,
    status: 'active',
  });
  res.status(201).json({ membership });
});

exports.getByNo = asyncHandler(async (req, res) => {
  const membership = await Membership.findOne({ membershipNo: req.params.no }).populate(
    'userId',
    '-passwordHash'
  );
  if (!membership) return res.status(404).json({ message: 'Membership not found' });
  res.json({ membership });
});

exports.extend = asyncHandler(async (req, res) => {
  const { duration = '6m' } = req.body;
  const months = DURATION_MONTHS[duration];
  if (!months) return res.status(400).json({ errors: [{ field: 'duration', msg: 'Invalid duration' }] });

  const membership = await Membership.findOne({ membershipNo: req.params.no });
  if (!membership) return res.status(404).json({ message: 'Membership not found' });
  if (membership.status === 'cancelled')
    return res.status(400).json({ message: 'Cannot extend a cancelled membership' });

  const base = membership.endDate > new Date() ? membership.endDate : new Date();
  membership.endDate = addMonths(base, months);
  membership.status = 'active';
  await membership.save();
  res.json({ membership });
});

exports.cancel = asyncHandler(async (req, res) => {
  const membership = await Membership.findOneAndUpdate(
    { membershipNo: req.params.no },
    { status: 'cancelled' },
    { new: true }
  );
  if (!membership) return res.status(404).json({ message: 'Membership not found' });
  res.json({ membership });
});
