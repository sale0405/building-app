# Food Locker (backend)

Food listings in building lockers — photos, reserve, sold, ratings.

## Dependencies

- `core/storage` — listing photos (max 5 × 5 MB)
- `core/events/event-bus`
- Prisma `prisma/schema/food-locker.prisma`

## Endpoints

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/food-locker/listings` | Yes |
| POST | `/api/v1/food-locker/listings` | Yes |
| GET | `/api/v1/food-locker/listings/:id` | Yes |
| POST | `/api/v1/food-locker/listings/:id/reserve` | Yes |
| POST | `/api/v1/food-locker/listings/:id/sold` | Yes |
| POST | `/api/v1/food-locker/listings/:id/rate` | Yes |

## Events

**Emits:** `food-locker.listing.created`, `food-locker.item.reserved`, `food-locker.item.sold`

**Consumes:** `admin.listing.removed`

## Docs

`docs/food-locker/`
