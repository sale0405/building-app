# Smoke Break (backend)

Floor-scoped break invitations with realtime floor broadcast.

## Dependencies

- `@building-app/shared` — `createSmokeBreakSchema`
- `core/events/event-bus`
- Prisma `prisma/schema/smoke-break.prisma`

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/smoke-break/invitations` | Yes |
| POST | `/api/v1/smoke-break/invitations` | Yes |
| POST | `/api/v1/smoke-break/invitations/:id/join` | Yes |
| DELETE | `/api/v1/smoke-break/invitations/:id` | Yes |

## Socket

`smoke-break:invitation` (floor room), `smoke-break:joined` (creator)

## Events

**Emits:** `smoke-break.invitation.created`, `smoke-break.participant.joined`

**Consumes:** none

## Docs

`docs/smoke-break/`
