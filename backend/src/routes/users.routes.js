const router = require('express').Router();
const { body } = require('express-validator');
const { handleValidation } = require('../middleware/validate');
const { verifyToken, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/userController');

router.use(verifyToken, requireRole('admin'));

router.get('/', ctrl.list);
router.get('/by-username/:username', ctrl.getByUsername);

router.post(
  '/',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Role must be admin or user'),
  ],
  handleValidation,
  ctrl.create
);

router.put(
  '/:id',
  [body('name').trim().notEmpty().withMessage('Name is required')],
  handleValidation,
  ctrl.update
);

module.exports = router;
