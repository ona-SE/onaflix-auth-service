# OnaFlix Auth Service

Authentication and authorization service for the OnaFlix platform. Handles user registration, login, JWT token management, and user profile endpoints.

## Stack

- **Runtime:** Node.js 20
- **Framework:** Express 5
- **Auth:** JWT (jsonwebtoken)
- **Password hashing:** bcryptjs

## Setup

```bash
nvm use 20
npm install
cp .env.example .env
npm run dev
```

## API Endpoints

- `POST /api/auth/register` -- Register new user
- `POST /api/auth/login` -- Login and get JWT
- `POST /api/auth/refresh` -- Refresh expired token
- `GET /api/auth/callback` -- OAuth callback handler
- `GET /api/auth/token-info` -- Decode token payload
- `GET /api/users/me` -- Get current user profile
- `GET /api/users/avatar` -- Get user avatar URL
- `DELETE /api/users/data` -- Delete user data (GDPR)
- `GET /health` -- Health check

## Testing

```bash
npm test
```
