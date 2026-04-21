const router = require('express').Router();
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');
const ctrl = require('../controllers/transactionController');

router.use(verifyToken);

router.post(
  '/issue',
  [
    body('bookId').notEmpty().withMessage('Book is required'),
    body('membershipNo').trim().notEmpty().withMessage('Membership number is required'),
    body('issueDate').notEmpty().withMessage('Issue date is required'),
    body('returnDate').notEmpty().withMessage('Return date is required'),
  ],
  handleValidation,
  ctrl.issue
);

router.post(
  '/return',
  [
    body('serialNo').trim().notEmpty().withMessage('Serial number is required'),
    body('membershipNo').trim().notEmpty().withMessage('Membership number is required'),
  ],
  handleValidation,
  ctrl.markReturn
);

router.post('/:id/fine', ctrl.payFine);
router.get('/:id', ctrl.getById);

module.exports = router;
