# Admin (backend)

User moderation, listing removal, reports, analytics.

## Dependencies

- `@building-app/shared` — `createReportSchema`, analytics DTOs
- `core/events/event-bus`
- Prisma `prisma/schema/admin.prisma`

## Endpoints

| Method | Path | Auth | Role |
|--------|------|------|------|
| GET | `/api/v1/admin/users` | Yes | BUILDING_ADMIN |
| POST | `/api/v1/admin/users/:id/disable` | Yes | BUILDING_ADMIN |
| DELETE | `/api/v1/admin/listings/:id` | Yes | BUILDING_ADMIN |
| GET | `/api/v1/admin/reports` | Yes | BUILDING_ADMIN |
| POST | `/api/v1/admin/reports` | Yes | BUILDING_ADMIN |
| GET | `/api/v1/admin/analytics` | Yes | BUILDING_ADMIN |
| POST | `/api/v1/reports` | Yes | Any |

## Events

**Emits:** `admin.listing.removed`

**Consumes:** none

## Docs

`docs/admin/`
