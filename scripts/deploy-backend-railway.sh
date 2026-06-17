#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if ! npx @railway/cli@latest whoami >/dev/null 2>&1; then
  echo "Log in first:"
  npx @railway/cli@latest login
fi

if [ ! -f .railway/project.json ]; then
  npx @railway/cli@latest init --name building-app-api
fi

echo "Adding PostgreSQL (skip if already added)..."
npx @railway/cli@latest add --database postgres || true

echo "Setting env vars..."
npx @railway/cli@latest variables set NODE_ENV=production PORT=3001 STORAGE_PATH=/app/uploads
npx @railway/cli@latest variables set CORS_ORIGIN=https://boisterous-pithivier-1cd25b.netlify.app
npx @railway/cli@latest variables set JWT_ACCESS_SECRET="$(openssl rand -hex 32)"
npx @railway/cli@latest variables set JWT_REFRESH_SECRET="$(openssl rand -hex 32)"

echo "Deploying Docker backend..."
npx @railway/cli@latest up --detach --service building-app-api

echo ""
echo "After deploy finishes, run:"
echo "  npx @railway/cli@latest domain"
echo "  ./scripts/configure-netlify-api.sh https://YOUR-RAILWAY-URL"
