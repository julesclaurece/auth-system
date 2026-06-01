# 🔐 Auth System — JWT + Roles + Email Reset

A production-ready authentication REST API built with **Node.js**, **Express**, **PostgreSQL**, and **JWT**.

## Features

- **Register / Login** with email & password
- **Email verification** on registration
- **JWT access tokens** (15min) + **refresh token rotation** (7 days)
- **Role-based access control** — `user` / `admin`
- **Forgot password** & **reset password** via email
- Input validation with `express-validator`
- Passwords hashed with `bcryptjs` (cost 12)
- Refresh tokens stored in DB and revoked on logout/password change

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Database | PostgreSQL |
| Auth | JWT (jsonwebtoken) |
| Email | Nodemailer |
| Validation | express-validator |

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| GET | `/api/auth/verify-email/:token` | Verify email |
| POST | `/api/auth/login` | Login → returns tokens |
| POST | `/api/auth/refresh` | Rotate refresh token |
| POST | `/api/auth/logout` | Revoke refresh token |
| POST | `/api/auth/forgot-password` | Send reset email |
| POST | `/api/auth/reset-password/:token` | Set new password |

### Users
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/users/profile` | Authenticated |
| GET | `/api/users` | Admin only |
| DELETE | `/api/users/:id` | Admin only |

## Getting Started

```bash
# 1. Clone and install
git clone https://github.com/YOUR_USERNAME/auth-system
cd auth-system
npm install

# 2. Configure environment
cp .env.example .env
# Fill in your DATABASE_URL, JWT secrets, and email credentials

# 3. Run database migration
npm run migrate

# 4. Start the server
npm run dev
```

## Example Requests

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"Secret123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Secret123"}'
```

### Access protected route
```bash
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Security Highlights

- Refresh token rotation on every use (prevents replay attacks)
- All refresh tokens revoked on password reset
- Forgot-password returns identical response whether email exists or not (prevents enumeration)
- Passwords never returned in any response
