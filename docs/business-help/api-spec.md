# Business Help module — API spec

Base path: `/api/v1/business-help`

**Auth:** All routes require authentication.

## GET /requests

**Query:** `floorId?`

**Response 200:** `BusinessHelpRequestDto[]`

## POST /requests

**Body** (`createBusinessHelpRequestSchema`):

| Field | Required |
|-------|----------|
| category | yes |
| title | yes |
| description | yes |
| floorId | no |

**Response 201:** `BusinessHelpRequestDto`

## PATCH /requests/:id/status

**Body:** `{ status: BusinessHelpStatus }`

**Response 200:** Updated request DTO

## GET /offers

List unmatched standalone offers.

**Response 200:** Offer DTOs with offerer profile

## POST /offers

**Body** (`createBusinessHelpOfferSchema`):

| Field | Required |
|-------|----------|
| category | yes |
| title | yes |
| description | yes |
| requestId | no |

**Response 201:** Offer DTO

## POST /matches

Create match between request and offer.

**Body:**

```json
{ "requestId": "cuid", "offerId": "cuid" }
```

**Response 200:** Match object with nested request/offer

**Side effects:**

- Request status → MATCHED
- Offer linked to request
- Emits `business-help.matched` → chat + notifications

## POST /matches/:matchId/meetings

Schedule meeting.

**Body:**

```json
{
  "scheduledAt": "ISO datetime",
  "location": "string",
  "notes": "optional"
}
```

**Response 201:** Meeting record

## BusinessHelpRequestDto

```typescript
{
  id, requesterId, floorId, category, title, description,
  status, requester?, createdAt
}
```
