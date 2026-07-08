// Single source of truth for the externally-reachable URL of this app.
// Derived from HTTPS_PORT (same variable nginx's host port mapping uses in
// docker-compose.yml) so 42-school setups (rootless podman, HTTPS_PORT=8443)
// and local setups (default 443) both redirect to the right place.
export const PUBLIC_URL = `https://localhost:${process.env.HTTPS_PORT || '443'}`;
