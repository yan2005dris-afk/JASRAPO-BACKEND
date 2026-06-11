# ─── Stage: Base ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS base

# Instalar dependencias críticas para Prisma y herramientas de build
RUN apk add --no-cache openssl libc6-compat

# Configuración de pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
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
FROM base AS runner

# Copiar node_modules raíz y del backend (pnpm usa symlinks
# desde /app/node_modules/.pnpm/ hacia los paquetes individuales)
COPY --chown=node:node --from=builder /app/node_modules /app/node_modules
COPY --chown=node:node --from=builder /app/backend/node_modules /app/backend/node_modules
COPY --chown=node:node --from=builder /app/pnpm-lock.yaml /app/pnpm-lock.yaml
COPY --chown=node:node --from=builder /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml

WORKDIR /app/backend

# Copiar artefactos del backend
COPY --chown=node:node --from=builder /app/backend/dist ./dist
COPY --chown=node:node --from=builder /app/backend/package.json ./package.json
COPY --chown=node:node --from=builder /app/backend/prisma ./prisma
COPY --chown=node:node --from=builder /app/backend/src/generated ./src/generated
COPY --chown=node:node --from=builder /app/backend/prisma.config.ts ./prisma.config.ts

# Seguridad: No correr como root
USER node
EXPOSE 3000

# Arrancar migraciones y servidor
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/src/main.js"]
