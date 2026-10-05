# syntax=docker/dockerfile:1

# ─── Stage: Base ──────────────────────────────────────────────────────────────
# Hard Rule #2: pin Node via the pnpm runtime, not the base image.
# The official `ghcr.io/pnpm/pnpm:12` base bundles pnpm 12.x; we activate the exact
# `packageManager` version from package.json (pnpm@12.3.4) via corepack, then use
# `pnpm runtime set node 24 -g` so the project owns the Node version.
FROM ghcr.io/pnpm/pnpm:12 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PNPM_CONFIG_PACKAGE_IMPORT_METHOD=copy
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
# Prevent Puppeteer from downloading Chrome in the builder stage (it runs postinstall)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV SHELL=/bin/sh
ENV ENV=/root/.profile

# pnpm base is debian-slim; Prisma needs libssl at build time. ca-certificates for
# HTTPS to the registry. Keep this in `base` (not `builder`) so other builder stages
# inherit the deps without re-installing.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Pin Node 24 to the project. The pnpm:12 base ships pnpm 12.x (currently 12.9.1)
# but NOT node, corepack, or npm — we can't `corepack prepare` here. We use pnpm's
# own runtime to install Node 24 (Hard Rule #2: project owns the Node version).
# The pnpm-lock.yaml is the source of truth for installed deps (Hard Rule #6), so
# any pnpm 12.x with --frozen-lockfile produces the same tree.
RUN pnpm runtime set node 24 -g \
 && pnpm --version \
 && node --version

WORKDIR /app

# ─── Stage: Builder ───────────────────────────────────────────────────────────
FROM base AS builder

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/

# Cache persistente del store de pnpm (BuildKit)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

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
    pnpm deploy --filter=backend --prod /prod/backend

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
