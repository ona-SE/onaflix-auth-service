const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Parse URL and query params using WHATWG URL API
app.use((req, res, next) => {
  const parsed = new URL(req.url, `http://${req.headers.host}`);
  req.parsedUrl = parsed;
  req.queryParams = Object.fromEntries(parsed.searchParams);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth', uptime: process.uptime() });
});

app.get('/api/auth/token-info', (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const parts = token.split('.');
    const payload = Buffer.from(parts[1], 'base64').toString('utf8');
    res.json(JSON.parse(payload));
  } catch (err) {
    res.status(400).json({ error: 'Invalid token format' });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Auth service running on port ${PORT}`);
  });
}

module.exports = app;
