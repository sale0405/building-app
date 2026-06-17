# Auth module — Database schema

Schema file: `backend/prisma/schema/auth.prisma`

## Enums

### UserRole

| Value | Description |
|-------|-------------|
| `RESIDENT` | Residential tenant |
| `BUSINESS_USER` | Business/office tenant |
| `BUILDING_ADMIN` | Building administrator |

### AvailabilityStatus

Used on `UserProfile` (updated via users module): `AVAILABLE`, `BUSY`, `AWAY`, `OFFLINE`.

## Models

### Building

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| name | String | e.g. "Central Business Tower" |
| address | String | |
| createdAt, updatedAt | DateTime | |

Relations: `floors Floor[]`

### Floor

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| buildingId | String | FK → Building |
| number | Int | 1, 2, or 3 in seed |
| label | String | Display name |

Unique: `(buildingId, number)`

Relations: `users`, floor-scoped entities in other modules.

### User

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| email | String | Unique |
| passwordHash | String | bcrypt |
| role | UserRole | |
| floorId | String | FK → Floor, required |
| deletedAt | DateTime? | Soft delete |
| createdAt, updatedAt | DateTime | |

Relations: profile, tokens, and all cross-module user relations.

### UserProfile

Created atomically on registration.

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | Unique FK → User |
| name | String | |
| apartmentOrCompanyId | String | Suite/apt identifier |
| bio | String? | |
| photoUrl | String? | Set via users module |
| availabilityStatus | AvailabilityStatus | Default AVAILABLE |

### RefreshToken

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| tokenHash | String | Unique, SHA-256 of raw token |
| userId | String | FK → User, cascade delete |
| expiresAt | DateTime | Default ~7 days |
| revokedAt | DateTime? | Set on logout/refresh |

### PasswordResetToken

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| tokenHash | String | Unique |
| userId | String | FK → User |
| expiresAt | DateTime | 1 hour from creation |
| usedAt | DateTime? | Single use |

## ER snippet

```
Building 1──* Floor 1──* User 1──1 UserProfile
                              1──* RefreshToken
                              1──* PasswordResetToken
```

## Indexes and constraints

- `User.email` — unique
- `RefreshToken.tokenHash` — unique
- `PasswordResetToken.tokenHash` — unique
- `Floor(buildingId, number)` — unique
