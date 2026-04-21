function errorHandler(err, req, res, next) {
  if (err && err.code === 11000) {
    return res.status(409).json({ message: 'Duplicate value', keyValue: err.keyValue });
  }
  if (err && err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, msg: e.message }));
    return res.status(400).json({ errors });
  }
  console.error('[error]', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };
