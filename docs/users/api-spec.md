# Users module — API spec

Base path: `/api/v1/users`

**Auth:** All routes require `authMiddleware`.

## GET /me

Current user profile.

**Response 200:** `UserProfileDto`

## PATCH /me

Update profile fields.

**Body** (`updateProfileSchema` — all optional):

| Field | Type |
|-------|------|
| name | string (min 2) |
| apartmentOrCompanyId | string |
| bio | string (max 500) |
| availabilityStatus | AvailabilityStatus |

**Response 200:** Updated `UserProfileDto`

## POST /me/photo

Upload profile photo.

**Content-Type:** `multipart/form-data`  
**Field:** `photo` (max 5 MB)

**Response 200:** `UserProfileDto` with updated `photoUrl`

## GET /

List users.

**Query:**

| Param | Type | Notes |
|-------|------|-------|
| floorId | string (cuid) | Optional filter |

**Response 200:** `UserProfileDto[]`

## GET /:id

Get user by ID.

**Response 200:** `UserProfileDto`  
**Errors:** 404 — not found or deleted
