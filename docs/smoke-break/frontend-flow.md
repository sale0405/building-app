# Smoke Break module — Frontend flow

Frontend path: `frontend/src/modules/smoke-break/`

## Routes

| Path | Component | Nav |
|------|-----------|-----|
| `/smoke-break` | `SmokeBreakPage` | "Breaks" |

## User flows

### Create break

1. User enters location and duration on their floor (`floorId` from auth user or explicit).
2. POST `/smoke-break/invitations`
3. Invitation appears in list; floor mates receive socket event.

### View / join

1. GET `/smoke-break/invitations?floorId=` (defaults to user floor)
2. Realtime: listen `smoke-break:invitation` on socket (floor room auto-joined on connect)
3. Join button → POST `/invitations/:id/join`

### Cancel

Creator deletes → DELETE `/invitations/:id`

## State

Local component state in `SmokeBreakPage`. Recommended: socket subscription in `useEffect` to prepend new invitations.

## Floor context

Registration assigns user to one floor. Smoke break list defaults to that floor. Admins on other floors could pass `floorId` query to browse.

## Dependencies

- `apiClient`
- `useAuthStore` for `user.floorId`
- Socket floor room membership (automatic on connect)
