# Notifications module — Overview

In-app notifications and push subscription management.

## Purpose

- Persist notifications per user
- Subscribe to domain events and create typed notifications
- Deliver realtime updates via Socket.IO (`notification:new`)
- Web push subscription storage (VAPID config in backend)
- Paginated notification inbox with read/unread state

## Boundaries

**Owns:**

- `Notification`, `PushSubscription`, `NotificationPreference` models
- Event → notification mapping in `index.ts`
- Push subscribe endpoint

**Does not own:**

- Source business logic (chores, chat, etc.) — only reacts to events

## Dependencies

| Dependency | Usage |
|------------|-------|
| `core/events/event-bus` | Listen to domain events, emit `notification.created` |
| `core/socket` | Gateway listens to `notification.created` |
| `@building-app/shared` | `NotificationDto`, `NotificationType`, pagination |

## Architecture pattern

```
Domain module emits event
  → notifications/index.ts listener
  → NotificationsService.notify()
  → DB insert + emit notification.created
  → socket-gateway → user:{userId} notification:new
```

## Key files

```
backend/src/modules/notifications/
├── index.ts                 # Event listeners setup
├── routes/notifications.routes.ts
├── controllers/notifications.controller.ts
└── services/notifications.service.ts
```

## Events consumed

`user.registered`, `smoke-break.*`, `chore.*`, `food-locker.item.*`, `business-help.matched`, `chat.message.sent`, `admin.listing.removed`

## Events emitted

| Event | When |
|-------|------|
| `notification.created` | After DB insert |
