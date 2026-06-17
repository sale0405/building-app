# Food Locker module — Overview

Floor-based marketplace for food items stored in building locker units.

## Purpose

- Sellers list food with photos, price, expiration, locker number
- Buyers reserve listings (24h hold) then mark sold
- Ratings after purchase
- Admin can remove listings (soft delete)

## Boundaries

**Owns:**

- `FoodListing`, `FoodListingPhoto`, `FoodReservation`, `FoodRating`

**Reacts to:**

- `admin.listing.removed` — soft-deletes listing via service

**Does not own:**

- Admin moderation records → `admin`
- Payment processing (price is informational)

## Dependencies

| Dependency | Usage |
|------------|-------|
| `core/storage` | Listing photos (max 5, 5 MB each) |
| `core/events/event-bus` | listing.created, item.reserved, item.sold |

## Key files

```
backend/src/modules/food-locker/
├── index.ts              # Routes + admin.listing.removed listener
├── routes/food-locker.routes.ts
├── controllers/food-locker.controller.ts
└── services/food-locker.service.ts
```

## Status flow

```
AVAILABLE → RESERVED → SOLD
         ↘ EXPIRED (admin remove / future cron)
```
