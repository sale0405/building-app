# Admin module — Overview

Building administration: user moderation, content removal, reports, and analytics.

## Purpose

- List and disable users
- Remove food listings (triggers cross-module cleanup)
- User-submitted reports (also available to all authenticated users)
- Dashboard analytics

## Boundaries

**Owns:**

- `AdminReport`, `AdminAuditLog`, `UserModeration` models
- Admin-only routes under `/api/v1/admin`
- Public report endpoint at `/api/v1/reports`

**Side effects via events:**

- `admin.listing.removed` → food-locker soft delete + seller notification

## Access control

All `/admin/*` routes require:

```typescript
authMiddleware + requireRole('BUILDING_ADMIN')
```

Reports can be filed by any authenticated user.

## Dependencies

| Dependency | Usage |
|------------|-------|
| `@building-app/shared` | `createReportSchema`, analytics DTOs |
| `core/events/event-bus` | Emit `admin.listing.removed` |
| Prisma | Cross-model counts for analytics |

## Key files

```
backend/src/modules/admin/
├── index.ts
├── routes/admin.routes.ts
├── controllers/admin.controller.ts
└── services/admin.service.ts
```

## Events emitted

| Event | When |
|-------|------|
| `admin.listing.removed` | Admin deletes food listing |

## Events consumed

None (admin is primarily an orchestrator via REST).
