# Auth module — API spec

Base path: `/api/v1/auth`

All responses use `ApiResponse<T>` unless noted.

## GET /floors

List floors for registration dropdown.

**Auth:** None

**Response 200:**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "buildingId": "building-main",
      "number": 1,
      "label": "Floor 1",
      "building": { "id": "building-main", "name": "Central Business Tower", "address": "..." }
    }
  ]
}
```

## POST /register

**Auth:** None

**Body** (`registerSchema`):

| Field | Type | Required |
|-------|------|----------|
| email | string (email) | yes |
| password | string (min 8) | yes |
| name | string (min 2) | yes |
| role | UserRole enum | yes |
| floorId | string (cuid) | yes |
| apartmentOrCompanyId | string | yes |

**Response 201:**

```json
{
  "success": true,
  "data": {
    "user": { /* UserProfileDto */ },
    "tokens": { "accessToken": "...", "refreshToken": "..." }
  }
}
```

**Errors:** 400 — email already registered, validation error.

**Side effect:** Emits `user.registered`.

## POST /login

**Body** (`loginSchema`): `{ email, password }`

**Response 200:** `{ user: UserProfileDto, tokens: TokenPair }`

**Errors:** 401 — invalid credentials

## POST /logout

**Body:** `{ refreshToken: string }`

**Response 200:** `{ success: true, message: "Logged out" }`

Revokes refresh token hash.

## POST /refresh

**Body:** `{ refreshToken: string }`

**Response 200:** `{ tokens: TokenPair }`

Rotates refresh token (old token revoked).

**Errors:** 401 — invalid/expired refresh token

## POST /forgot-password

**Body:** `{ email: string }`

**Response 200:** Generic success message. In `NODE_ENV=development`, may include `resetToken` for testing.

## POST /reset-password

**Body:** `{ token: string, password: string (min 8) }`

**Response 200:** `{ success: true, message: "Password reset successful" }`

**Errors:** 400 — invalid or expired token

## JWT claims (access token)

```typescript
{ id: string; email: string; role: UserRole; floorId: string }
```

Default expiry: 15 minutes (`JWT_ACCESS_EXPIRES_IN`).

Refresh token: opaque hex string, 7-day expiry, stored hashed.
