# Notifications module — API spec

Base path: `/api/v1/notifications`

**Auth:** All routes require authentication.

## GET /

Paginated notification list for current user.

**Query** (`paginationSchema`):

| Param | Default |
|-------|---------|
| page | 1 |
| pageSize | 20 (max 100) |

**Response 200:**

```json
{
  "success": true,
  "data": {
    "items": [ /* NotificationDto[] */ ],
    "total": 42,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3,
    "unread": 5
  }
}
```

## PATCH /:id/read

Mark single notification read.

**Response 200:** `{ success: true }`

## PATCH /read-all

Mark all notifications read for current user.

**Response 200:** `{ success: true }`

## POST /push/subscribe

Register web push subscription.

**Body** (`pushSubscriptionSchema`):

```json
{
  "endpoint": "https://...",
  "keys": { "p256dh": "...", "auth": "..." }
}
```

**Response 200:** `{ success: true, message: "Push subscription saved" }`

Requires `VAPID_*` env vars for actual push delivery (web-push package installed).

## NotificationDto shape

```typescript
{
  id, userId, type, title, body,
  metadata: Record<string, unknown>,
  readAt: string | null,
  createdAt: string
}
```

## Realtime (Socket.IO)

Event: `notification:new` → full `NotificationDto`

Delivered to room `user:{userId}`.
