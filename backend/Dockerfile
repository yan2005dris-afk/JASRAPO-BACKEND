# ─── Base Stage ─────────────────────────────────────────────
FROM node:22-slim AS base
WORKDIR /app

# ─── Builder Stage ───────────────────────────────────────────
FROM base AS builder
# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy pre-installed node_modules from the host (allowed via updated .dockerignore)
COPY node_modules ./node_modules
# Copy all source files
COPY . .
# Generate prisma client and compile the NestJS project
RUN npx prisma generate && npm run build

# ─── Production Stage ────────────────────────────────────────
FROM base AS production
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma.config.ts ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

EXPOSE ${PORT:-3000}
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
