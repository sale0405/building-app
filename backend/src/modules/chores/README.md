# Chores (backend)

Floor-scoped help requests with volunteer and status workflow.

## Dependencies

- `@building-app/shared` — chore schemas, enums
- `core/events/event-bus`
- Prisma `prisma/schema/chores.prisma`

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/chores/requests` | Yes |
| POST | `/api/v1/chores/requests` | Yes |
| GET | `/api/v1/chores/requests/:id` | Yes |
| POST | `/api/v1/chores/requests/:id/volunteer` | Yes |
| PATCH | `/api/v1/chores/requests/:id/status` | Yes |

## Events

**Emits:** `chore.request.created`, `chore.status.changed`

**Consumes:** none

## Docs

`docs/chores/`
