const router = require('express').Router();
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/membershipController');

router.use(verifyToken, requireRole('admin'));

router.post(
  '/',
  [
    body('userId').trim().notEmpty().withMessage('User is required'),
    body('duration').isIn(['6m', '1y', '2y']).withMessage('Duration must be 6m/1y/2y'),
  ],
  handleValidation,
  ctrl.create
);

router.get('/:no', ctrl.getByNo);
router.put('/:no/extend', ctrl.extend);
router.put('/:no/cancel', ctrl.cancel);

module.exports = router;
