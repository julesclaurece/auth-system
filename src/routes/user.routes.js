const router = require('express').Router();
const { getProfile, getAllUsers, deleteUser } = require('../controllers/user.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');

router.get('/profile', authenticate, getProfile);
router.get('/', authenticate, requireRole('admin'), getAllUsers);
router.delete('/:id', authenticate, requireRole('admin'), deleteUser);

module.exports = router;
