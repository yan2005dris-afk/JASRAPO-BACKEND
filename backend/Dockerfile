# ─── Stage: Base ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS base

# Instalar dependencias críticas para Prisma y herramientas de build
RUN apk add --no-cache openssl libc6-compat

# Configuración de pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PNPM_CONFIG_PACKAGE_IMPORT_METHOD=copy
RUN corepack enable && corepack prepare pnpm@11.1.1 --activate

WORKDIR /app

# ─── Stage: Builder ───────────────────────────────────────────────────────────
FROM base AS builder

# Copiar archivos de configuración del monorepo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# Copiar manifiestos de los subproyectos
COPY backend/package.json ./backend/

# Instalación de dependencias
RUN pnpm install --frozen-lockfile

# Copiar el resto del código fuente
COPY backend/ ./backend/

# Evitar que Prisma genere el cliente automáticamente en postinstall (lo haremos manual)
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=true

# Generar cliente de Prisma y compilar desde el root del workspace
RUN pnpm --filter backend exec prisma generate && pnpm --filter backend run build

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

# Puppeteer usa el Chromium del sistema en Docker (no descarga el suyo)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Copiar configuración del monorepo
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
# Copiar manifiesto del subproyecto
COPY backend/package.json ./backend/

# Instalar dependencias de Node (pnpm viene del stage base via corepack)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && pnpm install --prod --frozen-lockfile

# Copiar artefactos del backend desde la etapa builder
COPY --chown=node:node --from=builder /app/backend/dist ./backend/dist
COPY --chown=node:node --from=builder /app/backend/package.json ./backend/package.json
COPY --chown=node:node --from=builder /app/backend/prisma ./backend/prisma
COPY --chown=node:node --from=builder /app/backend/src/generated ./backend/src/generated
COPY --chown=node:node --from=builder /app/backend/prisma.config.ts ./backend/prisma.config.ts

# Asegurar permisos para el usuario node
RUN chown -R node:node /app

WORKDIR /app/backend

# Seguridad: No correr como root
USER node
EXPOSE 3000

# Arrancar migraciones y servidor
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/src/main.js"]

