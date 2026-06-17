# Floor model

The Building PWA models **one building** with **three floors**. Floor membership is the primary tenancy boundary for social and marketplace features.

## Data model

```
Building (Central Business Tower)
├── Floor 1  (label: "Floor 1")
├── Floor 2  (label: "Floor 2")
└── Floor 3  (label: "Floor 3")

User
├── floorId  → Floor (required, set at registration)
└── role     → RESIDENT | BUSINESS_USER | BUILDING_ADMIN
```

### Prisma models (`backend/prisma/schema/auth.prisma`)

- **Building** — `id`, `name`, `address`
- **Floor** — `id`, `buildingId`, `number` (1–3), `label`; unique on `(buildingId, number)`
- **User** — `floorId` required FK to `Floor`

### Seed data (`backend/prisma/seed.ts`)

| Entity | Value |
|--------|-------|
| Building ID | `building-main` |
| Building name | Central Business Tower |
| Floors | 1, 2, 3 — labels `"Floor 1"`, `"Floor 2"`, `"Floor 3"` |
| Admin user | `admin@building.local` on Floor 1 |
| Demo user | `demo@building.local` on Floor 1 |

Registration requires a valid `floorId` (cuid). Floors are listed publicly at `GET /api/v1/auth/floors` (no auth).

## floorId in JWT and session

On login/register, JWT access token payload includes:

```typescript
{ id, email, role, floorId }
```

This becomes `req.user.floorId` after `authMiddleware` and `socket.data.user.floorId` after Socket.IO auth.

Frontend stores the full profile via `GET /users/me`, which includes nested `floor: { id, number, label, buildingId }`.

## floorId flow by layer

### Registration

1. User loads floors from `/auth/floors`.
2. Register payload includes `floorId` (Zod: `registerSchema`).
3. User row created with permanent `floorId`.
4. Event `user.registered` carries `{ userId, email, role, floorId }`.

### API query resolution

Most list endpoints accept optional `?floorId=`:

| Endpoint | Default if omitted |
|----------|-------------------|
| `GET /smoke-break/invitations` | `req.user.floorId` |
| `GET /chores/requests` | all floors |
| `GET /food-locker/listings` | all floors |
| `GET /business-help/requests` | all floors |
| `GET /users` | all floors |
| `GET /admin/users` | all floors |
| `GET /admin/analytics` | all floors |

Create endpoints typically default to the user's floor:

| Endpoint | floorId source |
|----------|----------------|
| `POST /chores/requests` | `body.floorId ?? req.user.floorId` |
| `POST /food-locker/listings` | `body.floorId ?? req.user.floorId` |
| `POST /smoke-break/invitations` | `body.floorId` (required in schema) |
| `POST /business-help/requests` | `body.floorId` optional |

### Floor-scoped entities

These models store `floorId` directly:

| Model | Schema file | Notes |
|-------|-------------|-------|
| SmokeBreakInvitation | smoke-break.prisma | Invitations visible per floor |
| ChoreRequest | chores.prisma | Help requests scoped to floor |
| FoodListing | food-locker.prisma | Locker listings per floor |
| BusinessHelpRequest | business-help.prisma | Optional floorId (building-wide OK) |

Chat conversations are **not** floor-scoped; they link participants directly. Messages reach users via participant IDs.

### Socket.IO rooms

On connect, each socket joins:

- `user:{userId}` — personal notifications, chat messages, smoke-break join alerts
- `floor:{floorId}` — floor-wide smoke-break invitations

Smoke-break realtime broadcast:

```
eventBus 'smoke-break.invitation.created'
  → io.to(`floor:${floorId}`).emit('smoke-break:invitation', invitation)
```

### Event bus

Domain events often include `floorId` for downstream filtering:

- `smoke-break.invitation.created` — `{ invitation, floorId }`
- `chore.request.created` — `{ chore, floorId }`
- `food-locker.listing.created` — `{ listing, floorId }`

The notifications module stores `floorId` in metadata where relevant but delivers to specific `userId`s.

## Admin and cross-floor visibility

`BUILDING_ADMIN` users have a `floorId` (seed: Floor 1) but admin APIs can query any floor via `?floorId=`. Analytics aggregate across floors when no filter is passed.

## Frontend implications

- **RegisterPage** — floor dropdown populated from `/auth/floors`.
- **Feature pages** — may pass `floorId` query param to filter lists; default UX shows user's floor or all items depending on module.
- **Profile** — displays `user.floor.label` from profile DTO.

## Changing floor assignment

There is no user-facing "change floor" API in the current implementation. `floorId` is set at registration. A future admin tool could add `PATCH /admin/users/:id/floor` — document in `docs/admin/tasks.md` if implemented.

## Diagram

```
┌─────────────┐     register      ┌──────────┐
│   Client    │ ─── floorId ────► │   User   │
└─────────────┘                   └────┬─────┘
       │                               │ floorId
       │ JWT + profile                 ▼
       ▼                          ┌──────────┐
┌─────────────┐                   │  Floor   │
│  REST API   │ ◄── ?floorId ──── │  1|2|3   │
└─────────────┘                   └──────────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│ smoke-break │ chores │ food-locker │ biz   │
│   (floorId on rows + floor socket room)     │
└─────────────────────────────────────────────┘
```
