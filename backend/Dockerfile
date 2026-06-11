# ─── Stage: Base ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS base

# Configuración de pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# ─── Stage: Dependencies ──────────────────────────────────────────────────────
FROM base AS dependencies

# Copiar archivos de definición de dependencias
# Se asume que el contexto de build es la carpeta 'backend/'
COPY package.json pnpm-lock.yaml ./

# Instalación de dependencias usando caché del store para optimizar builds futuros
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ─── Stage: Builder ───────────────────────────────────────────────────────────
FROM base AS builder

# Copiar el código fuente y las dependencias instaladas
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules

# Generar cliente de Prisma y compilar el proyecto
RUN pnpm prisma:generate && pnpm build

# Limpiar dependencias de desarrollo para reducir el tamaño de la imagen final
RUN pnpm prune --prod

# ─── Stage: Runner ────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Copiar artefactos necesarios desde el builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
# Copiar archivos de generación de prisma si son necesarios en runtime
COPY --from=builder /app/src/generated ./src/generated
# Copiar configuración adicional si existe
COPY --from=builder /app/prisma.config.ts ./ 2>/dev/null || true

# Ejecutar como usuario no root por seguridad
USER node

EXPOSE 3000

# Ejecutar migraciones y arrancar la aplicación
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
