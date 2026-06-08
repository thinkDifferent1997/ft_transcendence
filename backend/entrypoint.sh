#!/bin/sh
# ============================================================
#   Backend entrypoint
#   - Applies pending Prisma migrations (idempotent)
#   - Starts the NestJS server with exec so signals propagate
# ============================================================

set -e

echo "[entrypoint] Applying Prisma migrations..."
npx prisma migrate deploy

echo "[entrypoint] Starting NestJS..."
exec node dist/main.js
