# Food Locker module — Frontend flow

Frontend path: `frontend/src/modules/food-locker/`

## Routes

| Path | Component | Nav |
|------|-----------|-----|
| `/food-locker` | `FoodLockerPage` | "Food Locker" |

## User flows

### Sell food

1. Form + photo picker (multipart)
2. POST `/food-locker/listings` with `floorId` from user
3. Listing appears in grid

### Browse / buy

1. GET `/food-locker/listings?floorId=&status=AVAILABLE`
2. Reserve → POST `/listings/:id/reserve`
3. Seller marks sold → POST `/listings/:id/sold`
4. Buyer rates → POST `/listings/:id/rate`

## Display

- Show locker number, expiration, price, seller name
- Photo gallery from DTO URLs

## Notifications

Seller notified on reserve and sold via notifications module.

## State

Local state in `FoodLockerPage`. Consider tabs: Browse | My listings | My reservations.

## Report flow

Users can report listing via `POST /api/v1/reports` (admin module).
