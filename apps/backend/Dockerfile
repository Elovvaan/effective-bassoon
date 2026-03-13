# syntax=docker/dockerfile:1

###############################################
# 1. Dependencies Stage
###############################################
FROM node:18-alpine AS deps
WORKDIR /app

# Install OS deps for Prisma
RUN apk add --no-cache openssl

# Copy root + workspace package files
COPY package.json package-lock.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/types/package.json packages/types/package.json

# Install dependencies
RUN npm ci


###############################################
# 2. Build Stage
###############################################
FROM node:18-alpine AS builder
WORKDIR /app

# Install OS deps for Prisma
RUN apk add --no-cache openssl

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy monorepo files
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/backend ./apps/backend
COPY packages/types ./packages/types

# Build shared types
RUN npm run --workspace @packages/types build

# Generate Prisma client
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Build backend (NestJS → dist/)
RUN npm run --workspace @apps/backend build

# Remove dev dependencies
RUN npm prune --omit=dev


###############################################
# 3. Runtime Stage
###############################################
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install OS deps for Prisma
RUN apk add --no-cache openssl

# Create non-root user
RUN addgroup -S nodejs && adduser -S nodeuser -G nodejs

# Copy runtime artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/packages/types/dist ./packages/types/dist

WORKDIR /app/apps/backend

USER nodeuser
EXPOSE 8080

CMD ["sh", "-c", "npx prisma migrate deploy --schema=prisma/schema.prisma && node dist/main.js"]
