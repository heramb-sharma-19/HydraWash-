const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { sign } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { requireFields, isEmail, isPhone } = require('../utils/helpers');

// POST /api/auth/register  (student sign-up)
router.post('/register', asyncHandler(async (req, res) => {
  requireFields(req.body, ['name', 'email', 'phone', 'password', 'bag_id', 'residence_id']);
  const { name, email, phone, password, bag_id, residence_id } = req.body;
  if (!isEmail(email)) throw new HttpError(400, 'Invalid email');
  if (!isPhone(phone)) throw new HttpError(400, 'Invalid phone number');
  if (String(password).length < 8) throw new HttpError(400, 'Password must be at least 8 characters');

  const hash = await bcrypt.hash(String(password), 10);
  let result;
  try {
    [result] = await db.query(
      `INSERT INTO customer (bag_id, name, email, phone, password_hash, residence_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [String(bag_id).trim().toUpperCase(), name.trim(), email.trim().toLowerCase(), phone.trim(), hash, residence_id]
    );
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw new HttpError(409, 'Email or Bag ID is already registered');
    if (err.code === 'ER_NO_REFERENCED_ROW_2') throw new HttpError(400, 'Invalid residence_id');
    throw err;
  }
  const token = sign({ id: result.insertId, role: 'customer' });
  res.status(201).json({ token, customer_id: result.insertId });
}));

// POST /api/auth/login  (student)
router.post('/login', asyncHandler(async (req, res) => {
  requireFields(req.body, ['email', 'password']);
  const [[c]] = await db.query(
    'SELECT customer_id, name, password_hash, account_status FROM customer WHERE email = ?',
    [String(req.body.email).trim().toLowerCase()]
  );
  const ok = c && c.account_status !== 'Deleted' && await bcrypt.compare(String(req.body.password), c.password_hash);
  if (!ok) throw new HttpError(401, 'Invalid email or password');   // same message for both cases
  res.json({ token: sign({ id: c.customer_id, role: 'customer' }), name: c.name });
}));

// POST /api/auth/staff/login  (admin / operator / delivery)
router.post('/staff/login', asyncHandler(async (req, res) => {
  requireFields(req.body, ['email', 'password']);
  const [[s]] = await db.query(
    'SELECT staff_id, name, role, password_hash, is_active FROM staff WHERE email = ?',
    [String(req.body.email).trim().toLowerCase()]
  );
  const ok = s && s.is_active && await bcrypt.compare(String(req.body.password), s.password_hash);
  if (!ok) throw new HttpError(401, 'Invalid email or password');
  res.json({ token: sign({ id: s.staff_id, role: s.role }), name: s.name, role: s.role });
}));

module.exports = router;
