// Wraps async route handlers so any thrown error reaches the error middleware
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
