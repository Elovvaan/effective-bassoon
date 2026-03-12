# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY tsconfig.base.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY packages/types/package.json packages/types/package.json

RUN npm install

COPY apps/backend apps/backend
COPY packages/types packages/types

RUN npm run --workspace @packages/types build \
  && npm run --workspace @apps/backend prisma:generate \
  && npm run --workspace @apps/backend build \
  && npm prune --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/types/package.json ./packages/types/package.json

WORKDIR /app/apps/backend
EXPOSE 3000

CMD ["node", "dist/main.js"]
