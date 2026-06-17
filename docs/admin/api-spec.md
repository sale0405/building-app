# Admin module — API spec

## Admin routes

Base path: `/api/v1/admin`  
**Auth:** Bearer token + role `BUILDING_ADMIN`

### GET /users

List users.

**Query:** `floorId?`

**Response 200:** `UserProfileDto[]`

### POST /users/:id/disable

Disable user account.

**Body:** `{ reason?: string }` (default "Admin action")

**Response 200:** `{ success: true, message: "User disabled" }`

Creates `UserModeration` + `AdminAuditLog`.

### DELETE /listings/:id

Remove food listing.

**Response 200:** `{ success: true, message: "Listing removed" }`

**Side effects:**

- Soft-deletes listing in DB
- Emits `admin.listing.removed`
- food-locker module listener completes cleanup
- Seller notified

### GET /reports

List all reports.

**Response 200:** `AdminReportDto[]`

### POST /reports

Create report (admin route — duplicate of public route).

**Body** (`createReportSchema`):

```json
{
  "targetType": "food-listing",
  "targetId": "cuid",
  "reason": "string 10-1000 chars"
}
```

### GET /analytics

Dashboard metrics.

**Query:** `floorId?`

**Response 200:** `AdminAnalyticsDto`

```typescript
{
  totalUsers: number;
  usersByFloor: { floorId, floorLabel, count }[];
  activeListings: number;
  openChores: number;
  openBusinessRequests: number;
  messagesLast24h: number;
}
```

---

## Public report route

Base path: `/api/v1/reports`  
**Auth:** Any authenticated user

### POST /reports

Same body as admin report create.

**Response 201:** Report DTO

Registered in `admin/index.ts` via `createReportRoutes()` on `/api/v1`.
