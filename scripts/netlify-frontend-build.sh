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
pnpm --filter @building-app/shared build
cd "$ROOT_DIR/frontend"
SKIP_PWA=1 pnpm exec vite build
echo "Frontend build complete."
