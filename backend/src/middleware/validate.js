const { validationResult } = require('express-validator');

function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  const errors = result.array().map((e) => ({ field: e.path, msg: e.msg }));
  return res.status(400).json({ errors });
}

module.exports = { handleValidation };
