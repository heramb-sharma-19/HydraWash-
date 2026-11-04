const router = require('express').Router();
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');

// GET /api/public/stats -> website hero counters
router.get('/stats', asyncHandler(async (req, res) => {
  const [[s]] = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM laundry_order WHERE status = 'Delivered')                          AS delivered,
      (SELECT COUNT(*) FROM customer WHERE account_status <> 'Deleted')                         AS customers,
      (SELECT COUNT(*) FROM laundry_order WHERE status NOT IN ('Delivered','Reverted'))        AS in_progress,
      (SELECT COALESCE(SUM(total_count),0) FROM laundry_order WHERE status = 'Delivered')      AS items_cleaned`);
  res.json(s);
}));

// GET /api/public/track/:code -> website tracker (no personal data returned)
router.get('/track/:code', asyncHandler(async (req, res) => {
  if (!/^\d{6}$/.test(req.params.code)) throw new HttpError(400, 'Order code must be 6 digits');
  const [[o]] = await db.query(
    'SELECT order_id, order_code, status, order_date, total_count FROM laundry_order WHERE order_code = ?',
    [req.params.code]);
  if (!o) throw new HttpError(404, 'Order not found');
  const [timeline] = await db.query(
    'SELECT new_status AS status, changed_at FROM order_status_history WHERE order_id = ? ORDER BY history_id',
    [o.order_id]);
  res.json({ order_code: o.order_code, status: o.status, order_date: o.order_date, total_count: o.total_count, timeline });
}));

module.exports = router;
