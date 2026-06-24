#!/bin/sh
# ============================================================
#   Backend entrypoint (production)
#   - Waits for the DB and applies pending Prisma migrations
#   - Starts the NestJS server with exec so signals propagate
# ============================================================

set -e

echo "[entrypoint] Applying Prisma migrations..."
# On a fresh volume, Postgres accepts connections for a moment while it is
# still creating the role/database, so the first attempt can fail with P1000.
# Retry a few times before giving up.
ATTEMPTS=0
until npx prisma migrate deploy; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge 10 ]; then
    echo "[entrypoint] migrate deploy failed after $ATTEMPTS attempts — aborting."
    exit 1       
  fi                
  echo "[entrypoint] DB not ready (attempt $ATTEMPTS), retrying in 2s..."
  sleep 2               
done                      

echo "[entrypoint] Starting NestJS..."
exec node dist/main.js
