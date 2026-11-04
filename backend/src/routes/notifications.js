const router = require('express').Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { pageParams } = require('../utils/helpers');

router.use(requireAuth('customer'));

// GET /api/notifications  (the bell icon)
router.get('/', asyncHandler(async (req, res) => {
  const { limit, offset } = pageParams(req.query, 50);
  const [rows] = await db.query(
    `SELECT n.notification_id, n.title, n.message, n.is_read, n.created_at, o.order_code
       FROM notification n LEFT JOIN laundry_order o ON o.order_id = n.order_id
      WHERE n.customer_id = ? ORDER BY n.created_at DESC, n.notification_id DESC LIMIT ? OFFSET ?`,
    [req.user.id, limit, offset]);
  res.json(rows);
}));

// PATCH /api/notifications/read-all
router.patch('/read-all', asyncHandler(async (req, res) => {
  const [r] = await db.query('UPDATE notification SET is_read = TRUE WHERE customer_id = ?', [req.user.id]);
  res.json({ updated: r.affectedRows });
}));

// PATCH /api/notifications/:id/read
router.patch('/:id/read', asyncHandler(async (req, res) => {
  await db.query('UPDATE notification SET is_read = TRUE WHERE notification_id = ? AND customer_id = ?',
    [req.params.id, req.user.id]);
  res.json({ ok: true });
}));

module.exports = router;
