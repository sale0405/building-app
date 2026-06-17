# Chores module — Overview

Peer-to-peer help requests between tenants on the same floor (or specified floor).

## Purpose

- Post chore/help requests with urgency and time estimates
- Volunteers accept open requests
- Status workflow with audit history
- Triggers chat conversation when volunteer accepts

## Boundaries

**Owns:**

- `ChoreRequest`, `ChoreStatusHistory` models
- Volunteer and status transition logic

**Does not own:**

- Messaging → `chat` (reacts to `chore.status.changed`)
- Notifications → `notifications` module

## Status workflow

```
OPEN → ACCEPTED (volunteer) → IN_PROGRESS → COMPLETED
                    ↘ CANCELLED
```

## Dependencies

| Dependency | Usage |
|------------|-------|
| `@building-app/shared` | `createChoreSchema`, `updateChoreStatusSchema`, enums |
| `core/events/event-bus` | `chore.request.created`, `chore.status.changed` |

## Key files

```
backend/src/modules/chores/
├── index.ts
├── routes/chores.routes.ts
├── controllers/chores.controller.ts
└── services/chores.service.ts
```

## Events emitted

| Event | When |
|-------|------|
| `chore.request.created` | New request |
| `chore.status.changed` | Volunteer or status update |
