// Load environment variables BEFORE anything else is required: modules such as
// utils/sendEmail.js read process.env when they are first loaded, so loading
// .env later left the Brevo email credentials undefined in local development.
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const configRoutes = require('./routes/configRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const { sanitizeInput } = require('./utils/security');
const { protect, admin } = require('./middleware/authMiddleware');

// Fail fast with a clear message instead of crashing later on the first login
['MONGO_URI', 'JWT_SECRET'].forEach((name) => {
  if (!process.env[name]) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
});

// A guessable JWT secret lets anyone forge admin tokens. In production refuse to run
// with a short one (Render keeps the previous deploy live if this one fails to start).
// Generate one:  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
// NOTE: changing the secret signs every user out once.
// (also treats Render's own RENDER=true variable as production, in case NODE_ENV isn't set there)
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
if (isProduction && process.env.JWT_SECRET.length < 32) {
  console.error('JWT_SECRET is too short (need at least 32 characters). Set a long random value and redeploy.');
  process.exit(1);
}

// Connect to Database
connectDB();

const app = express();

// Behind Render/Vercel proxies: needed so req.ip is the real client (rate limiting)
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Basic security headers (a lightweight stand-in for helmet)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'); // the API is called from the Vercel site
  next();
});

// Middleware
// 1. CORS: Allow requests from your frontend(s).
// CLIENT_URL can be a single origin or a comma-separated list, e.g.
//   CLIENT_URL=https://nyoranix.vercel.app,https://nyoranix-web.vercel.app
// The local dev origin is allowed alongside these only when NODE_ENV is not 'production'.
const allowedOrigins = [
  // the local dev origin is only allowed outside production
  ...(isProduction ? [] : ['http://localhost:5173']),
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(o => o.trim()) : [])
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server, Postman) which send no origin
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      const corsError = new Error(`CORS blocked for origin: ${origin}`);
      corsError.status = 403;
      callback(corsError);
    }
  },
  credentials: true,
  exposedHeaders: ['X-Total-Count'], // product list pagination
}));

// 2. JSON Parser
// Product/banner saves carry base64 images and need a big body - but ONLY an
// authenticated admin may send one: protect + admin run BEFORE the 50 MB parser,
// so an anonymous request is rejected without its body ever being read.
// Everything else (login, reviews, orders, contact form...) is capped at 1 MB.
const bigJson = express.json({ limit: '50mb' });
app.post('/api/products', protect, admin, bigJson);
app.put('/api/products/:id', protect, admin, bigJson);
app.put('/api/config', protect, admin, bigJson);
app.use(express.json({ limit: '1mb' })); // skipped automatically when a body was already parsed above
app.use(express.urlencoded({ limit: '100kb', extended: true }));

// Strip Mongo operator keys ($gt, $ne ...) from req.body/query/params
app.use(sanitizeInput);

// Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/config', configRoutes);
app.use('/api/inquiry', inquiryRoutes);
app.use(require('./routes/sitemapRoutes')); // GET /sitemap.xml

// Test Route
app.get('/', (req, res) => {
    res.send('Nyoranix API is running...');
});

// Error Handling
// Never echo raw error messages / stacks to clients: unexpected errors are logged
// server-side and the client only sees a generic message.
const CLIENT_ERROR_MESSAGES = {
  400: 'Bad request',
  403: 'Not allowed',
  413: 'Request is too large',
  415: 'Unsupported content type',
  431: 'Request headers are too large',
};
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed request body' });
  }

  // body-parser, CORS and similar middleware attach a 4xx status to client errors
  const status = Number(err.status || err.statusCode);
  if (status >= 400 && status < 500) {
    return res.status(status).json({ message: CLIENT_ERROR_MESSAGES[status] || 'Bad request' });
  }

  console.error(err);
  res.status(500).json({ message: 'Server Error' });
});

const PORT = process.env.PORT || 5001;

const { startAutoCancelJob } = require('./controllers/orderController');

app.listen(PORT, () => {
  startAutoCancelJob();
    console.log(`Server running on port ${PORT}`);
});