# ─── Stage 1: Base ─────────────────────────────────────────────
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./

# ─── Stage 2: Dependencies ────────────────────────────────────
FROM base AS deps
RUN npm ci

# ─── Stage 3: Development (hot-reload) ────────────────────────
FROM base AS development
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# ─── Stage 4: Build ───────────────────────────────────────────
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ─── Stage 5: Production ──────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Only production dependencies
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json
RUN npm ci --omit=dev

# Copy built app + prisma generated client + schema (for migrations)
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generated ./src/generated
COPY --from=build /app/prisma ./prisma
# Necesario para que Prisma encuentre el schema en prisma/schema/ (no el default schema.prisma)
COPY --from=build /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000
# Ejecuta las migraciones pendientes, siembra la base de datos (seeds) y luego inicia el servidor
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/src/main"]
