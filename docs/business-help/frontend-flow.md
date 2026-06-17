# Business Help module — Frontend flow

Frontend path: `frontend/src/modules/business-help/`

## Routes

| Path | Component | Nav |
|------|-----------|-----|
| `/business-help` | `BusinessHelpPage` | "Business Help" |

## User flows

### Request help

1. Form: category, title, description, optional floor
2. POST `/business-help/requests`

### Offer help

1. POST `/business-help/offers` (standalone or with requestId)

### Match (facilitator or UI action)

1. Select open request + available offer
2. POST `/business-help/matches`
3. Both users notified; chat conversation appears at `/chat`

### Schedule meeting

POST `/business-help/matches/:matchId/meetings` with time and location.

## UI structure (recommended)

- Tab: Open requests | Available offers | My activity
- Match button on request detail (admin or automated suggestion future)

## State

Local state in `BusinessHelpPage`.

## Integrations

- Chat: GROUP with `contextType: business-help`
- Notifications: BUSINESS_HELP type on match
