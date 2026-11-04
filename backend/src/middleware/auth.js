const jwt = require('jsonwebtoken');
const db = require('../config/db');
const HttpError = require('../utils/httpError');

const sign = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// requireAuth()                    -> any logged in user
// requireAuth('customer')          -> students only
// requireAuth('Admin','Operator')  -> those staff roles only
const requireAuth = (...roles) => async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw new HttpError(401, 'Login required');

    let user;
    try { user = jwt.verify(token, process.env.JWT_SECRET); }
    catch { throw new HttpError(401, 'Session expired, please log in again'); }

    if (roles.length && !roles.includes(user.role)) throw new HttpError(403, 'Not allowed');

    // Block accounts that were deleted after the token was issued
    if (user.role === 'customer') {
      const [[c]] = await db.query('SELECT account_status FROM customer WHERE customer_id = ?', [user.id]);
      if (!c || c.account_status === 'Deleted') throw new HttpError(401, 'Account no longer exists');
    } else {
      const [[s]] = await db.query('SELECT is_active FROM staff WHERE staff_id = ?', [user.id]);
      if (!s || !s.is_active) throw new HttpError(401, 'Staff account disabled');
    }
    req.user = user;
    next();
  } catch (err) { next(err); }
};

module.exports = { sign, requireAuth };
