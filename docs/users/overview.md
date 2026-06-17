# Users module — Overview

User profile management and directory for building tenants.

## Purpose

- Current user profile CRUD (`/users/me`)
- Profile photo upload
- List users on a floor (directory)
- Lookup user by ID

## Boundaries

**Owns:**

- Profile read/update logic and DTO mapping (`UserProfileDto`)
- User listing queries

**Does not own:**

- Credentials, registration → `auth`
- User row creation → `auth` (profile created at register)

## Frontend mapping

Backend module: `users`  
Frontend folder: `frontend/src/modules/user-profile/` (same feature, different name)

## Dependencies

| Dependency | Usage |
|------------|-------|
| `@building-app/shared` | `updateProfileSchema`, `UserProfileDto`, `AvailabilityStatus` |
| `core/storage` | Profile photo upload |
| Prisma | `User`, `UserProfile`, `Floor`, `Building` via `auth.prisma` |

## Key files

```
backend/src/modules/users/
├── index.ts
├── routes/users.routes.ts
├── controllers/users.controller.ts
├── repositories/users.repository.ts
└── dto/user.dto.ts          # toUserProfileDto — shared across modules
```

## Events

| Direction | Event | Notes |
|-----------|-------|-------|
| Consumes | `user.registered` | Logs registration (placeholder) |
| Emits | — | None |

The `toUserProfileDto` helper is imported by many modules for nested user data in DTOs. This is an acceptable shared DTO utility within the users module path.
