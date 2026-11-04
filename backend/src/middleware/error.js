const HttpError = require('../utils/httpError');

module.exports = (err, req, res, next) => {            // eslint-disable-line no-unused-vars
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });

  // MySQL errors -> clean API errors
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'That record already exists (duplicate value)' });
  if (err.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'Referenced record does not exist' });
  if (err.code === 'ER_SIGNAL_EXCEPTION' || err.sqlState === '45000') {
    return res.status(400).json({ error: err.sqlMessage || 'Rule violated' });   // raised by our triggers
  }
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });

  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
};
