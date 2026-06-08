# ============================================================
#   Backend — ft_transcendence (NestJS + Prisma)
#
#   Multi-stage build:
#     1) builder: install all deps, generate Prisma client,
#                 compile TypeScript with `npm run build`
#     2) runner:  copy compiled output and node_modules into
#                 a smaller image, run as non-root
#
#   The entrypoint applies pending migrations then starts the
#   server. Subsequent runs are no-ops if no new migrations.
# ============================================================

# ----------------------- Builder ----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Build tools needed for native modules (bcrypt, etc.)
RUN apk add --no-cache python3 make g++ libc6-compat openssl

# Install dependencies first for better layer caching
COPY package.json package-lock.json* ./
RUN npm ci

# Generate Prisma client before TS build (NestJS code imports it)
COPY prisma ./prisma
RUN npx prisma generate

# Compile NestJS
COPY . .
RUN npm run build


# ----------------------- Runner -----------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Prisma needs OpenSSL at runtime on Alpine
RUN apk add --no-cache openssl libc6-compat

# Run as a non-root user
RUN addgroup -S app && adduser -S app -G app

# Copy artifacts from the builder. node_modules is copied as-is
# (not pruned) so the prisma CLI remains available for migrations.
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/dist         ./dist
COPY --from=builder --chown=app:app /app/prisma       ./prisma
COPY --from=builder --chown=app:app /app/package.json ./package.json

# Entrypoint runs migrations then starts the app
COPY --chown=app:app entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

USER app

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
