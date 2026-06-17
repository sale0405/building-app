# Auth module — Overview

Authentication and building onboarding for the Building PWA.

## Purpose

- User registration and login with JWT access + refresh tokens
- Password reset flow (forgot / reset)
- Public floor listing for registration
- Emits `user.registered` for downstream welcome notifications

## Boundaries

**Owns:**

- Credential storage (`passwordHash`, refresh tokens, password reset tokens)
- Building and Floor reference data (read-only via `/auth/floors`)
- JWT issuance and refresh rotation

**Does not own:**

- Profile updates → `users` module
- Session moderation enforcement reads `UserModeration` in core `authMiddleware` (admin module owns records)

## Dependencies

| Dependency | Usage |
|------------|-------|
| `@building-app/shared` | `registerSchema`, `loginSchema`, token schemas, `AuthUser`, `UserRole` |
| `core/events/event-bus` | Emit `user.registered` on register |
| `users/dto/user.dto` | `toUserProfileDto` in login/register responses |
| Prisma | `User`, `UserProfile`, `Building`, `Floor`, token models |

## Frontend counterpart

`frontend/src/modules/auth/` — login, register pages, Zustand auth store, token persistence, Socket connect on login.

## Key files

```
backend/src/modules/auth/
├── index.ts
├── routes/auth.routes.ts
├── controllers/auth.controller.ts
├── services/auth.service.ts
└── repositories/auth.repository.ts
```

## Events emitted

| Event | When |
|-------|------|
| `user.registered` | Successful registration |

## Events consumed

None.
