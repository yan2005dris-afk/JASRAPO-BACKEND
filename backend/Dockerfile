# ─── Stage 1: Base ─────────────────────────────────────────────
FROM node:22-alpine AS base
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./

# ─── Stage 2: Dependencies ────────────────────────────────────
FROM base AS deps
RUN pnpm install --no-frozen-lockfile

# ─── Stage 3: Production ──────────────────────────────────────
FROM node:22-alpine AS production
WORKDIR /app
RUN npm install -g pnpm
ENV NODE_ENV=production

# Only production dependencies
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --prod --no-frozen-lockfile

# Copy source code
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client and build
RUN pnpm run prisma:generate
RUN pnpm run build

EXPOSE ${PORT:-3000}
CMD ["sh", "-c", "pnpm dlx prisma migrate deploy && node dist/src/main.js"]
