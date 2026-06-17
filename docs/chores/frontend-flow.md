# Chores module — Frontend flow

Frontend path: `frontend/src/modules/chores/`

## Routes

| Path | Component | Nav |
|------|-----------|-----|
| `/chores` | `ChoresPage` | "Chores" |

## User flows

### Post a chore

1. Form with title, description, help type, duration, urgency
2. `floorId` implicit from logged-in user
3. POST `/chores/requests`

### Browse / volunteer

1. GET `/chores/requests?status=OPEN&floorId=`
2. Volunteer action → POST `/chores/requests/:id/volunteer`
3. Chat conversation created server-side — user checks `/chat`

### Update progress

PATCH `/chores/requests/:id/status` with new status.

## Notifications

User receives CHORE notifications on create and status changes via notifications module.

## State

Local state in `ChoresPage`. Filter by floor/status recommended using auth user's `floorId`.

## Integration

- Chat module creates GROUP conversation with `contextType: chore`
- Admin analytics counts open chores per floor
