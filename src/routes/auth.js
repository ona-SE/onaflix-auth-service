const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('node:crypto');

const router = express.Router();

// In-memory user store (demo purposes)
const users = new Map();

const JWT_SECRET = process.env.JWT_SECRET || 'onaflix-dev-secret';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    if (users.has(email)) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const salt = Buffer.from(bcrypt.genSaltSync(10)).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: randomUUID(),
      email,
      name: name || email.split('@')[0],
      password: hashedPassword,
      salt,
      createdAt: new Date().toISOString(),
    };

    users.set(email, user);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/callback', (req, res) => {
  const { code, state } = req.query;
  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  const redirectParams = new URLSearchParams({
    code,
    state: state || '',
    provider: 'onaflix',
  }).toString();

  res.redirect(`/auth/complete?${redirectParams}`);
});

router.post('/refresh', (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { ignoreExpiration: true });
    const newToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    res.json({ token: newToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
