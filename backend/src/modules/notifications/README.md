# Notifications (backend)

In-app notifications, push subscription storage, domain event reactions.

## Dependencies

- `core/events/event-bus`
- Socket gateway (`notification.created` → `notification:new`)
- Prisma `prisma/schema/notifications.prisma`

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/notifications` | Yes |
| PATCH | `/api/v1/notifications/:id/read` | Yes |
| PATCH | `/api/v1/notifications/read-all` | Yes |
| POST | `/api/v1/notifications/push/subscribe` | Yes |

## Events

**Emits:** `notification.created`

**Consumes:** `user.registered`, `smoke-break.*`, `chore.*`, `food-locker.item.*`, `business-help.matched`, `chat.message.sent`, `admin.listing.removed`

## Docs

`docs/notifications/`
