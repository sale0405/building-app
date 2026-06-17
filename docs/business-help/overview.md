# Business Help module — Overview

Match building tenants who need business assistance with those who offer help.

## Purpose

- Post help requests (optionally floor-scoped)
- Post standalone offers or offers linked to a request
- Admin/user matching of request + offer
- Schedule meetings for matches
- Auto-create chat on match

## Boundaries

**Owns:**

- `BusinessHelpRequest`, `BusinessHelpOffer`, `BusinessHelpMatch`, `BusinessHelpMeeting`

**Does not own:**

- Chat → reacts to `business-help.matched`
- Notifications → notifies both parties on match

## Dependencies

| Dependency | Usage |
|------------|-------|
| `@building-app/shared` | Request/offer schemas, status enums |
| `core/events/event-bus` | `business-help.matched` |

## Key files

```
backend/src/modules/business-help/
├── index.ts
├── routes/business-help.routes.ts
├── controllers/business-help.controller.ts
└── services/business-help.service.ts
```

## Status flow (request)

```
OPEN → MATCHED → COMPLETED / CLOSED
```

## Events

| Event | When |
|-------|------|
| `business-help.matched` | Match created between request and offer |
