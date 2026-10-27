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

// Strict on purpose: the old pattern accepted "a@b.com?bcc=evil%40x.com", and the admin
// panel builds mailto: links from stored emails (replying would silently BCC the attacker).
const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+=^_`{|}~-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;
const isEmail = (v) => typeof v === 'string' && v.length <= 254 && EMAIL_RE.test(v);

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
// Depth-limited: JSON nested ~10,000 levels deep used to overflow the call stack
// (a 500). Real requests are never more than a few levels deep.
const MAX_DEPTH = 20;
const clean = (obj, depth = 0) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (depth >= MAX_DEPTH) return {};
  if (Array.isArray(obj)) return obj.map((x) => clean(x, depth + 1));
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('$') || k.includes('.')) continue;
    out[k] = clean(v, depth + 1);
  }
  return out;
};
const sanitizeInput = (req, res, next) => {
  if (req.body) req.body = clean(req.body);
  if (req.query) {
    // Replace every key (not just drop top-level ones) so nested operators such as
    // ?a[$gt]=1 are stripped too. Mutating in place keeps this compatible with Express 4.
    const q = clean(req.query);
    Object.keys(req.query).forEach((k) => { delete req.query[k]; });
    Object.assign(req.query, q);
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

// router.param('id', validateIdParam): a malformed ObjectId in the URL is a
// client mistake -> clean 404 instead of a Mongoose CastError surfacing as 500.
const validateIdParam = (req, res, next, id) => {
  if (!/^[a-f\d]{24}$/i.test(String(id))) {
    return res.status(404).json({ message: 'Not found' });
  }
  next();
};

module.exports = {
  validateIdParam,
  generateOtp, toStr, normalizeEmail, isEmail, escapeHtml, sanitizeInput, createLimiter, ipEmailKey,
};
