const router = require('express').Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { isPhone } = require('../utils/helpers');

router.use(requireAuth('customer'));

const PROFILE_SQL = `
  SELECT c.customer_id, c.name, c.email, c.phone, c.bag_id, c.profile_photo, c.account_status,
         ca.campus_name AS campus, r.residence_name AS residence, r.residence_id
    FROM customer c
    JOIN residence r ON r.residence_id = c.residence_id
    JOIN campus ca   ON ca.campus_id   = r.campus_id
   WHERE c.customer_id = ?`;

async function getQuota(customerId) {
  const [[q]] = await db.query(
    `SELECT plan_name, cycles_used, cycles_total, cycles_left, end_date
       FROM v_customer_quota WHERE customer_id = ? AND end_date >= CURDATE()
      ORDER BY end_date DESC LIMIT 1`, [customerId]);
  return q || null;
}

// GET /api/me -> Profile screen (Personal Info + Facility Info)
router.get('/', asyncHandler(async (req, res) => {
  const [[p]] = await db.query(PROFILE_SQL, [req.user.id]);
  res.json(p);
}));

// PATCH /api/me -> edit profile
router.patch('/', asyncHandler(async (req, res) => {
  const { name, phone, residence_id, profile_photo } = req.body;
  if (phone !== undefined && !isPhone(String(phone))) throw new HttpError(400, 'Invalid phone number');
  await db.query(
    `UPDATE customer SET name = COALESCE(?, name), phone = COALESCE(?, phone),
            residence_id = COALESCE(?, residence_id), profile_photo = COALESCE(?, profile_photo)
      WHERE customer_id = ?`,
    [name ?? null, phone ?? null, residence_id ?? null, profile_photo ?? null, req.user.id]);
  const [[p]] = await db.query(PROFILE_SQL, [req.user.id]);
  res.json(p);
}));

// GET /api/me/home -> Home screen: header, "Wash Cycles Used 6/30", Recent Orders
router.get('/home', asyncHandler(async (req, res) => {
  const [[p]] = await db.query(PROFILE_SQL, [req.user.id]);
  const quota = await getQuota(req.user.id);
  const [recent] = await db.query(
    `SELECT order_code, order_date, status, total_count FROM laundry_order
      WHERE customer_id = ? ORDER BY order_date DESC, order_id DESC LIMIT 3`, [req.user.id]);
  const [[n]] = await db.query(
    'SELECT COUNT(*) AS unread FROM notification WHERE customer_id = ? AND is_read = FALSE', [req.user.id]);
  res.json({ name: p.name, residence: p.residence, quota, recent_orders: recent, unread_notifications: n.unread });
}));

// GET /api/me/subscription
router.get('/subscription', asyncHandler(async (req, res) => res.json(await getQuota(req.user.id))));

// POST /api/me/deletion-request -> "Request Account Deletion"
router.post('/deletion-request', asyncHandler(async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[open]] = await conn.query(
      "SELECT request_id FROM account_deletion_request WHERE customer_id = ? AND status = 'Pending'", [req.user.id]);
    if (open) throw new HttpError(409, 'A deletion request is already pending');
    await conn.query('INSERT INTO account_deletion_request (customer_id, reason) VALUES (?, ?)',
      [req.user.id, (req.body.reason || '').slice(0, 255) || null]);
    await conn.query("UPDATE customer SET account_status = 'DeletionRequested' WHERE customer_id = ?", [req.user.id]);
    await conn.commit();
    res.status(201).json({ message: 'Deletion request submitted. An admin will process it.' });
  } catch (err) { await conn.rollback(); throw err; }
  finally { conn.release(); }
}));

module.exports = router;
