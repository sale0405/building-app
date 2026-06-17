# Smoke Break module — API spec

Base path: `/api/v1/smoke-break`

**Auth:** All routes require authentication.

## GET /invitations

List active invitations.

**Query:**

| Param | Default |
|-------|---------|
| floorId | `req.user.floorId` |

**Response 200:** `SmokeBreakInvitationDto[]`

Includes creator profile and participants.

## POST /invitations

Create invitation.

**Body** (`createSmokeBreakSchema`):

| Field | Type | Constraints |
|-------|------|-------------|
| floorId | string (cuid) | required |
| location | string | 1–200 chars |
| durationMinutes | number | 5–120 |

**Response 201:** `SmokeBreakInvitationDto`

**Side effects:**

- Emits `smoke-break.invitation.created`
- Socket: `smoke-break:invitation` to floor room

## POST /invitations/:id/join

Join invitation as current user.

**Response 200:** Updated `SmokeBreakInvitationDto`

**Side effects:**

- Emits `smoke-break.participant.joined`
- Socket: `smoke-break:joined` to creator

**Errors:** 400 — not available / expired

## DELETE /invitations/:id

Cancel invitation (creator only).

**Response 200:** `{ success: true }`

## SmokeBreakInvitationDto

```typescript
{
  id, creatorId, floorId, location, durationMinutes,
  expiresAt, status, creator?, participants?, createdAt
}
```

## Socket.IO

| Event | Direction | Room |
|-------|-----------|------|
| `smoke-break:invitation` | server → client | `floor:{floorId}` |
| `smoke-break:joined` | server → client | `user:{creatorId}` |
