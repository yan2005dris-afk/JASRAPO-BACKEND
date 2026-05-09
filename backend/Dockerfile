# ─── Stage 1: Base ─────────────────────────────────────────────
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./

# ─── Stage 2: Dependencies ────────────────────────────────────
FROM base AS deps
RUN npm ci

# ─── Stage 3: Production ──────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Only production dependencies
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
RUN npm ci --omit=dev

# Copy source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client and build
RUN npm run prisma:generate
RUN npm run build

EXPOSE ${PORT:-3000}
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
