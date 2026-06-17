# Notifications module — Frontend flow

Frontend path: `frontend/src/modules/notifications/`

## Routes

| Path | Component | Nav |
|------|-----------|-----|
| `/notifications` | `NotificationsPage` | "Notifications" |

## State: `notifications.store.ts`

| Action | API / Socket |
|--------|--------------|
| `fetch()` | GET `/notifications` |
| `markRead(id)` | PATCH `/notifications/:id/read` |
| `markAllRead()` | PATCH `/notifications/read-all` |
| `subscribeRealtime()` | Socket `notification:new` |

## Realtime setup

On module register (`onRegister` callback):

```typescript
setTimeout(() => useNotificationsStore.getState().subscribeRealtime(), 1000);
```

Delayed to allow auth socket connection to complete.

Incoming socket events prepend to `items` and increment `unreadCount`.

## User flow

1. User opens Notifications page → `fetch()`.
2. While app open, new notifications appear via socket without refresh.
3. Tap notification → `markRead()` → refresh list.
4. "Mark all read" → `markAllRead()`.

## Push notifications

Backend stores subscriptions; service worker + `POST /push/subscribe` integration can be added on frontend. VAPID public key would be exposed via config endpoint (not yet implemented).

## Dependencies

- `apiClient`
- `getSocket()` from `socket-client`
- Auth must be connected for socket events
