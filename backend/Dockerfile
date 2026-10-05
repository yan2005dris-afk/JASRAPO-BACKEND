# syntax=docker/dockerfile:1

# ─── Stage: Base ──────────────────────────────────────────────────────────────
# Hard Rule #2: pin Node via the pnpm runtime, not the base image.
#
# We use `node:22-alpine` instead of `ghcr.io/pnpm/pnpm:12` (the skill's default)
# because sharp and other native modules must be built against the SAME libc as
# the runtime stage. The runner is also `node:22-alpine` (musl). pnpm:12 is
# debian-slim (glibc), so any native module installed during `pnpm install` in
# the builder would be glibc-built and fail to load in the alpine runtime
# ("Could not load the 'sharp' module using the linuxmusl-x64 runtime").
# Builder and runner must share the libc.
FROM node:22-alpine AS base

# Alpine packages: openssl for Prisma, libc6-compat for native modules.
RUN apk add --no-cache openssl libc6-compat

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PNPM_CONFIG_PACKAGE_IMPORT_METHOD=copy
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
# Prevent Puppeteer from downloading Chrome in the builder stage. The runtime
# stage uses the system Chromium (PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium),
# so the bundled Chrome from puppeteer's postinstall is dead weight.
# Puppeteer >=19 renamed the env var from PUPPETEER_SKIP_CHROMIUM_DOWNLOAD to
# PUPPETEER_SKIP_DOWNLOAD. The lockfile pins puppeteer@25.1.0, so we need the new
# name. We set both for forward/backward compatibility.
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV SHELL=/bin/sh
ENV ENV=/root/.profile

# corepack ships with Node 22+. Use it to pin pnpm to the workspace's declared
# `packageManager` (pnpm@12.3.4) — the pnpm-lock.yaml then installs the right tree.
RUN corepack enable \
 && corepack prepare pnpm@12.3.4 --activate \
 && pnpm --version

WORKDIR /app

# ─── Stage: Builder ───────────────────────────────────────────────────────────
FROM base AS builder

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/

# Cache mount for the pnpm store — never bake it into an image layer (Hard Rule #3).
# --store-dir aligns the install path with the cache mount target.
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir /pnpm/store

# 1. Copiar esquema, config, scripts y código fuente
COPY backend/prisma ./backend/prisma
COPY backend/scripts ./backend/scripts
COPY backend/prisma.config.ts backend/tsconfig*.json backend/nest-cli.json ./backend/
COPY backend/src ./backend/src

# 2. Generar cliente Prisma (escribe en src/generated/prisma) y compilar backend
RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend run build

# 3. Resolver dependencias de producción usando la caché del store
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm deploy --filter=backend --prod /prod/backend --store-dir /pnpm/store

# ─── Stage: Runner (Producción) ───────────────────────────────────────────────
FROM node:22-alpine AS runner

# Chromium para Puppeteer (conversión HTML → PDF)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Prod node_modules from pnpm deploy — no pnpm needed at runtime
COPY --chown=node:node --from=builder /prod/backend/node_modules ./backend/node_modules
COPY --chown=node:node --from=builder /prod/backend/package.json  ./backend/package.json
# Build artifacts
COPY --chown=node:node --from=builder /app/backend/dist           ./backend/dist
COPY --chown=node:node --from=builder /app/backend/prisma         ./backend/prisma
COPY --chown=node:node --from=builder /app/backend/src/generated  ./backend/src/generated
COPY --chown=node:node --from=builder /app/backend/src/infrastructure/pdf/assets ./backend/src/infrastructure/pdf/assets
COPY --chown=node:node --from=builder /app/backend/prisma.config.ts ./backend/prisma.config.ts

WORKDIR /app/backend

USER node
EXPOSE 3000

# Image-level healthcheck. compose.yaml may still override per-service with a richer
# probe (e.g. cert-aware fetch). Hard Rule: every runner stage ships one.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD wget -qO- http://127.0.0.1:3000/api/v1/health/pdf >/dev/null 2>&1 || exit 1

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/src/main.js"]
