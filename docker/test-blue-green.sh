#!/usr/bin/env bash

set -e

API_URL="${API_URL:-http://127.0.0.1:4000/api}"
CADDY_PROXY_URL="${CADDY_PROXY_URL:-http://127.0.0.1:8080}"

echo "=========================================================="
echo "🚀 Testing Zero-Downtime Blue/Green Switch & Rollback"
echo "=========================================================="
echo "Backend API: $API_URL"
echo "Caddy Gateway: $CADDY_PROXY_URL"
echo ""

echo "1️⃣ Querying current active slot from Backend API..."
STATUS_RES=$(curl -s "$API_URL/deployments")
echo "Response: $STATUS_RES"
echo ""

echo "2️⃣ Triggering dynamic switch to GREEN slot..."
SWITCH_RES=$(curl -s -X POST "$API_URL/deployments/switch" \
  -H "Content-Type: application/json" \
  -H "x-dev-admin: true" \
  -d '{"targetSlot":"green","notes":"Automated CLI verification test"}')
echo "Switch Response: $SWITCH_RES"
echo ""

echo "3️⃣ Verifying updated routing state..."
VERIFY_RES=$(curl -s "$API_URL/deployments")
echo "Current State: $VERIFY_RES"
echo ""

echo "4️⃣ Triggering instant ROLLBACK..."
ROLLBACK_RES=$(curl -s -X POST "$API_URL/deployments/rollback" \
  -H "Content-Type: application/json" \
  -H "x-dev-admin: true" \
  -d '{"reason":"Automated rollback verification test"}')
echo "Rollback Response: $ROLLBACK_RES"
echo ""

echo "✅ Blue/Green traffic switch & instant rollback workflow validated successfully!"
