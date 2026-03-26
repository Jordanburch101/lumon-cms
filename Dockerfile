# syntax=docker/dockerfile:1

# =============================================================================
# Stage 1: Install dependencies
# =============================================================================
FROM oven/bun:1-slim AS deps
WORKDIR /app

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile

# =============================================================================
# Stage 2: Build the application
# =============================================================================
FROM oven/bun:1-slim AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars
ARG PAYLOAD_SECRET
ARG S3_BUCKET
ARG S3_REGION
ARG S3_ACCESS_KEY_ID
ARG S3_SECRET_ACCESS_KEY
ARG S3_ENDPOINT
ARG NEXT_PUBLIC_SERVER_URL
# DATABASE_BUILD_URI = public libsql URL (private URL isn't reachable during build)
ARG DATABASE_BUILD_URI
ARG DATABASE_AUTH_TOKEN

ENV PAYLOAD_SECRET=${PAYLOAD_SECRET} \
    S3_BUCKET=${S3_BUCKET} \
    S3_REGION=${S3_REGION} \
    S3_ACCESS_KEY_ID=${S3_ACCESS_KEY_ID} \
    S3_SECRET_ACCESS_KEY=${S3_SECRET_ACCESS_KEY} \
    S3_ENDPOINT=${S3_ENDPOINT} \
    NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL} \
    NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Payload codegen
RUN bun run generate:types && \
    bun run generate:importmap && \
    bun run generate:field-map

# Run migrations against production DB before build (prerendering queries the DB)
RUN DATABASE_URI=${DATABASE_BUILD_URI} DATABASE_AUTH_TOKEN=${DATABASE_AUTH_TOKEN} bun run migrate

# Next.js build — connects to production DB for prerendering (robots.txt, sitemap, etc.)
RUN DATABASE_URI=${DATABASE_BUILD_URI} DATABASE_AUTH_TOKEN=${DATABASE_AUTH_TOKEN} bun --bun run build

# =============================================================================
# Stage 3: Production runner
# =============================================================================
FROM oven/bun:1-slim AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    MALLOC_ARENA_MAX=2 \
    NEXT_SHARP_PATH=/app/node_modules/sharp

# Install ffmpeg for video optimization jobs
RUN apt-get update && \
    apt-get install -y --no-install-recommends ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Non-root user
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Writable .next for ISR/PPR cache
RUN mkdir -p .next && chown nextjs:nodejs .next

# Standalone output (server + traced node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Native binaries the standalone tracer drops:
# Sharp (~7.4 MB)
COPY --from=builder /app/node_modules/@img/sharp-linux-x64 ./node_modules/@img/sharp-linux-x64
COPY --from=builder /app/node_modules/@img/sharp-libvips-linux-x64 ./node_modules/@img/sharp-libvips-linux-x64
# libsql (~9.7 MB)
COPY --from=builder /app/node_modules/@libsql/linux-x64-gnu ./node_modules/@libsql/linux-x64-gnu
COPY --from=builder /app/node_modules/@libsql/client ./node_modules/@libsql/client
COPY --from=builder /app/node_modules/libsql ./node_modules/libsql

# Migration runner — full Payload setup so `bun run migrate` works at startup.
# Migrations run at container start (not build time) because the private DB
# network is only reachable from running containers.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules /migrate/node_modules
COPY --from=builder --chown=nextjs:nodejs /app/src /migrate/src
COPY --from=builder --chown=nextjs:nodejs /app/package.json /migrate/package.json
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json /migrate/tsconfig.json

# Bun memory optimization
COPY --chown=nextjs:nodejs bunfig.toml ./

# Entrypoint: run migrations then start server
COPY --chown=nextjs:nodejs entrypoint.sh ./
RUN chmod +x entrypoint.sh

USER nextjs
EXPOSE 3000

CMD ["./entrypoint.sh"]
