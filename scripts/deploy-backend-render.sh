#!/usr/bin/env bash
set -euo pipefail

echo "Render backend deploy"
echo "====================="
echo ""
echo "1. Push this repo to GitHub (if not already)."
echo "2. Open https://dashboard.render.com/select-repo?type=blueprint"
echo "3. Connect the repo and deploy the render.yaml blueprint."
echo "4. Wait for building-app-api to become Live."
echo "5. Copy the service URL, then run:"
echo "   ./scripts/configure-netlify-api.sh https://YOUR-SERVICE.onrender.com"
echo ""
echo "Demo accounts after first deploy:"
echo "  admin@building.local / Admin123!"
echo "  demo@building.local / Demo1234!"
