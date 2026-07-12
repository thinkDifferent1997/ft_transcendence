# ============================================================
#   PostgreSQL — ft_transcendence
#
#   Wraps the official postgres image. Customize here if you
#   need extensions or seed data on first boot:
#
#     RUN apk add --no-cache <extension>
#     COPY init.sql /docker-entrypoint-initdb.d/
#
#   Files in /docker-entrypoint-initdb.d/ run automatically
#   the first time the data volume is empty.
# ============================================================

FROM docker.io/library/postgres:16-alpine

# Pinned version above ensures reproducibility across the team.
