const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const configRoutes = require('./routes/configRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const { sanitizeInput } = require('./utils/security');

// Load environment variables
dotenv.config();

// Fail fast with a clear message instead of crashing later on the first login
['MONGO_URI', 'JWT_SECRET'].forEach((name) => {
  if (!process.env[name]) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
});

// Connect to Database
connectDB();

const app = express();

// Behind Render/Vercel proxies: needed so req.ip is the real client (rate limiting)
app.set('trust proxy', 1);
app.disable('x-powered-by');

// Middleware
// 1. CORS: Allow requests from your frontend(s).
// CLIENT_URL can be a single origin or a comma-separated list, e.g.
//   CLIENT_URL=https://nyoranix.vercel.app,https://nyoranix-web.vercel.app
// Local dev origin is always allowed alongside whatever's configured.
const allowedOrigins = [
  'http://localhost:5173',
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(o => o.trim()) : [])
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, server-to-server, Postman) which send no origin
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true
}));

// 2. JSON Parser
// Only the admin endpoints that carry base64 product/banner images need a big
// body. Everything else (login, contact form, orders...) is capped at 1 MB so
// the public API can't be hit with 50 MB payloads. A body is only parsed once,
// so the first matching parser wins.
const bigJson = express.json({ limit: '50mb' });
app.use('/api/products', (req, res, next) => (req.method === 'GET' ? next() : bigJson(req, res, next)));
app.use('/api/config', (req, res, next) => (req.method === 'GET' ? next() : bigJson(req, res, next)));
app.use(express.json({ limit: '1mb' }));
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
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request is too large' });
  }
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});