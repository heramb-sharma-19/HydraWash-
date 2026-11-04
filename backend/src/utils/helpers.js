const HttpError = require('./httpError');

const STATUSES = ['Created', 'Pending', 'Accepted', 'Reverted', 'Ready', 'Delivered'];

// UI hint only. The real rule lives in the MySQL trigger trg_order_bu.
const NEXT_STATUS = {
  Created: ['Pending', 'Reverted'],
  Pending: ['Accepted', 'Reverted'],
  Accepted: ['Ready', 'Reverted'],
  Ready: ['Delivered'],
  Reverted: [],
  Delivered: []
};

function pageParams(query, maxLimit = 50) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), maxLimit);
  return { page, limit, offset: (page - 1) * limit };
}

function requireFields(body, fields) {
  for (const f of fields) {
    if (body[f] === undefined || body[f] === null || String(body[f]).trim() === '') {
      throw new HttpError(400, `"${f}" is required`);
    }
  }
}

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isPhone = (s) => /^[0-9+\-\s]{7,15}$/.test(s);
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));

module.exports = { STATUSES, NEXT_STATUS, pageParams, requireFields, isEmail, isPhone, isDate };
