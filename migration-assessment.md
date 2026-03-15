# Node 14 → 20 Migration Assessment

## Current State
- **Node version**: .nvmrc specifies `14`
- **Engine constraint**: `>=14.0.0` in package.json
- **Module system**: CommonJS (require/module.exports throughout)
- **Test framework**: Jest 27.5.1 — all 6 tests pass
- **No Dockerfile or CI workflow files found**

## Deprecated APIs Found

### 1. `url.parse()` — src/index.js:18
Middleware parses `req.url` with `url.parse()`. Replace with `new URL()`.

### 2. `querystring.parse()` — src/index.js:19
Used alongside `url.parse()` in the same middleware. Replace with `URLSearchParams`.

### 3. `querystring.stringify()` — src/routes/auth.js:82
Used in `/callback` route to build redirect query string. Replace with `URLSearchParams`.

### 4. `Buffer()` constructor (no `new`) — src/index.js:37
Token payload decoding uses `Buffer(parts[1], 'base64')`. Replace with `Buffer.from()`.

### 5. `new Buffer()` constructor — src/routes/auth.js:28
Salt encoding uses `new Buffer(...)`. Replace with `Buffer.from()`.

### 6. `url.resolve()` — src/routes/users.js:34
Avatar URL construction uses `url.resolve()`. Replace with `new URL()`.

### 7. `fs.rmdir()` with `{ recursive: true }` — src/routes/users.js:41
User data deletion uses deprecated `fs.rmdir` recursive. Replace with `fs.rm()`.

## Dependencies
All current dependencies are compatible with Node 20. Minor version bumps recommended:
- jest 27 → 29 (Node 20 support improved)
- Other deps (express, bcryptjs, jsonwebtoken, etc.) are already compatible.

## Risk Assessment
- **Low risk**: No native addons, no ESM migration needed, no `process.binding()` usage.
- All changes are straightforward API replacements.
