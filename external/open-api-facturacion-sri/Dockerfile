# =================================================
# Multi-stage Dockerfile for Open API Facturación SRI (NestJS)
# =================================================

# -----------------------------
# Stage 1: Build
# -----------------------------
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Hard Rule #3 (adapted to npm): keep the npm cache in a BuildKit cache mount.
# Without a lockfile we can't use `npm ci`, so keep `npm install` but pull the
# cache so repeated builds don't redownload the whole registry.
RUN --mount=type=cache,target=/root/.npm \
    npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies after build
RUN npm prune --production

# -----------------------------
# Stage 2: Production
# -----------------------------
FROM node:22-alpine AS production

# Set environment to production
ENV NODE_ENV=production
ENV TZ=America/Guayaquil

# Install tzdata for timezone support
RUN apk add --no-cache tzdata

# Set working directory
WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./

# Copy production dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/dist ./dist

# Create directories for volumes
RUN mkdir -p /data/templates /data/pdfs /data/certs /data/xmls \
    /data/pdfs/con_firma /data/pdfs/others /data/pdfs/documents /data/pdfs/images

# Expose the application port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/status || exit 1

# Run as non-root (Hard Rule: every runner stage drops to an unprivileged UID).
# node:22-alpine ships the `node` user; chown both /app (where the code lives) and
# /data/* (where the app writes PDFs/XMLs/certs) so USER node can actually work.
RUN chown -R node:node /app /data
USER node

# Start the application
CMD ["node", "dist/main"]
