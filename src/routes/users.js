const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'onaflix-dev-secret';

// Middleware: verify JWT
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.get('/me', authenticate, (req, res) => {
  res.json({
    userId: req.user.userId,
    email: req.user.email,
  });
});

router.get('/avatar', authenticate, (req, res) => {
  const baseUrl = process.env.AVATAR_SERVICE_URL || 'https://avatars.onaflix.internal';
  const avatarUrl = new URL(`/api/avatar/${req.user.userId}`, baseUrl).toString();
  res.json({ avatarUrl });
});

const fs = require('node:fs');
const path = require('node:path');

router.delete('/data', authenticate, (req, res) => {
  const userDataDir = path.join('/tmp', 'user-data', req.user.userId);

  fs.rm(userDataDir, { recursive: true, force: true }, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error('Failed to delete user data:', err);
      return res.status(500).json({ error: 'Failed to delete user data' });
    }
    res.json({ message: 'User data deleted' });
  });
});

module.exports = router;
