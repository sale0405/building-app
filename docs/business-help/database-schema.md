# Business Help module — Database schema

Schema file: `backend/prisma/schema/business-help.prisma`

## Enums

### BusinessHelpStatus

`OPEN`, `MATCHED`, `COMPLETED`, `CLOSED` (used on requests and matches)

## Models

### BusinessHelpRequest

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| requesterId | String | FK → User |
| floorId | String? | Optional floor scope |
| category | String | |
| title | String | |
| description | String | |
| status | BusinessHelpStatus | Default OPEN |
| deletedAt | DateTime? | |
| createdAt, updatedAt | DateTime | |

### BusinessHelpOffer

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| offererId | String | FK → User |
| requestId | String? | Set when matched |
| category | String | |
| title | String | |
| description | String | |
| createdAt, updatedAt | DateTime | |

### BusinessHelpMatch

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| requestId | String | FK |
| offerId | String | FK |
| scheduledAt | DateTime? | |
| status | BusinessHelpStatus | Default MATCHED |
| createdAt, updatedAt | DateTime | |

### BusinessHelpMeeting

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| matchId | String | FK |
| scheduledAt | DateTime | |
| location | String | |
| notes | String? | |
| createdAt, updatedAt | DateTime | |

## Relations

```
BusinessHelpRequest 1──* BusinessHelpOffer (optional link)
BusinessHelpRequest 1──* BusinessHelpMatch *──1 BusinessHelpOffer
BusinessHelpMatch 1──* BusinessHelpMeeting
```

## List offers query

`findOffers` returns offers where `requestId IS NULL` (unmatched standalone offers).
