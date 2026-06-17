# Admin module — Frontend flow

Frontend path: `frontend/src/modules/admin/`

## Routes

| Path | Component | Nav |
|------|-----------|-----|
| `/admin` | `AdminPage` | "Admin" (adminOnly) |

Nav item filtered by `moduleRegistry.getNavItems(isAdmin)` — only visible when `user.role === BUILDING_ADMIN'`.

## User flows

### Analytics dashboard

GET `/admin/analytics?floorId=` — display KPI cards and users-by-floor chart.

### User management

- List users with floor filter
- Disable user with reason → POST `/admin/users/:id/disable`

### Content moderation

- Remove listing → DELETE `/admin/listings/:id`
- Review reports → GET `/admin/reports`

### Report (any user)

Report button on listings/profiles → POST `/reports` (not under `/admin` prefix).

## Auth guard

`AppLayout` passes admin flag from `useAuthStore.user.role`.

Admin routes still protected server-side — non-admin API calls return 403.

## State

Local state in `AdminPage`. Consider separate tabs: Analytics | Users | Reports | Listings.

## Seed access

Login: `admin@building.local` / `Admin123!`
