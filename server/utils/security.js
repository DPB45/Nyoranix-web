const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Small security helpers shared across controllers/routes (no extra packages).
// ---------------------------------------------------------------------------

// Cryptographically secure 6-digit code (Math.random is predictable)
const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

// Force a request value to a plain string. Stops NoSQL operator injection such as
// { "email": { "$gt": "" } } reaching a Mongo query.
const toStr = (v, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

const normalizeEmail = (v) => toStr(v, 254).toLowerCase();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmail = (v) => EMAIL_RE.test(v);

// Escape user text before putting it in an HTML email
const escapeHtml = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Defence in depth: strip Mongo operator keys ($gt, $ne ...) and dotted keys from
// req.body / req.query / req.params before any controller sees them.
const clean = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(clean);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('$') || k.includes('.')) continue;
    out[k] = clean(v);
  }
  return out;
};
const sanitizeInput = (req, res, next) => {
  if (req.body) req.body = clean(req.body);
  if (req.query) {
    const q = clean(req.query);
    Object.keys(req.query).forEach((k) => { if (!(k in q)) delete req.query[k]; });
  }
  if (req.params) req.params = clean(req.params);
  next();
};

// ---------------------------------------------------------------------------
// In-memory rate limiter. Fine for a single server instance (e.g. one Render
// service). If you scale to several instances, swap this for a Redis-backed
// limiter such as express-rate-limit + rate-limit-redis.
// ---------------------------------------------------------------------------
const createLimiter = ({ windowMs, max, message, keyFn }) => {
  const hits = new Map(); // key -> { count, resetAt }

  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
  }, Math.max(windowMs, 60 * 1000));
  if (sweep.unref) sweep.unref();

  return (req, res, next) => {
    const key = keyFn ? keyFn(req) : req.ip;
    const now = Date.now();
    let entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      hits.set(key, entry);
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ message: message || 'Too many requests. Please try again later.' });
    }
    next();
  };
};

// Key by IP + target email so one attacker can't lock out everyone (and vice versa)
const ipEmailKey = (req) => `${req.ip}|${normalizeEmail(req.body && req.body.email)}`;

module.exports = {
  generateOtp, toStr, normalizeEmail, isEmail, escapeHtml, sanitizeInput, createLimiter, ipEmailKey,
};
