# Admin module — Tasks

## Done

- [x] User list with floor filter
- [x] Disable user with audit log
- [x] Remove food listing with event cascade
- [x] Reports (admin list + public create)
- [x] Analytics dashboard data
- [x] AdminPage with adminOnly nav
- [x] Moderation enforced in authMiddleware

## Backlog

- [ ] Report status workflow (OPEN → REVIEWED → CLOSED)
- [ ] WARNED moderation action UI
- [ ] Temporary disable with expiresAt picker
- [ ] Re-enable user endpoint
- [ ] Audit log viewer in admin UI
- [ ] Export analytics CSV
- [ ] In-app report buttons on food listings and chat messages

## Security checklist

- All admin endpoints verify BUILDING_ADMIN role
- Audit log on every destructive action
- Disabled users cannot refresh tokens (blocked at authMiddleware)
