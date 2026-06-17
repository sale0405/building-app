# Notifications module — Tasks

## Done

- [x] Notification CRUD (list, mark read, mark all read)
- [x] Event bus listeners for all major domain events
- [x] Socket delivery via `notification.created`
- [x] Push subscription storage endpoint
- [x] Frontend store with realtime subscription
- [x] NotificationsPage

## Backlog

- [ ] Send actual web push via `web-push` on `notify()`
- [ ] Notification preferences REST API + UI
- [ ] Service worker registration in PWA
- [ ] Deep links from notification metadata to feature pages
- [ ] Badge API for unread count in PWA
- [ ] Batch/debounce high-frequency chat notifications
- [ ] Floor-wide notification fan-out for smoke-break (currently socket-only to floor room)

## Event → type mapping

| Source event | NotificationType |
|--------------|------------------|
| user.registered | SYSTEM |
| smoke-break.* | SMOKE_BREAK |
| chore.* | CHORE |
| food-locker.item.* | FOOD_LOCKER |
| business-help.matched | BUSINESS_HELP |
| chat.message.sent | CHAT |
| admin.listing.removed | ADMIN |
