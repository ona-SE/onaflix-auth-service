const request = require('supertest');
const app = require('../index');

describe('Auth Service', () => {
  describe('GET /health', () => {
    it('returns ok status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.service).toBe('auth');
    });
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'password123', name: 'Test User' });
      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.token).toBeDefined();
    });

    it('rejects duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'dupe@example.com', password: 'pass' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'dupe@example.com', password: 'pass' });
      expect(res.status).toBe(409);
    });

    it('requires email and password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'no-pass@example.com' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'login@example.com', password: 'secret' });
    });

    it('returns token for valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'secret' });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('rejects invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'wrong' });
      expect(res.status).toBe(401);
    });
  });

  describe('migrated Node APIs', () => {
    let token;
    let userId;

    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'migration@example.com', password: 'secret' });

      token = res.body.token;
      userId = res.body.user.id;
    });

    it('builds OAuth callback parameters with URLSearchParams', async () => {
      const res = await request(app)
        .get('/api/auth/callback')
        .query({ code: 'auth code', state: 'return/home' });

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe(
        '/auth/complete?code=auth+code&state=return%2Fhome&provider=onaflix'
      );
    });

    it('decodes a base64url token payload with Buffer.from', async () => {
      const res = await request(app)
        .get('/api/auth/token-info')
        .set('Authorization', token);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ userId, email: 'migration@example.com' });
    });

    it('builds avatar URLs with the WHATWG URL API', async () => {
      const res = await request(app)
        .get('/api/users/avatar')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.avatarUrl).toBe(
        `https://avatars.onaflix.internal/api/avatar/${userId}`
      );
    });

    it('removes user data with fs.rm', async () => {
      const res = await request(app)
        .delete('/api/users/data')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'User data deleted' });
    });
  });
});
