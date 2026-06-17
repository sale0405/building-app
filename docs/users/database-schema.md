# Users module — Database schema

Users module does not define separate Prisma models. It operates on models from `backend/prisma/schema/auth.prisma`.

## Models used

### User

See [auth database schema](../auth/database-schema.md#user).

Key fields for this module: `id`, `email`, `role`, `floorId`, `deletedAt`.

### UserProfile

| Field | Type | Notes |
|-------|------|-------|
| userId | String | Unique FK |
| name | String | |
| apartmentOrCompanyId | String | |
| bio | String? | Max 500 chars (validator) |
| photoUrl | String? | URL from storage service |
| availabilityStatus | AvailabilityStatus | |

### Floor / Building

Included in `UserProfileDto.floor` via Prisma include:

```typescript
floor: { id, number, label, buildingId }
```

## Queries

| Operation | Filter |
|-----------|--------|
| findById | `deletedAt: null` |
| findMany | Optional `floorId`, `deletedAt: null` |
| updateProfile | Updates `UserProfile` row |
| updatePhoto | Sets `photoUrl` |

## DTO mapping

`toUserProfileDto(user)` merges `User` + `UserProfile` + `Floor` into `UserProfileDto` from shared types.
