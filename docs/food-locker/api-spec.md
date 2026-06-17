# Food Locker module — API spec

Base path: `/api/v1/food-locker`

**Auth:** All routes require authentication.

## GET /listings

**Query:** `floorId?`, `status?` (e.g. AVAILABLE)

**Response 200:** `FoodListingDto[]`

## POST /listings

Create listing with optional photos.

**Content-Type:** `multipart/form-data`

| Field | Type | Notes |
|-------|------|-------|
| floorId | string | Defaults to user floor |
| lockerNumber | string | |
| title | string | |
| quantity | number | |
| expirationDate | string | ISO datetime |
| price | number | |
| photos | file[] | Max 5 files, 5 MB each |

**Response 201:** `FoodListingDto`

**Side effect:** `food-locker.listing.created`

## GET /listings/:id

**Response 200:** `FoodListingDto`  
**Errors:** 404

## POST /listings/:id/reserve

Reserve as buyer (listing must be AVAILABLE).

**Response 200:** Updated listing DTO

**Side effect:** `food-locker.item.reserved` → notifies seller

Reservation expires in 24 hours (DB record; no auto-release job yet).

## POST /listings/:id/sold

Mark sold (seller action).

**Response 200:** Updated listing DTO

**Side effect:** `food-locker.item.sold`

## POST /listings/:id/rate

Rate seller after purchase.

**Body:**

```json
{ "rating": 1-5, "comment": "optional string max 500" }
```

**Response 200:** `{ success: true, message: "Rating submitted" }`

## FoodListingDto

Includes `photos: { id, url, sortOrder }[]` and optional `seller` profile.

Photo URLs resolved via storage service `/api/v1/storage/:key`.

## Admin integration

`DELETE /api/v1/admin/listings/:id` emits `admin.listing.removed` → food-locker soft-deletes listing.
