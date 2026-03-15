## Migration Report

**From:** Node 14
**To:** Node 20

### Breaking changes fixed

| Deprecated API | Replacement | File |
|---|---|---|
| `url.parse()` | `new URL()` | src/index.js |
| `querystring.parse()` | `URL.searchParams` / `Object.fromEntries()` | src/index.js |
| `Buffer()` (no new) | `Buffer.from()` | src/index.js |
| `new Buffer()` | `Buffer.from()` | src/routes/auth.js |
| `querystring.stringify()` | `new URLSearchParams().toString()` | src/routes/auth.js |
| `url.resolve()` | `new URL(path, base).href` | src/routes/users.js |
| `fs.rmdir({ recursive })` | `fs.rm({ recursive, force })` | src/routes/users.js |

### Dependencies updated

| Package | From | To | Reason |
|---|---|---|---|
| dotenv | 10.0.0 | 16.4.7 | Node 20 compatibility |
| express | 4.17.1 | 4.21.2 | Security patches |
| jsonwebtoken | 8.5.1 | 9.0.2 | Security fixes |
| pg | 8.7.1 | 8.13.3 | Node 20 compatibility |
| jest | 27.5.1 | 29.7.0 | Node 20 support |
| nodemon | 2.0.15 | 3.1.9 | Node 20 support |
| supertest | 6.2.2 | 7.0.0 | Node 20 compatibility |

### Assumptions

- Stayed on Express 4.x (Express 5 is a separate migration)
- Stayed on bcryptjs 2.x (3.x is ESM-only)
- Stayed on uuid 8.x (13.x is ESM-only)
- No Dockerfile or CI workflow files were found to update

### Tests: PASS

- 6/6 tests passing
- 0 vulnerabilities (npm audit)
- No deprecation warnings
