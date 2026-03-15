#!/usr/bin/env bash
# Guard script: prevents multiple dev servers on the same port.
PORT="${PORT:-3100}"

if lsof -iTCP:"$PORT" -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "✦ Dev server already running on port $PORT — not starting another one."
  exit 0
fi

exec bun next dev --port "$PORT"
