const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

exports.list = asyncHandler(async (req, res) => {
  const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
  res.json({ users });
});

exports.getByUsername = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() }).select('-passwordHash');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
});

exports.create = asyncHandler(async (req, res) => {
  const { username, password, name, email, phone, role } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username: String(username).toLowerCase(),
    passwordHash,
    name,
    email,
    phone,
    role: role || 'user',
  });
  res.status(201).json({ user: { id: user._id, username: user.username, name: user.name, role: user.role } });
});

exports.update = asyncHandler(async (req, res) => {
  const { name, email, phone, role, password } = req.body;
  const update = { name, email, phone };
  if (role) update.role = role;
  if (password) update.passwordHash = await bcrypt.hash(password, 10);

  const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true }).select(
    '-passwordHash'
  );
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ user });
});
