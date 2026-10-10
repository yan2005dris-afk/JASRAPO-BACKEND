# syntax=docker/dockerfile:1

# ─── Stage: Base ──────────────────────────────────────────────────────────────
# Hard Rule #2 (pnpm-containerization): pin Node via the pnpm runtime, not the
# base image. The official `ghcr.io/pnpm/pnpm:12` base bundles pnpm 12.x and
# is based on `debian:stable-slim` (glibc). We install Node 26 with
# `pnpm runtime set node 26 -g` so the project owns the Node version.
#
# Why pnpm:12 for BOTH the builder and the runner (the part the skill text
# doesn't spell out): native modules installed by `pnpm install` in the builder
# (sharp, bcrypt, argon2, etc.) are linked against the builder's libc. The
# runtime stage must use the SAME libc or those modules fail to load with
# "Could not load the 'sharp' module using the linuxmusl-x64 runtime" (or
# equivalent). glibc builder + glibc runtime works; glibc builder + musl
# runtime does not.
FROM ghcr.io/pnpm/pnpm:12 AS base

# Install Node 26 into pnpm's managed runtime. The pnpm-lock.yaml is the source
# of truth for installed deps, so the pnpm version that ships in the base
# (currently 12.9.1) is fine; --frozen-lockfile reads the lockfile as-is.
RUN pnpm runtime set node 26 -g \
 && pnpm --version \
 && node --version

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PNPM_CONFIG_PACKAGE_IMPORT_METHOD=copy
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
# Puppeteer >=19 renamed PUPPETEER_SKIP_CHROMIUM_DOWNLOAD to PUPPETEER_SKIP_DOWNLOAD.
# The lockfile pins puppeteer@25.1.0; we set both for forward/backward compat.
# The runtime stage installs system Chromium
# (PUPPETEER_EXECUTABLE_PATH=/usr/lib/chromium/chromium) so the bundled Chrome
# from puppeteer's postinstall is dead weight anyway. We point at the ELF
# binary in /usr/lib, not /usr/bin/chromium — the latter is a Debian wrapper
# shell script that Puppeteer 25 rejects with
# "Browser was not found at the configured executable/path".
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

# ─── Stage: Builder ───────────────────────────────────────────────────────────
FROM base AS builder

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json ./backend/

# Hard Rule #3: store in a BuildKit cache mount. The mount lives at
# /var/cache/pnpm — NOT /pnpm/store (that path is owned by pnpm's managed
# runtime; mounting a cache over it would mask the node binary during the
# RUN, per the pnpm Docker docs).
RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    pnpm install --frozen-lockfile --store-dir /var/cache/pnpm

# 1. Copiar esquema, config, scripts y código fuente
COPY backend/prisma ./backend/prisma
COPY backend/scripts ./backend/scripts
COPY backend/prisma.config.ts backend/tsconfig*.json backend/nest-cli.json ./backend/
COPY backend/src ./backend/src

# 2. Generar cliente Prisma (escribe en src/generated/prisma) y compilar backend
RUN pnpm --filter backend exec prisma generate
RUN pnpm --filter backend run build

# 3. Resolver dependencias de producción usando la caché del store
RUN --mount=type=cache,id=pnpm,target=/var/cache/pnpm \
    pnpm deploy --filter=backend --prod /prod/backend --store-dir /var/cache/pnpm

# ─── Stage: Runner (Producción) ───────────────────────────────────────────────
# Same libc (debian 13 / glibc) as the builder — native modules built during
# `pnpm install` (sharp, bcrypt, etc.) load in the runtime. Switching the
# runtime to a different libc would break them at load time with errors like
# "Could not load the 'sharp' module using the linuxmusl-x64 runtime".
#
# We use `node:26-slim` instead of `ghcr.io/pnpm/pnpm:12` here because the
# pnpm:12 runtime's node binary is a pnpm-managed shim that requires root
# to resolve, so it can't be invoked by a non-root `node` user. node:26-slim
# is also debian-slim (matching pnpm:12's libc) and ships a `node` user
# with UID 1000 already configured.
FROM node:26-slim AS runner

# Chromium + dependencies for Puppeteer (HTML → PDF rendering). These are
# debian package names; in alpine they'd be apk. The full set is what the
# upstream `puppeteer` README recommends for headless Chrome on Linux.
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      chromium \
      fonts-liberation \
      libnss3 \
      libnspr4 \
      libatk1.0-0 \
      libatk-bridge2.0-0 \
      libcups2 \
      libdrm2 \
      libxkbcommon0 \
      libxcomposite1 \
      libxdamage1 \
      libxfixes3 \
      libxrandr2 \
      libgbm1 \
      libasound2 \
      ca-certificates \
 && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/lib/chromium/chromium

WORKDIR /app

# Prod node_modules from pnpm deploy — no pnpm needed at runtime.
# Using --chown=node:node directly avoids the slow recursive `RUN chown -R` layer.
COPY --chown=node:node --from=builder /prod/backend/node_modules ./backend/node_modules
COPY --chown=node:node --from=builder /prod/backend/package.json  ./backend/package.json
COPY --chown=node:node --from=builder /app/backend/dist           ./backend/dist
COPY --chown=node:node --from=builder /app/backend/prisma         ./backend/prisma
COPY --chown=node:node --from=builder /app/backend/src/generated  ./backend/src/generated
COPY --chown=node:node --from=builder /app/backend/src/infrastructure/pdf/assets ./backend/src/infrastructure/pdf/assets
COPY --chown=node:node --from=builder /app/backend/prisma.config.ts ./backend/prisma.config.ts

WORKDIR /app/backend

USER node
EXPOSE 3000

# Image-level healthcheck. Parses the response body — the endpoint returns
# HTTP 200 even when the Puppeteer browser failed to launch (body reports
# `status: "unhealthy", browser.connected: false`), so a wget that only
# checks HTTP status would let a wedged browser through. compose.yaml may
# still override per-service with a richer probe (e.g. cert-aware fetch).
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3000/api/v1/health/pdf').then(r=>r.json()).then(j=>process.exit(j.status==='healthy'&&j.browser&&j.browser.connected===true?0:1)).catch(()=>process.exit(1))"

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/src/main.js"]
