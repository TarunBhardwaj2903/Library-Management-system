const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username: String(username).toLowerCase() });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user._id.toString(), role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  res.json({
    token,
    user: { id: user._id, username: user.username, name: user.name, role: user.role },
  });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-passwordHash');
  res.json({ user });
});
