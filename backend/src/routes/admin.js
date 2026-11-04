const router = require('express').Router();
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { STATUSES, NEXT_STATUS, pageParams, requireFields, isDate } = require('../utils/helpers');

const ANY_STAFF = ['Admin', 'Operator', 'Delivery'];
const OPS = ['Admin', 'Operator'];

// ---------------------------------------------------------------- ORDERS
// GET /api/admin/orders?status=&q=&page=   (q matches order code, bag id or student name)
router.get('/orders', requireAuth(...ANY_STAFF), asyncHandler(async (req, res) => {
  const { page, limit, offset } = pageParams(req.query);
  const where = ['1=1']; const params = [];
  if (req.query.status) {
    if (!STATUSES.includes(req.query.status)) throw new HttpError(400, 'Unknown status');
    where.push('o.status = ?'); params.push(req.query.status);
  }
  if (req.query.q) {
    const like = `%${String(req.query.q).replace(/[%_]/g, '')}%`;
    where.push('(o.order_code LIKE ? OR c.bag_id LIKE ? OR c.name LIKE ?)'); params.push(like, like, like);
  }
  const clause = where.join(' AND ');
  const base = `FROM laundry_order o JOIN customer c ON c.customer_id = o.customer_id
                JOIN residence r ON r.residence_id = c.residence_id WHERE ${clause}`;
  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total ${base}`, params);
  const [rows] = await db.query(
    `SELECT o.order_code, o.order_date, o.status, o.total_count, c.name AS customer, c.bag_id, r.residence_name
     ${base} ORDER BY o.order_date DESC, o.order_id DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
  res.json({ page, limit, total, orders: rows });
}));

// GET /api/admin/orders/:code
router.get('/orders/:code', requireAuth(...ANY_STAFF), asyncHandler(async (req, res) => {
  const [[o]] = await db.query(
    `SELECT o.order_id, o.order_code, o.order_date, o.pickup_date, o.delivery_date, o.status,
            o.total_count, o.total_amount, o.remarks,
            c.name AS customer, c.phone, c.bag_id, r.residence_name
       FROM laundry_order o JOIN customer c ON c.customer_id = o.customer_id
       JOIN residence r ON r.residence_id = c.residence_id WHERE o.order_code = ?`, [req.params.code]);
  if (!o) throw new HttpError(404, 'Order not found');
  const [items] = await db.query(
    `SELECT i.item_name, s.service_name, oi.quantity, oi.subtotal FROM order_item oi
       JOIN item i ON i.item_id = oi.item_id JOIN service s ON s.service_id = oi.service_id
      WHERE oi.order_id = ? ORDER BY i.item_name`, [o.order_id]);
  const [timeline] = await db.query(
    `SELECT h.new_status AS status, h.note, h.changed_at, s.name AS changed_by
       FROM order_status_history h LEFT JOIN staff s ON s.staff_id = h.changed_by
      WHERE h.order_id = ? ORDER BY h.history_id`, [o.order_id]);
  const [deliveries] = await db.query(
    `SELECT d.delivery_id, d.delivery_type, d.scheduled_time, d.actual_time, d.status, s.name AS staff
       FROM delivery d LEFT JOIN staff s ON s.staff_id = d.staff_id WHERE d.order_id = ?`, [o.order_id]);
  delete o.order_id;
  res.json({ ...o, items, timeline, deliveries, next_statuses: NEXT_STATUS[o.status] });
}));

// PATCH /api/admin/orders/:code/status   body: { status, note? }
// Uses the stored procedure; the trigger enforces the workflow and writes history + notification.
router.patch('/orders/:code/status', requireAuth(...ANY_STAFF), asyncHandler(async (req, res) => {
  requireFields(req.body, ['status']);
  const { status, note } = req.body;
  if (!STATUSES.includes(status)) throw new HttpError(400, 'Unknown status');
  if (req.user.role === 'Delivery' && status !== 'Delivered') throw new HttpError(403, 'Delivery staff can only mark orders Delivered');
  if (status === 'Reverted' && !note) throw new HttpError(400, 'A note (reason) is required when reverting an order');

  await db.query('CALL sp_update_order_status(?, ?, ?, ?)',
    [req.params.code, status, req.user.id, note ? String(note).slice(0, 255) : null]);
  res.json({ order_code: req.params.code, status, next_statuses: NEXT_STATUS[status] });
}));

// ------------------------------------------------------------ DELIVERIES
// POST /api/admin/orders/:code/deliveries  body: { delivery_type, scheduled_time, staff_id? }
router.post('/orders/:code/deliveries', requireAuth(...OPS), asyncHandler(async (req, res) => {
  requireFields(req.body, ['delivery_type', 'scheduled_time']);
  const { delivery_type, scheduled_time, staff_id } = req.body;
  if (!['Pickup', 'Delivery'].includes(delivery_type)) throw new HttpError(400, 'delivery_type must be Pickup or Delivery');
  if (isNaN(Date.parse(scheduled_time))) throw new HttpError(400, 'scheduled_time is not a valid date-time');

  const [[o]] = await db.query('SELECT order_id FROM laundry_order WHERE order_code = ?', [req.params.code]);
  if (!o) throw new HttpError(404, 'Order not found');
  if (staff_id) {
    const [[s]] = await db.query("SELECT staff_id FROM staff WHERE staff_id = ? AND role = 'Delivery' AND is_active", [staff_id]);
    if (!s) throw new HttpError(400, 'staff_id must be an active Delivery staff member');
  }
  const [r] = await db.query(
    'INSERT INTO delivery (order_id, staff_id, delivery_type, scheduled_time) VALUES (?, ?, ?, ?)',
    [o.order_id, staff_id || null, delivery_type, new Date(scheduled_time)]);
  res.status(201).json({ delivery_id: r.insertId });
}));

// PATCH /api/admin/deliveries/:id/complete
router.patch('/deliveries/:id/complete', requireAuth(...ANY_STAFF), asyncHandler(async (req, res) => {
  const [[d]] = await db.query('SELECT delivery_id, staff_id, status FROM delivery WHERE delivery_id = ?', [req.params.id]);
  if (!d) throw new HttpError(404, 'Delivery not found');
  if (req.user.role === 'Delivery' && d.staff_id !== req.user.id) throw new HttpError(403, 'This task is assigned to someone else');
  if (d.status !== 'Scheduled') throw new HttpError(409, `Delivery already ${d.status}`);
  await db.query("UPDATE delivery SET status = 'Completed', actual_time = NOW() WHERE delivery_id = ?", [d.delivery_id]);
  res.json({ ok: true });
}));

// --------------------------------------------------------------- REPORTS
router.get('/reports/daily', requireAuth(...OPS), asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM v_daily_report ORDER BY day DESC LIMIT 30');
  res.json(rows);
}));

router.get('/queue', requireAuth(...ANY_STAFF), asyncHandler(async (req, res) => {
  const [rows] = await db.query('SELECT * FROM v_staff_queue ORDER BY order_date');
  res.json(rows);
}));

// ------------------------------------------------------------- CUSTOMERS
router.get('/customers', requireAuth(...OPS), asyncHandler(async (req, res) => {
  const { limit, offset } = pageParams(req.query);
  const like = `%${String(req.query.q || '').replace(/[%_]/g, '')}%`;
  const [rows] = await db.query(
    `SELECT c.customer_id, c.bag_id, c.name, c.email, c.phone, c.account_status, r.residence_name
       FROM customer c JOIN residence r ON r.residence_id = c.residence_id
      WHERE c.name LIKE ? OR c.bag_id LIKE ? OR c.email LIKE ?
      ORDER BY c.name LIMIT ? OFFSET ?`, [like, like, like, limit, offset]);
  res.json(rows);
}));

// POST /api/admin/customers/:id/subscription   body: { plan_id, payment_mode? }
router.post('/customers/:id/subscription', requireAuth('Admin'), asyncHandler(async (req, res) => {
  requireFields(req.body, ['plan_id']);
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[plan]] = await conn.query('SELECT plan_id, price, validity_days FROM subscription_plan WHERE plan_id = ?', [req.body.plan_id]);
    if (!plan) throw new HttpError(404, 'Plan not found');
    const [[cust]] = await conn.query("SELECT customer_id FROM customer WHERE customer_id = ? AND account_status <> 'Deleted'", [req.params.id]);
    if (!cust) throw new HttpError(404, 'Customer not found');

    await conn.query("UPDATE customer_subscription SET status = 'Expired' WHERE customer_id = ? AND status = 'Active'", [cust.customer_id]);
    const [r] = await conn.query(
      `INSERT INTO customer_subscription (customer_id, plan_id, start_date, end_date)
       VALUES (?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY))`, [cust.customer_id, plan.plan_id, plan.validity_days]);
    if (req.body.payment_mode) {
      await conn.query(
        "INSERT INTO payment (subscription_id, amount, mode, status, paid_at) VALUES (?, ?, ?, 'Success', NOW())",
        [r.insertId, plan.price, req.body.payment_mode]);
    }
    await conn.commit();
    res.status(201).json({ subscription_id: r.insertId });
  } catch (err) { await conn.rollback(); throw err; }
  finally { conn.release(); }
}));

// -------------------------------------------------- ACCOUNT DELETION QUEUE
router.get('/deletion-requests', requireAuth('Admin'), asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT d.request_id, d.reason, d.requested_at, d.status, c.name, c.bag_id, c.email
       FROM account_deletion_request d JOIN customer c ON c.customer_id = d.customer_id
      WHERE d.status = 'Pending' ORDER BY d.requested_at`);
  res.json(rows);
}));

// PATCH /api/admin/deletion-requests/:id   body: { action: 'approve' | 'reject' }
// Approve = anonymise personal data (orders stay for records) and block login.
router.patch('/deletion-requests/:id', requireAuth('Admin'), asyncHandler(async (req, res) => {
  const { action } = req.body;
  if (!['approve', 'reject'].includes(action)) throw new HttpError(400, 'action must be approve or reject');
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [[d]] = await conn.query("SELECT request_id, customer_id FROM account_deletion_request WHERE request_id = ? AND status = 'Pending' FOR UPDATE", [req.params.id]);
    if (!d) throw new HttpError(404, 'No pending request with that id');

    await conn.query('UPDATE account_deletion_request SET status = ?, processed_by = ?, processed_at = NOW() WHERE request_id = ?',
      [action === 'approve' ? 'Approved' : 'Rejected', req.user.id, d.request_id]);
    if (action === 'approve') {
      await conn.query(
        `UPDATE customer SET name = 'Deleted User', phone = '0000000000', profile_photo = NULL,
                email = CONCAT('deleted_', customer_id, '@deleted.invalid'),
                bag_id = CONCAT('DEL', customer_id), password_hash = '!', account_status = 'Deleted'
          WHERE customer_id = ?`, [d.customer_id]);
    } else {
      await conn.query("UPDATE customer SET account_status = 'Active' WHERE customer_id = ?", [d.customer_id]);
    }
    await conn.commit();
    res.json({ ok: true, action });
  } catch (err) { await conn.rollback(); throw err; }
  finally { conn.release(); }
}));

module.exports = router;
