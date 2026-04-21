const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const ctrl = require('../controllers/reportController');

router.use(verifyToken);

router.get('/books', ctrl.searchBooks);

module.exports = router;
