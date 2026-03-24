#!/bin/sh
set -e

# ---------------------------------------------------------------------------
# Run pending Payload migrations before starting the server.
#
# Migrations run at container startup (not Docker build time) because the
# private database network (libsql.railway.internal) is only reachable from
# running containers, not from build steps.
#
# /migrate contains the full Payload setup (source + node_modules) copied
# from the builder stage specifically for this purpose.
# ---------------------------------------------------------------------------

echo "[entrypoint] Running Payload migrations..."
cd /migrate
# `yes` auto-confirms the dev-mode push warning if a `dev` entry exists in
# payload_migrations (Payload's prompts library reads stdin directly).
yes 2>/dev/null | bun run migrate || {
  echo "[entrypoint] WARNING: Migration exited non-zero (may be safe if no pending migrations)"
}
cd /app

echo "[entrypoint] Starting server..."
exec bun server.js
