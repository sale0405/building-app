# Users (backend)

Profile management and user directory.

## Dependencies

- `@building-app/shared` — `updateProfileSchema`, `UserProfileDto`
- `core/storage` — profile photos
- Prisma `User`, `UserProfile` (`auth.prisma`)

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/users/me` | Yes |
| PATCH | `/api/v1/users/me` | Yes |
| POST | `/api/v1/users/me/photo` | Yes |
| GET | `/api/v1/users` | Yes |
| GET | `/api/v1/users/:id` | Yes |

## Events

**Emits:** none

**Consumes:** `user.registered` (log)

## Docs

`docs/users/`
