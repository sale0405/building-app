#!/usr/bin/env bash
set -e
export PATH="/Users/sale0405/.local/node/current/bin:${PATH}"

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if ! curl -sf http://localhost:3001/health >/dev/null 2>&1; then
  echo "Starting backend on http://localhost:3001 ..."
  (cd backend && pnpm exec tsx src/server.ts) &
fi

if ! curl -sf http://localhost:5173/ >/dev/null 2>&1; then
  echo "Starting frontend on http://localhost:5173 ..."
  (cd frontend && pnpm dev) &
fi

sleep 3
echo ""
echo "IT PARK OSIJEK is running:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3001"
echo ""
echo "Demo login:"
echo "  demo@building.local / Demo1234!"
echo "Admin login:"
echo "  admin@building.local / Admin123!"
