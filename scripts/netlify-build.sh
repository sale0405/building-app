#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

export PATH="$PATH:/usr/local/bin:$HOME/.local/node/current/bin"

if command -v corepack >/dev/null 2>&1; then
  corepack enable
  corepack prepare pnpm@9.15.0 --activate
fi

pnpm install
if [ -f "$ROOT_DIR/shared/dist/index.js" ]; then
  echo "Using existing shared dist."
else
  pnpm --filter @building-app/shared build
fi
if [ -f "$ROOT_DIR/backend/dist/create-app.js" ]; then
  echo "Using existing backend dist."
else
  pnpm --filter @building-app/backend build
fi

PRISMA_ROOT="$(node "$ROOT_DIR/scripts/resolve-prisma-paths.cjs")"
PRISMA_PKG_SRC="${PRISMA_ROOT%%|*}"
PRISMA_CLIENT_SRC="${PRISMA_ROOT##*|}"

copy_prisma_bundle() {
  local dest="$1"
  mkdir -p "$dest/@prisma" "$dest/.prisma"
  rm -rf "$dest/@prisma/client" "$dest/.prisma/client"
  cp -R "$PRISMA_PKG_SRC" "$dest/@prisma/client"
  cp -R "$PRISMA_CLIENT_SRC" "$dest/.prisma/client"
  echo "Prisma -> $dest"
}

FN_DIR="$ROOT_DIR/frontend/netlify/functions"
mkdir -p "$FN_DIR/lib/backend" "$FN_DIR/lib/shared"
rm -rf "$FN_DIR/lib/backend"/* "$FN_DIR/lib/shared"/*
cp -R "$ROOT_DIR/backend/dist/." "$FN_DIR/lib/backend/"
cp -R "$ROOT_DIR/shared/dist/." "$FN_DIR/lib/shared/"
cp -R "$ROOT_DIR/backend/prisma" "$FN_DIR/lib/backend/prisma"

cd "$FN_DIR"
rm -rf node_modules package-lock.json
npm install --omit=dev --no-audit --no-fund --ignore-scripts
copy_prisma_bundle "$FN_DIR/node_modules"

if [ -n "${NETLIFY_DB_URL:-}" ] && [ -n "${NETLIFY:-}" ]; then
  export DATABASE_URL="${NETLIFY_DB_URL}?connect_timeout=20"
  echo "Applying database schema..."
  cd "$ROOT_DIR/backend"
  pnpm exec prisma db push --skip-generate --accept-data-loss || echo "DB push skipped"
  pnpm exec tsx prisma/seed.ts || echo "DB seed skipped"
fi

cd "$ROOT_DIR/frontend"
if [ -f "$ROOT_DIR/frontend/dist/index.html" ]; then
  echo "Using existing frontend dist."
else
  SKIP_PWA=1 pnpm exec vite build
fi
echo "Netlify build complete."
