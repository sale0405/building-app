# Building App

Modular Progressive Web Application for tenants of a single business building with 3 floors.

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 16 (or Docker)

### Local Development

```bash
cd building-app
cp .env.example .env
cp .env.example backend/.env
pnpm install
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/health

### Docker

```bash
cd docker
docker compose up --build
```

### Demo Accounts (after seed)

| Email | Password | Role |
|-------|----------|------|
| admin@building.local | Admin123! | Building Admin |
| demo@building.local | Demo1234! | Business User |

## Project Structure

```
building-app/
├── frontend/     # React + Vite PWA
├── backend/      # Express + Prisma API
├── shared/       # Types, validators, events
├── docs/         # Architecture & module docs
├── docker/       # Docker Compose
└── MASTER_PROMPT.md  # Cursor session rules
```

## Modules

auth · users · notifications · chat · smoke-break · chores · food-locker · business-help · admin

See [docs/architecture.md](docs/architecture.md) for module communication patterns.

## Cursor Workflow

```
Read MASTER_PROMPT.md and follow its architectural rules.
We are currently working only on the `food-locker` module.
```
