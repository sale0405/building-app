# Architecture

Central reference for the Building PWA modular monorepo.

## Monorepo structure

```
building-app/
├── package.json           # Root scripts (dev, build, test, db:*)
├── pnpm-workspace.yaml    # frontend, backend, shared
├── MASTER_PROMPT.md       # Cursor session rules
├── docs/                  # Architecture and per-module docs
├── shared/                # @building-app/shared — types, validators, events
├── backend/               # @building-app/backend — Express API
│   ├── prisma/schema/     # Split Prisma schema by module
│   └── src/
│       ├── config/        # enabledModules, JWT, storage, VAPID
│       ├── core/          # app bootstrap, middleware, event bus, socket, storage
│       └── modules/       # Feature modules (auth, users, …)
├── frontend/              # @building-app/frontend — Vite + React PWA
│   └── src/
│       ├── config/        # enabledModules, API_BASE
│       ├── core/          # api-client, socket-client, module-registry, guards
│       └── modules/       # Feature UI modules
└── docker/                # docker-compose, Dockerfiles, nginx
```

### Package dependencies

```
frontend ──► shared
backend  ──► shared
```

Frontend and backend never import each other. All contracts live in `shared/`.

## Module list

| Module | API prefix | Realtime | Owns DB models |
|--------|------------|----------|----------------|
| auth | `/api/v1/auth` | — | User, UserProfile, Building, Floor, tokens |
| users | `/api/v1/users` | — | (uses auth models) |
| notifications | `/api/v1/notifications` | Socket `notification:new` | Notification, PushSubscription, NotificationPreference |
| chat | `/api/v1/chat` | Socket `chat:*` | Conversation, Message, attachments |
| smoke-break | `/api/v1/smoke-break` | Socket `smoke-break:*` | SmokeBreakInvitation, Participant |
| chores | `/api/v1/chores` | — (events only) | ChoreRequest, ChoreStatusHistory |
| food-locker | `/api/v1/food-locker` | — (events only) | FoodListing, Photo, Reservation, Rating |
| business-help | `/api/v1/business-help` | — (events only) | Request, Offer, Match, Meeting |
| admin | `/api/v1/admin`, `/api/v1/reports` | — | AdminReport, AdminAuditLog, UserModeration |

## Boot sequence

### Backend (`backend/src/server.ts`)

1. Create Express app + HTTP server.
2. Apply helmet, CORS, JSON body parser.
3. Initialize `LocalStorageService`.
4. `registerModules(app, { eventBus, storage }, httpServer)` — lazy-loads each enabled module.
5. `initSocketGateway(httpServer)` — JWT auth on connect, wire event bus → Socket.IO.
6. Listen on port 3001 (configurable).

### Frontend (`frontend/src/main.tsx`)

1. Side-effect imports register each module with `moduleRegistry`.
2. `useAuthStore.init()` loads tokens, fetches `/users/me`, connects Socket.IO.
3. React Router: guest routes (`/login`, `/register`) vs protected routes inside `AppLayout`.

## Module communication

### REST (synchronous)

- Base URL: `/api/v1` (frontend: `VITE_API_URL` or `/api/v1`).
- Auth: `Authorization: Bearer {accessToken}`.
- Responses: `ApiResponse<T>` from shared types.
- Token refresh: automatic in `apiClient` on 401 via `/auth/refresh`.

### Event bus (server-side async)

Singleton `eventBus` in `backend/src/core/events/event-bus.ts`. Typed by `DomainEventMap` in `@building-app/shared`.

**Emitters (examples):**

- `auth` → `user.registered`
- `smoke-break` → `smoke-break.invitation.created`, `smoke-break.participant.joined`
- `chores` → `chore.request.created`, `chore.status.changed`
- `food-locker` → `food-locker.listing.created`, `food-locker.item.reserved`, `food-locker.item.sold`
- `business-help` → `business-help.matched`
- `chat` → `chat.message.sent`
- `notifications` → `notification.created`
- `admin` → `admin.listing.removed`

**Listeners (examples):**

- `notifications` — subscribes to most domain events, creates in-app notifications.
- `chat` — auto-creates conversations on chore match and business-help match.
- `food-locker` — soft-deletes listing on `admin.listing.removed`.
- `users` — logs `user.registered` (placeholder for future welcome workflow).

Modules register listeners in their `index.ts` `registerModule()`.

### Socket.IO (client realtime)

Gateway: `backend/src/core/socket/socket-gateway.ts`.

**Connection:**

- Client sends JWT in `auth.token`.
- Server joins rooms: `user:{userId}`, `floor:{floorId}`.

**Client → server:**

| Event | Purpose |
|-------|---------|
| `chat:join` | Join `conversation:{id}` room |
| `chat:leave` | Leave conversation room |
| `chat:typing` | Typing indicator |

**Server → client:**

| Event | Source |
|-------|--------|
| `notification:new` | `notification.created` |
| `smoke-break:invitation` | `smoke-break.invitation.created` → floor room |
| `smoke-break:joined` | `smoke-break.participant.joined` → creator |
| `chat:message` | `chat.message.sent` |
| `chat:typing` | Client relay |

Frontend client: `frontend/src/core/socket-client.ts`.

## Enable / disable modules

Configuration mirrors on both tiers:

```typescript
// backend/src/config/modules.ts & frontend/src/config/modules.ts
export const enabledModules: ModuleName[] = [
  'auth', 'users', 'notifications', 'chat', 'smoke-break',
  'chores', 'food-locker', 'business-help', 'admin',
];
```

**Backend:** `registerModules` iterates `enabledModules` and dynamic-imports each module's `registerModule`.

**Frontend:** Each module's `index.ts` calls `moduleRegistry.register()` at import time. Remove the import from `main.tsx` to disable UI.

Disabling `auth` breaks the app. Disabling `notifications` does not remove event listeners in other modules — only the notification persistence and REST/socket delivery stop if the module is not registered.

## Core middleware

| Middleware | File | Purpose |
|------------|------|---------|
| `authMiddleware` | `core/middleware/auth.ts` | JWT validation, moderation check |
| `requireRole(...)` | same | Role-based access (admin) |
| `validateBody` / `validateQuery` | `core/middleware/validate.ts` | Zod validation |
| `resolveFloorContext` | `core/middleware/floor.ts` | Resolve `floorId` to `req.body._floorId` |

## Storage

`StorageService` interface with `LocalStorageService` implementation. Files saved under `STORAGE_PATH` (default `./uploads`). Public URLs: `/api/v1/storage/:key`.

Used by: users (profile photo), chat (attachments), food-locker (listing photos).

## Coding standards

### TypeScript

- Strict mode, ES modules, `.js` extensions in import paths (Node16 resolution).
- Shared enums and DTOs — never duplicate in frontend/backend.

### Backend module anatomy

```
modules/{name}/
├── index.ts           # registerModule(app, ctx)
├── routes/
├── controllers/
├── services/          # business logic + optional repository class
├── repositories/      # (optional, some modules inline in service file)
├── dto/
└── tests/
```

### Frontend module anatomy

```
modules/{name}/
├── index.ts           # moduleRegistry.register({ routes, navItems })
├── pages/
├── store/             # Zustand (where needed)
└── tests/
```

### API conventions

- Nouns in URLs, HTTP verbs for actions.
- List endpoints support `?floorId=` and `?status=` where applicable.
- Pagination: `?page=1&pageSize=20` (notifications).
- Errors: `{ success: false, error: string }` with appropriate HTTP status.

### File size limits

| Target | Limit |
|--------|-------|
| Service / controller | ~250 lines |
| Page component | ~300 lines |
| Single function | ~40 lines |

Split files when approaching limits. Prefer composition over god-classes.

### Security

- Passwords: bcrypt (12 rounds).
- Refresh tokens: SHA-256 hashed at rest.
- JWT secrets from env (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`).
- Helmet + CORS on API.
- Account disable via `UserModeration` checked in `authMiddleware`.

## Database

- PostgreSQL, Prisma 6, schema split across `backend/prisma/schema/*.prisma`.
- `auth.prisma` holds `Building`, `Floor`, `User`, `UserProfile` — hub for relations.
- Migrations: `pnpm db:migrate`; seed: `pnpm db:seed`.

## Deployment

Docker Compose in `docker/` runs PostgreSQL, backend, frontend (nginx). See `docker/docker-compose.yml` for service wiring.

## Related docs

- [Floor model](./floor-model.md)
- Per-module docs under `docs/{module}/`
