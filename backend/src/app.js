const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/error');

const app = express();

app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean) }));
app.use(express.json({ limit: '100kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Brute-force / enumeration protection
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false });
const publicLimiter = rateLimit({ windowMs: 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false });

app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/meta', require('./routes/meta'));
app.use('/api/public', publicLimiter, require('./routes/public'));
app.use('/api/me', require('./routes/me'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

module.exports = app;
