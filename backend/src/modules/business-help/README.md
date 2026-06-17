# Business Help (backend)

Business assistance requests, offers, matching, and meetings.

## Dependencies

- `@building-app/shared` — request/offer schemas
- `core/events/event-bus`
- Prisma `prisma/schema/business-help.prisma`

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/business-help/requests` | Yes |
| POST | `/api/v1/business-help/requests` | Yes |
| PATCH | `/api/v1/business-help/requests/:id/status` | Yes |
| GET | `/api/v1/business-help/offers` | Yes |
| POST | `/api/v1/business-help/offers` | Yes |
| POST | `/api/v1/business-help/matches` | Yes |
| POST | `/api/v1/business-help/matches/:matchId/meetings` | Yes |

## Events

**Emits:** `business-help.matched`

**Consumes:** none

## Docs

`docs/business-help/`
