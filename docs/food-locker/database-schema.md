# Food Locker module — Database schema

Schema file: `backend/prisma/schema/food-locker.prisma`

## Enums

### FoodListingStatus

`AVAILABLE`, `RESERVED`, `SOLD`, `EXPIRED`

## Models

### FoodListing

| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| sellerId | String | FK → User |
| floorId | String | FK → Floor |
| lockerNumber | String | Physical locker ID |
| title | String | |
| quantity | Int | |
| expirationDate | DateTime | Food expiry |
| price | Decimal(10,2) | |
| status | FoodListingStatus | Default AVAILABLE |
| deletedAt | DateTime? | Soft delete |
| createdAt, updatedAt | DateTime | |

### FoodListingPhoto

| Field | Type | Notes |
|-------|------|-------|
| listingId | String | FK |
| storageKey | String | |
| sortOrder | Int | Default 0 |

### FoodReservation

| Field | Type | Notes |
|-------|------|-------|
| listingId | String | FK |
| buyerId | String | FK → User |
| reservedAt | DateTime | |
| expiresAt | DateTime | +24 hours from reserve |

Created in transaction with status → RESERVED.

### FoodRating

| Field | Type | Notes |
|-------|------|-------|
| listingId | String | FK |
| buyerId | String | FK |
| sellerId | String | FK |
| rating | Int | 1–5 |
| comment | String? | Max 500 |

Unique: `(listingId, buyerId)`

## Relations

```
Floor 1──* FoodListing *──1 User (seller)
FoodListing 1──* FoodListingPhoto
FoodListing 1──* FoodReservation
FoodListing 1──* FoodRating
```
