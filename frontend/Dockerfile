# ============================================================
#   Frontend — ft_transcendence
#
#   Multi-stage build:
#     1) builder: install deps and run `npm run build` (Vite)
#     2) runner:  minimal nginx that serves the dist/ folder
#
#   This container is internal — the main reverse-proxy nginx
#   sits in front of it (see nginx/nginx.conf).
# ============================================================

# ----------------------- Builder ----------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Build-time variables baked into the bundle (Vite reads VITE_*
# at build time, not at runtime). Override via docker-compose
# build args if you deploy to a non-localhost host.
ARG VITE_API_BASE_URL=https://localhost/api
ARG VITE_WS_BASE_URL=wss://localhost/ws
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_WS_BASE_URL=${VITE_WS_BASE_URL}

# Install deps first so this layer caches independently of src changes
COPY package.json package-lock.json* ./
RUN npm ci

# Copy sources and build
COPY . .
RUN npm run build


# ----------------------- Runner -----------------------------
FROM nginx:1.27-alpine AS runner

# Replace default config with one that handles SPA routing
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built static files
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Default CMD inherited from base image runs nginx in foreground
