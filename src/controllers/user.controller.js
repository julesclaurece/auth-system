const pool = require('../config/database');

// GET /api/users/profile
const getProfile = async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, is_verified, created_at FROM users WHERE id = $1',
    [req.user.id]
  );
  if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });
  res.json(rows[0]);
};

// GET /api/users  (admin only)
const getAllUsers = async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, is_verified, created_at FROM users ORDER BY created_at DESC'
  );
  res.json(rows);
};

// DELETE /api/users/:id  (admin only)
const deleteUser = async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });
  res.json({ message: 'User deleted.' });
};

module.exports = { getProfile, getAllUsers, deleteUser };
