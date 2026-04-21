const router = require('express').Router();
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/bookController');

router.get('/', verifyToken, ctrl.list);
router.get('/:id', verifyToken, ctrl.getById);

const required = (f) => body(f).trim().notEmpty().withMessage(`${f} is required`);

router.post(
  '/',
  verifyToken,
  requireRole('admin'),
  [
    required('serialNo'),
    required('title'),
    required('author'),
    body('type').isIn(['Book', 'Movie']).withMessage('Type must be Book or Movie'),
    required('category'),
    required('publisher'),
    body('copiesTotal').isInt({ min: 1 }).withMessage('copiesTotal must be at least 1'),
  ],
  handleValidation,
  ctrl.create
);

router.put(
  '/:id',
  verifyToken,
  requireRole('admin'),
  [
    required('serialNo'),
    required('title'),
    required('author'),
    body('type').isIn(['Book', 'Movie']).withMessage('Type must be Book or Movie'),
    required('category'),
    required('publisher'),
    body('copiesTotal').isInt({ min: 1 }).withMessage('copiesTotal must be at least 1'),
  ],
  handleValidation,
  ctrl.update
);

module.exports = router;
