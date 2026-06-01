# 🔐 Auth System — JWT + Roles + Email Verification

A production-ready authentication REST API built with **Node.js**, **Express**, **PostgreSQL**, and **JWT**.

**Live demo:** https://auth-system-production-4549.up.railway.app/health

## Features

- **Register / Login** with email & password
- **Email verification** on registration (real emails via Brevo)
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
| Email | Brevo API |
| Validation | express-validator |
| Hosting | Railway |

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account + sends verification email |
| GET | `/api/auth/verify-email/:token` | Verify email address |
| POST | `/api/auth/login` | Login → returns access + refresh tokens |
| POST | `/api/auth/refresh` | Rotate refresh token |
| POST | `/api/auth/logout` | Revoke refresh token |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password/:token` | Set new password |

### Users
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/users/profile` | Authenticated |
| GET | `/api/users` | Admin only |
| DELETE | `/api/users/:id` | Admin only |

## Try it live

### 1. Register (you'll receive a real verification email)
```bash
curl -X POST https://auth-system-production-4549.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"your@email.com","password":"Secret123"}'
```

### 2. Verify your email
Check your inbox and click the verification link.

### 3. Login
```bash
curl -X POST https://auth-system-production-4549.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"Secret123"}'
```

The response returns your tokens:
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": { "id": "...", "name": "John", "email": "your@email.com", "role": "user" }
}
```

### 4. Access protected route
Copy the `accessToken` from the login response and use it here:
```bash
curl https://auth-system-production-4549.up.railway.app/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Run locally

```bash
git clone https://github.com/julesclaurece/auth-system
cd auth-system
npm install
cp .env.example .env
# Fill in DATABASE_URL, JWT secrets, and Brevo API key
npm run migrate
npm run dev
```

## Security Highlights

- Refresh token rotation on every use (prevents replay attacks)
- All refresh tokens revoked on password reset
- Forgot-password returns identical response whether email exists or not (prevents enumeration)
- Passwords never returned in any response
