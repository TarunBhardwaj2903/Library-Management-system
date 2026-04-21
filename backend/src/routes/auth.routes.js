const router = require('express').Router();
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const ctrl = require('../controllers/authController');

router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidation,
  ctrl.login
);

router.get('/me', verifyToken, ctrl.me);

module.exports = router;
