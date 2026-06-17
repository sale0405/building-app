# Chores module — Database schema

Schema file: `backend/prisma/schema/chores.prisma`

## Enums

### ChoreStatus

`OPEN`, `ACCEPTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

### UrgencyLevel

`LOW`, `MEDIUM`, `HIGH`, `URGENT`

## Models

### ChoreRequest

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| requesterId | String | FK → User |
| floorId | String | FK → Floor |
| title | String | |
| description | String | |
| helpType | String | Category label |
| estimatedDuration | Int | Minutes |
| preferredTime | DateTime? | |
| urgency | UrgencyLevel | |
| status | ChoreStatus | Default OPEN |
| volunteerId | String? | FK → User |
| deletedAt | DateTime? | Soft delete |
| createdAt, updatedAt | DateTime | |

### ChoreStatusHistory

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| choreId | String | FK, cascade delete |
| status | ChoreStatus | |
| changedById | String | FK → User |
| createdAt | DateTime | |

Every status change via `updateStatus` creates a history row in a transaction.

## Relations

```
Floor 1──* ChoreRequest *──1 User (requester)
ChoreRequest *──0..1 User (volunteer)
ChoreRequest 1──* ChoreStatusHistory
```
