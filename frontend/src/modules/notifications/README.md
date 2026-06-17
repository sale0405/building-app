# Notifications (frontend)

Notification inbox with realtime updates via Socket.IO.

## Dependencies

- `core/api-client`
- `core/socket-client` — `notification:new`
- `core/module-registry`

## Routes

| Path | Page | Nav |
|------|------|-----|
| `/notifications` | NotificationsPage | Notifications |

## Store

`store/notifications.store.ts` — fetch, mark read, `subscribeRealtime()`

## API used

`GET /notifications`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`

## Socket events

**Listens:** `notification:new`

## Docs

`docs/notifications/frontend-flow.md`
