# syntax=docker/dockerfile:1

# ─── Stage: Base ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS base

RUN apk add --no-cache openssl libc6-compat

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PNPM_CONFIG_PACKAGE_IMPORT_METHOD=copy
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true
# Prevent Puppeteer from downloading Chrome in the builder stage (it runs postinstall)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN corepack enable && corepack prepare pnpm@11.22.0 --activate

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
# --legacy: pnpm v10+ requires inject-workspace-packages by default; legacy restores previous behavior
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm deploy --filter=backend --prod --legacy /prod/backend

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

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/src/main.js"]
