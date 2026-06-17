# Notifications module — Database schema

Schema file: `backend/prisma/schema/notifications.prisma`

## Enums

### NotificationType

`SMOKE_BREAK`, `CHORE`, `FOOD_LOCKER`, `BUSINESS_HELP`, `CHAT`, `SYSTEM`, `ADMIN`

## Models

### Notification

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | FK → User |
| type | NotificationType | |
| title | String | |
| body | String | |
| metadata | Json | Default `{}`, event context |
| readAt | DateTime? | Null = unread |
| deletedAt | DateTime? | Soft delete |
| createdAt, updatedAt | DateTime | |

### PushSubscription

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | FK → User |
| endpoint | String | Unique |
| keys | Json | `{ p256dh, auth }` |
| createdAt, updatedAt | DateTime | |

Upserted by endpoint on subscribe.

### NotificationPreference

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | FK → User |
| channel | String | e.g. push, email |
| eventType | String | |
| enabled | Boolean | Default true |

Unique: `(userId, channel, eventType)`

**Note:** Preference model exists; REST API for preferences not yet implemented.

## Indexes

- `PushSubscription.endpoint` — unique
- `NotificationPreference(userId, channel, eventType)` — unique
