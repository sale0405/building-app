# Building PWA — Cursor Session Rules

Use this file as the primary context when working in Cursor on the Building PWA modular monorepo.

## Project identity

- **Product:** Progressive Web App for tenants of a single business building (Central Business Tower).
- **Stack:** pnpm monorepo — `frontend` (Vite + React), `backend` (Express + Prisma), `shared` (types, validators, events).
- **Database:** PostgreSQL via Prisma (multi-file schema under `backend/prisma/schema/`).

## Golden rules

### 1. One module at a time

Work on **exactly one feature module** per session unless the change is purely in `shared/` or `core/`.

| Module | Backend path | Frontend path |
|--------|--------------|---------------|
| auth | `backend/src/modules/auth/` | `frontend/src/modules/auth/` |
| users | `backend/src/modules/users/` | `frontend/src/modules/user-profile/` |
| notifications | `backend/src/modules/notifications/` | `frontend/src/modules/notifications/` |
| chat | `backend/src/modules/chat/` | `frontend/src/modules/chat/` |
| smoke-break | `backend/src/modules/smoke-break/` | `frontend/src/modules/smoke-break/` |
| chores | `backend/src/modules/chores/` | `frontend/src/modules/chores/` |
| food-locker | `backend/src/modules/food-locker/` | `frontend/src/modules/food-locker/` |
| business-help | `backend/src/modules/business-help/` | `frontend/src/modules/business-help/` |
| admin | `backend/src/modules/admin/` | `frontend/src/modules/admin/` |

Do **not** edit multiple module folders in one PR unless coordinating a `shared/` contract change.

### 2. Docs before code

Before implementing a feature or bug fix in a module:

1. Read `docs/{module}/overview.md` and `docs/architecture.md`.
2. Update the relevant doc (`api-spec.md`, `database-schema.md`, or `frontend-flow.md`) if the contract changes.
3. Add or update `tasks.md` with what you are doing and acceptance criteria.
4. Then write code.

### 3. No cross-module imports

Modules must **not** import from other modules directly.

**Allowed communication:**

| Mechanism | Use for |
|-----------|---------|
| **REST** (`/api/v1/{module}/…`) | Client ↔ server, synchronous reads/writes |
| **Event bus** (`eventBus.emit` / `eventBus.on`) | Server-side async reactions between modules |
| **Socket.IO** | Real-time push to clients (notifications, chat, smoke-break) |
| **`@building-app/shared`** | Types, Zod validators, domain event map |

Example: `notifications` listens to `chore.status.changed`; it does **not** import `ChoresService`.

### 4. Enable / disable modules

Both `backend/src/config/modules.ts` and `frontend/src/config/modules.ts` export `enabledModules: ModuleName[]`.

To disable a module:

1. Remove its name from both `enabledModules` arrays.
2. Remove its side-effect import from `frontend/src/main.tsx`.
3. Do not delete module code — keep it for future re-enable.

Backend registration is dynamic via `registerModules()` in `backend/src/core/app.ts`.

### 5. Floor scoping

Every user belongs to one floor (`User.floorId`). Floor-scoped features filter by `floorId` query param or default to `req.user.floorId`. See `docs/floor-model.md`.

### 6. Coding standards

- **Language:** TypeScript, ESM (`"type": "module"`).
- **Backend layering:** `routes` → `controllers` → `services` → repositories (Prisma).
- **Validation:** Zod schemas in `@building-app/shared`; apply via `validateBody` / `validateQuery`.
- **API shape:** `{ success: boolean, data?, error?, message? }`.
- **Auth:** JWT access + refresh tokens; `authMiddleware` on protected routes.
- **Roles:** `RESIDENT`, `BUSINESS_USER`, `BUILDING_ADMIN` — use `requireRole()` for admin-only routes.
- **Soft deletes:** Prefer `deletedAt` over hard delete for user-facing entities.
- **File uploads:** Use `StorageService` from module context; serve via `/api/v1/storage/:key`.

### 7. File size limits

Keep files focused and split when they grow:

| File type | Soft limit | Action when exceeded |
|-----------|------------|----------------------|
| Service / controller | 250 lines | Extract repository or helper |
| React page component | 300 lines | Extract sub-components or hooks |
| Route file | 80 lines | Keep thin; logic in controller |
| Prisma schema file | 120 lines | One schema file per module (already split) |

Run `pnpm lint` and `pnpm test` before finishing.

### 8. Shared package changes

If you add or change a domain event, DTO, enum, or validator:

1. Update `shared/src/` first.
2. Update `shared/src/events/index.ts` `DomainEventMap` and `SocketEvents`.
3. Update consuming modules' event listeners.
4. Rebuild: `pnpm --filter @building-app/shared build` (if applicable).

### 9. Database changes

- Add models to the module's Prisma file: `backend/prisma/schema/{module}.prisma`.
- Cross-module relations go through `User` or `Floor` in `auth.prisma`.
- Run `pnpm db:generate` and `pnpm db:migrate` after schema changes.
- Seed data: single building, 3 floors — `pnpm db:seed`.

### 10. Testing

- Backend: Vitest + Supertest in `backend/src/modules/{module}/tests/`.
- Frontend: Vitest + Testing Library in `frontend/src/modules/{module}/tests/`.
- Add tests for new endpoints and critical UI flows.

## Quick reference

```bash
pnpm dev              # frontend + backend in parallel
pnpm dev:backend      # API on :3001
pnpm dev:frontend     # Vite on :5173
pnpm db:seed          # seed building + demo users
```

**Demo credentials (after seed):**

- Admin: `admin@building.local` / `Admin123!`
- Demo user: `demo@building.local` / `Demo1234!`

## Documentation map

| Document | Purpose |
|----------|---------|
| `docs/architecture.md` | Monorepo, communication patterns, standards |
| `docs/floor-model.md` | Building/floor model and floorId flow |
| `docs/{module}/overview.md` | Module purpose and boundaries |
| `docs/{module}/api-spec.md` | REST endpoints |
| `docs/{module}/database-schema.md` | Prisma models |
| `docs/{module}/frontend-flow.md` | UI routes, stores, sockets |
| `docs/{module}/tasks.md` | Backlog and done items |

When in doubt, prefer minimal diffs, match existing patterns, and keep modules decoupled.
