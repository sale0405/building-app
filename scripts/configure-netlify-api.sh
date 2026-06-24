#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: ./scripts/configure-netlify-api.sh https://your-backend.onrender.com"
  exit 1
fi

BACKEND_URL="${1%/}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT_DIR/frontend"
npx netlify env:set VITE_API_URL "${BACKEND_URL}/api/v1" --context production
npx netlify env:set VITE_SOCKET_URL "${BACKEND_URL}" --context production
SKIP_PWA=1 bash ../scripts/netlify-frontend-build.sh
npx netlify deploy --prod

echo "Netlify production updated to use ${BACKEND_URL}"
