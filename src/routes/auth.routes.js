const router = require('express').Router();
const { register, verifyEmail, login, refresh, logout } = require('../controllers/auth.controller');
const { forgotPassword, resetPassword } = require('../controllers/password.controller');
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require('../middleware/validate.middleware');

router.post('/register', registerRules, register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', loginRules, login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/forgot-password', forgotPasswordRules, forgotPassword);
router.post('/reset-password/:token', resetPasswordRules, resetPassword);

module.exports = router;
