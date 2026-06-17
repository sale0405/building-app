# Admin module — Database schema

Schema file: `backend/prisma/schema/admin.prisma`

## Enums

### ModerationAction

`DISABLED`, `WARNED`

## Models

### AdminReport

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| reporterId | String | FK → User |
| targetType | String | e.g. `food-listing`, `user`, `message` |
| targetId | String | Entity ID |
| reason | String | 10–1000 chars |
| status | String | Default `OPEN` |
| createdAt, updatedAt | DateTime | |

### AdminAuditLog

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| adminId | String | FK → User |
| action | String | e.g. DISABLE_USER, REMOVE_LISTING |
| targetType | String | |
| targetId | String | |
| metadata | Json | Default `{}` |
| createdAt, updatedAt | DateTime | |

### UserModeration

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | FK → User (moderated) |
| action | ModerationAction | |
| reason | String | |
| adminId | String | FK → User (admin) |
| expiresAt | DateTime? | Null = indefinite |
| createdAt, updatedAt | DateTime | |

## Enforcement

`authMiddleware` checks for active `DISABLED` moderation:

```typescript
action: 'DISABLED' AND (expiresAt IS NULL OR expiresAt > now())
```

Returns 403 Account disabled.

## Analytics queries

Aggregates from User, FoodListing, ChoreRequest, BusinessHelpRequest, Message — not separate tables.
