# ============================================================
#   Reverse-proxy nginx — ft_transcendence
#
#   Terminates HTTPS, routes:
#     /         -> frontend container
#     /api/     -> backend container
#     /ws/      -> backend container (WebSocket upgrade)
#
#   Certificates are mounted from the host at /etc/nginx/certs
#   (see docker-compose.yml). Generate them with `make certs`.
# ============================================================

FROM nginx:1.27-alpine

# Drop the stock default.conf and ship ours instead
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Validate the config at build time — fails the build on syntax errors
#RUN nginx -t

EXPOSE 443

# Default CMD inherited from the base image: nginx -g 'daemon off;'
