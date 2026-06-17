# Smoke Break module — Overview

Floor-scoped invitations for coffee/smoke breaks with realtime floor broadcasts.

## Purpose

- Create timed break invitations with location
- List active invitations on a floor
- Join or cancel invitations
- Realtime floor notifications via Socket.IO

## Boundaries

**Owns:**

- `SmokeBreakInvitation`, `SmokeBreakParticipant` models
- Invitation lifecycle (ACTIVE → CANCELLED / EXPIRED)

**Does not own:**

- In-app notification copy → `notifications` module
- User profiles → `users` DTO

## Dependencies

| Dependency | Usage |
|------------|-------|
| `@building-app/shared` | `createSmokeBreakSchema`, DTOs |
| `core/events/event-bus` | Emit invitation/join events |

## Key files

```
backend/src/modules/smoke-break/
├── index.ts
├── routes/smoke-break.routes.ts
├── controllers/smoke-break.controller.ts
└── services/smoke-break.service.ts
```

## Events

| Event | When |
|-------|------|
| `smoke-break.invitation.created` | New invitation |
| `smoke-break.participant.joined` | User joins |

Socket gateway broadcasts invitation to `floor:{floorId}` and join alert to creator.
