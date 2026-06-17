# Smoke Break module — Database schema

Schema file: `backend/prisma/schema/smoke-break.prisma`

## Enums

### SmokeBreakStatus

`ACTIVE`, `CANCELLED`, `EXPIRED`

## Models

### SmokeBreakInvitation

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| creatorId | String | FK → User |
| floorId | String | FK → Floor |
| location | String | Meeting spot |
| durationMinutes | Int | Used to compute expiresAt |
| expiresAt | DateTime | created + duration |
| status | SmokeBreakStatus | Default ACTIVE |
| createdAt, updatedAt | DateTime | |

### SmokeBreakParticipant

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| invitationId | String | FK, cascade delete |
| userId | String | FK → User |
| joinedAt | DateTime | Default now |

Unique: `(invitationId, userId)`

## Queries

- **List active:** `status = ACTIVE AND expiresAt > now()`, optional `floorId` filter
- **Cancel:** Creator only, sets `CANCELLED`
- **Join:** Idempotent if already participant

## Expiration

No background job currently marks `EXPIRED` — filtered by `expiresAt` at query time. Cron job could update status (backlog).
