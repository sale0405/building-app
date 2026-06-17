# Chores module — API spec

Base path: `/api/v1/chores`

**Auth:** All routes require authentication.

## GET /requests

List chore requests.

**Query:**

| Param | Notes |
|-------|-------|
| floorId | Optional filter |
| status | Optional, e.g. `OPEN` |

**Response 200:** `ChoreRequestDto[]`

## POST /requests

Create request.

**Body** (`createChoreSchema`):

| Field | Required | Notes |
|-------|----------|-------|
| title | yes | 3–200 chars |
| description | yes | 10–2000 chars |
| helpType | yes | |
| estimatedDuration | yes | 5–480 minutes |
| preferredTime | no | ISO datetime |
| urgency | yes | UrgencyLevel |
| floorId | no | Defaults to user's floor |

**Response 201:** `ChoreRequestDto`

**Side effect:** `chore.request.created`

## GET /requests/:id

**Response 200:** `ChoreRequestDto`  
**Errors:** 404

## POST /requests/:id/volunteer

Accept open request as volunteer.

**Response 200:** `ChoreRequestDto` with `status: ACCEPTED`

**Side effect:** `chore.status.changed` → chat auto-conversation

**Errors:** 400 — not OPEN

## PATCH /requests/:id/status

Update status (requester or volunteer).

**Body** (`updateChoreStatusSchema`):

```json
{ "status": "IN_PROGRESS" }
```

**Response 200:** `ChoreRequestDto`

**Side effect:** `chore.status.changed`

## ChoreRequestDto

Includes nested `requester` and `volunteer` as `UserProfileDto` when loaded.
