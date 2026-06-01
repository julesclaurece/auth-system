const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const pool = require('../config/database');
const { sendEmail } = require('../config/email');
const { resetPasswordEmail } = require('../utils/emailTemplates');

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { email } = req.body;

  const { rows } = await pool.query('SELECT id, name FROM users WHERE email = $1', [email]);

  // Always return 200 to prevent email enumeration
  if (rows.length === 0)
    return res.json({ message: 'If that email exists, a reset link has been sent.' });

  const user = rows[0];
  const resetToken = uuidv4();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await pool.query(
    'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
    [resetToken, expires, user.id]
  );

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  try {
    await sendEmail({
      to: email,
      subject: 'Reset your password',
      html: resetPasswordEmail(user.name, resetUrl),
    });
  } catch (err) {
    console.error('Email send failed:', err.message);
  }

  res.json({ message: 'If that email exists, a reset link has been sent.' });
};

// POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { token } = req.params;
  const { password } = req.body;

  const { rows } = await pool.query(
    'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
    [token]
  );

  if (rows.length === 0)
    return res.status(400).json({ message: 'Invalid or expired reset token.' });

  const hashed = await bcrypt.hash(password, 12);

  await pool.query(
    `UPDATE users
     SET password = $1, reset_token = NULL, reset_token_expires = NULL
     WHERE id = $2`,
    [hashed, rows[0].id]
  );

  // Revoke all refresh tokens for this user on password change
  await pool.query('DELETE FROM refresh_tokens WHERE user_id = $1', [rows[0].id]);

  res.json({ message: 'Password reset successfully. Please log in with your new password.' });
};

module.exports = { forgotPassword, resetPassword };
