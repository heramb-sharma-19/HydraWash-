const router = require('express').Router();
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { STATUSES } = require('../utils/helpers');

// GET /api/meta/campuses -> campuses with their residences (sign-up dropdowns)
router.get('/campuses', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    `SELECT c.campus_id, c.campus_name, r.residence_id, r.residence_name
       FROM campus c LEFT JOIN residence r ON r.campus_id = c.campus_id
      ORDER BY c.campus_name, r.residence_name`);
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r.campus_id)) map.set(r.campus_id, { campus_id: r.campus_id, campus_name: r.campus_name, residences: [] });
    if (r.residence_id) map.get(r.campus_id).residences.push({ residence_id: r.residence_id, residence_name: r.residence_name });
  }
  res.json([...map.values()]);
}));

// GET /api/meta/items -> the "Select Items" popup (grouped by category)
router.get('/items', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    'SELECT item_id, item_name, category, icon FROM item WHERE is_active = TRUE ORDER BY item_name');
  res.json(rows);
}));

// GET /api/meta/services -> Wash / Dry / Iron for the website cards
router.get('/services', asyncHandler(async (req, res) => {
  const [rows] = await db.query(
    'SELECT service_id, service_name, description, price_per_item FROM service WHERE is_active = TRUE ORDER BY service_id');
  res.json(rows);
}));

// GET /api/meta/statuses -> the filter chips (Created, Pending, Accepted ...)
router.get('/statuses', (req, res) => res.json(STATUSES));

module.exports = router;
