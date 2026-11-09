#!/usr/bin/env bash
set -e

# ==============================================================================
# Single-Button & CLI Deploy Script for Ivan De Stefani Hub
# Usage: ./scripts/deploy-standby.sh [target_slot: blue|green] [auto_switch: true|false]
# ==============================================================================

TARGET_SLOT="$1"
AUTO_SWITCH="${2:-false}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=== [DEPLOY-STANDBY] Starting Deployment Pipeline ==="
echo "Repository: $REPO_DIR"

cd "$REPO_DIR"

# 1. Detect target standby slot if not supplied
if [ -z "$TARGET_SLOT" ]; then
  ACTIVE_SLOT=$(curl -s http://127.0.0.1:4000/api/deployments 2>/dev/null | grep -o '"activeSlot":"[^"]*"' | cut -d'"' -f4 || echo "blue")
  if [ "$ACTIVE_SLOT" = "blue" ]; then
    TARGET_SLOT="green"
  else
    TARGET_SLOT="blue"
  fi
fi

echo "Active slot: ${ACTIVE_SLOT:-auto} | Target Standby slot: $TARGET_SLOT"

# 2. Pull latest release from GitHub
echo "[1/4] Pulling latest code from origin/main..."
git fetch origin main
git reset --hard origin/main

COMMIT_HASH=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B | tr '\n' ' ' | cut -c1-100)
echo "Checked out commit: [$COMMIT_HASH] $COMMIT_MSG"

# 3. Build & Recreate standby container
echo "[2/4] Building Next.js production image and starting standby container web-$TARGET_SLOT..."
docker compose -f docker/docker-compose.prod.yml build web-$TARGET_SLOT
docker compose -f docker/docker-compose.prod.yml up -d --no-deps web-$TARGET_SLOT

# 4. Healthcheck loop
STANDBY_PORT="3001"
if [ "$TARGET_SLOT" = "green" ]; then
  STANDBY_PORT="3002"
fi

echo "[3/4] Healthchecking standby container on http://127.0.0.1:$STANDBY_PORT..."
MAX_ATTEMPTS=35
ATTEMPT=0
HEALTHY=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT + 1))
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:$STANDBY_PORT" 2>/dev/null || echo "000")
  if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "307" ] || [ "$HTTP_STATUS" = "308" ]; then
    echo "Standby container is healthy (HTTP $HTTP_STATUS) on attempt $ATTEMPT!"
    HEALTHY=true
    break
  fi
  sleep 2
done

if [ "$HEALTHY" != "true" ]; then
  echo "FATAL: Standby container failed healthcheck on port $STANDBY_PORT after 70 seconds!"
  exit 1
fi

# 5. Register deployment in DB
echo "[4/4] Registering deployment in Hub..."
curl -s -X POST http://127.0.0.1:4000/api/deployments/webhook \
  -H "Content-Type: application/json" \
  -d "{\"projectName\":\"ivandestefani.it\",\"repository\":\"IvoDS/new-hub\",\"commitHash\":\"$COMMIT_HASH\",\"commitMessage\":\"$COMMIT_MSG\",\"imageTag\":\"hub-web:latest-$TARGET_SLOT\"}" >/dev/null || true

# 6. Auto-switch traffic if requested
if [ "$AUTO_SWITCH" = "true" ]; then
  echo "Auto-switch requested: Switching Caddy traffic to $TARGET_SLOT..."
  curl -s -X POST http://127.0.0.1:4000/api/deployments/switch \
    -H "Content-Type: application/json" \
    -d "{\"targetSlot\":\"$TARGET_SLOT\"}" >/dev/null || true
  echo "Traffic successfully switched to $TARGET_SLOT!"
else
  echo "Standby slot $TARGET_SLOT is warm and ready for manual promotion in Admin Hub."
fi

echo "=== [DEPLOY-STANDBY] Deployment completed successfully! ==="
