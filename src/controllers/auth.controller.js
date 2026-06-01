const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const pool = require('../config/database');
const { sendEmail } = require('../config/email');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { verificationEmail, resetPasswordEmail } = require('../utils/emailTemplates');

const REFRESH_TOKEN_TTL_DAYS = 7;

// POST /api/auth/register
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { name, email, password } = req.body;

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0)
    return res.status(409).json({ message: 'Email already in use.' });

  const hashed = await bcrypt.hash(password, 12);
  const isDemo = process.env.DEMO_MODE === 'true';
  const verificationToken = isDemo ? null : uuidv4();

  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password, verification_token, is_verified)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role`,
    [name, email, hashed, verificationToken, isDemo]
  );

  if (!isDemo) {
    const verifyUrl = `${process.env.APP_URL}/api/auth/verify-email/${verificationToken}`;
    try {
      await sendEmail({
        to: email,
        subject: 'Verify your email',
        html: verificationEmail(name, verifyUrl),
      });
    } catch (err) {
      console.error('Verification email failed:', err.message);
    }
  }

  res.status(201).json({
    message: isDemo
      ? 'Registration successful. You can log in immediately.'
      : 'Registration successful. Please check your email to verify your account.',
    user: rows[0],
  });
};

// GET /api/auth/verify-email/:token
const verifyEmail = async (req, res) => {
  const { token } = req.params;

  const { rows } = await pool.query(
    `UPDATE users SET is_verified = true, verification_token = NULL
     WHERE verification_token = $1 RETURNING id`,
    [token]
  );

  if (rows.length === 0)
    return res.redirect(`${process.env.FRONTEND_URL}/email-verified?success=false`);

  res.redirect(`${process.env.FRONTEND_URL}/email-verified?success=true`);
};

// POST /api/auth/login
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

  const { email, password } = req.body;

  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];

  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: 'Invalid email or password.' });

  if (!user.is_verified)
    return res.status(403).json({ message: 'Please verify your email before logging in.' });

  const payload = { id: user.id, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, refreshToken, expiresAt]
  );

  res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at },
  });
};

// POST /api/auth/refresh
const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'Refresh token required.' });

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired refresh token.' });
  }

  const { rows } = await pool.query(
    'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
    [refreshToken]
  );

  if (rows.length === 0)
    return res.status(401).json({ message: 'Refresh token revoked or expired.' });

  // Rotate: delete old, issue new
  await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);

  const newAccessToken = generateAccessToken({ id: payload.id, role: payload.role });
  const newRefreshToken = generateRefreshToken({ id: payload.id, role: payload.role });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [payload.id, newRefreshToken, expiresAt]
  );

  res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
};

// POST /api/auth/logout
const logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  }
  res.json({ message: 'Logged out successfully.' });
};

module.exports = { register, verifyEmail, login, refresh, logout };
