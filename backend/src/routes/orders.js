const router = require('express').Router();
const crypto = require('crypto');
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const HttpError = require('../utils/httpError');
const { STATUSES, pageParams, isDate } = require('../utils/helpers');

router.use(requireAuth('customer'));

// GET /api/orders?status=Pending&q=947&page=1&limit=10
// -> "My Orders" screen: status chips + "Search Order ID" box
router.get('/', asyncHandler(async (req, res) => {
  const { page, limit, offset } = pageParams(req.query);
  const where = ['customer_id = ?'];
  const params = [req.user.id];

  if (req.query.status) {
    if (!STATUSES.includes(req.query.status)) throw new HttpError(400, 'Unknown status');
    where.push('status = ?'); params.push(req.query.status);
  }
  if (req.query.q) {
    where.push('order_code LIKE ?'); params.push(`%${String(req.query.q).replace(/[%_]/g, '')}%`);
  }
  const clause = where.join(' AND ');

  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM laundry_order WHERE ${clause}`, params);
  const [rows] = await db.query(
    `SELECT order_code, order_date, status, total_count FROM laundry_order
      WHERE ${clause} ORDER BY order_date DESC, order_id DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]);
  res.json({ page, limit, total, orders: rows });
}));

// GET /api/orders/:code -> "View" button
router.get('/:code', asyncHandler(async (req, res) => {
  const [[order]] = await db.query(
    `SELECT order_id, order_code, order_date, pickup_date, delivery_date, status,
            total_count, total_amount, remarks
       FROM laundry_order WHERE order_code = ? AND customer_id = ?`,
    [req.params.code, req.user.id]);
  if (!order) throw new HttpError(404, 'Order not found');

  const [items] = await db.query(
    `SELECT i.item_name, i.category, s.service_name, oi.quantity, oi.unit_price, oi.subtotal
       FROM order_item oi JOIN item i ON i.item_id = oi.item_id
       JOIN service s ON s.service_id = oi.service_id
      WHERE oi.order_id = ? ORDER BY i.item_name`, [order.order_id]);
  const [timeline] = await db.query(
    `SELECT new_status AS status, note, changed_at FROM order_status_history
      WHERE order_id = ? ORDER BY history_id`, [order.order_id]);
  const [deliveries] = await db.query(
    `SELECT delivery_type, scheduled_time, actual_time, status FROM delivery
      WHERE order_id = ? ORDER BY scheduled_time`, [order.order_id]);

  delete order.order_id;
  res.json({ ...order, items, timeline, deliveries });
}));

// POST /api/orders  body: { items:[{item_id, quantity, service_id?}], pickup_date?, remarks? }
// -> "Submit Order". One transaction: quota check + order + items + quota update.
router.post('/', asyncHandler(async (req, res) => {
  const { items, pickup_date, remarks } = req.body;
  if (!Array.isArray(items) || items.length === 0) throw new HttpError(400, 'Basket is empty');
  if (items.length > 50) throw new HttpError(400, 'Too many different items in one order');
  if (pickup_date && !isDate(pickup_date)) throw new HttpError(400, 'pickup_date must be YYYY-MM-DD');

  // Validate + merge duplicates (same item & service)
  const defaultService = Number(process.env.DEFAULT_SERVICE_ID) || 1;
  const merged = new Map();
  for (const it of items) {
    const item_id = Number(it.item_id);
    const quantity = Number(it.quantity);
    const service_id = Number(it.service_id || defaultService);
    if (!Number.isInteger(item_id) || item_id < 1) throw new HttpError(400, 'Invalid item_id');
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 50) throw new HttpError(400, 'Quantity must be 1-50');
    const key = `${item_id}-${service_id}`;
    merged.set(key, { item_id, service_id, quantity: (merged.get(key)?.quantity || 0) + quantity });
  }
  const lines = [...merged.values()];

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Lock the student's active plan row so two orders can't both use the last cycle
    const [[sub]] = await conn.query(
      `SELECT cs.subscription_id, cs.cycles_used, sp.wash_cycles
         FROM customer_subscription cs JOIN subscription_plan sp ON sp.plan_id = cs.plan_id
        WHERE cs.customer_id = ? AND cs.status = 'Active' AND CURDATE() BETWEEN cs.start_date AND cs.end_date
        ORDER BY cs.end_date LIMIT 1 FOR UPDATE`, [req.user.id]);
    if (!sub) throw new HttpError(403, 'No active plan. Please buy a plan first.');
    if (sub.cycles_used >= sub.wash_cycles) throw new HttpError(403, 'All wash cycles in your plan are used');

    // 2. Every item/service must exist and be active
    const itemIds = [...new Set(lines.map((l) => l.item_id))];
    const serviceIds = [...new Set(lines.map((l) => l.service_id))];
    const [okItems] = await conn.query('SELECT item_id FROM item WHERE is_active = TRUE AND item_id IN (?)', [itemIds]);
    const [okServices] = await conn.query('SELECT service_id FROM service WHERE is_active = TRUE AND service_id IN (?)', [serviceIds]);
    if (okItems.length !== itemIds.length) throw new HttpError(400, 'One or more items are not available');
    if (okServices.length !== serviceIds.length) throw new HttpError(400, 'Invalid service selected');

    // 3. Insert the order (retry if the random 6-digit code collides)
    let orderId, orderCode;
    for (let attempt = 0; attempt < 8; attempt++) {
      orderCode = String(crypto.randomInt(100000, 1000000));
      try {
        const [r] = await conn.query(
          `INSERT INTO laundry_order (order_code, customer_id, subscription_id, pickup_date, remarks)
           VALUES (?, ?, ?, ?, ?)`,
          [orderCode, req.user.id, sub.subscription_id, pickup_date || null, remarks ? String(remarks).slice(0, 255) : null]);
        orderId = r.insertId;
        break;
      } catch (err) { if (err.code !== 'ER_DUP_ENTRY') throw err; }
    }
    if (!orderId) throw new HttpError(500, 'Could not generate an order code, try again');

    // 4. Insert lines (triggers fill unit_price / subtotal and update the order totals)
    await conn.query('INSERT INTO order_item (order_id, item_id, service_id, quantity) VALUES ?',
      [lines.map((l) => [orderId, l.item_id, l.service_id, l.quantity])]);

    // 5. Use one wash cycle
    await conn.query('UPDATE customer_subscription SET cycles_used = cycles_used + 1 WHERE subscription_id = ?',
      [sub.subscription_id]);

    await conn.commit();

    const [[created]] = await db.query(
      'SELECT order_code, order_date, status, total_count FROM laundry_order WHERE order_id = ?', [orderId]);
    res.status(201).json(created);
  } catch (err) {
    await conn.rollback();           // nothing is half-saved
    throw err;
  } finally {
    conn.release();
  }
}));

module.exports = router;
