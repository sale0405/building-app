# Auth (backend)

JWT authentication, registration, password reset, and floor listing.

## Dependencies

- `@building-app/shared` — validators, `AuthUser`, `UserRole`
- `users/dto/user.dto` — profile in auth responses
- Prisma models in `prisma/schema/auth.prisma`

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/auth/floors` | No |
| POST | `/api/v1/auth/register` | No |
| POST | `/api/v1/auth/login` | No |
| POST | `/api/v1/auth/logout` | No |
| POST | `/api/v1/auth/refresh` | No |
| POST | `/api/v1/auth/forgot-password` | No |
| POST | `/api/v1/auth/reset-password` | No |

## Events

**Emits:** `user.registered`

**Consumes:** none

## Docs

`docs/auth/`
