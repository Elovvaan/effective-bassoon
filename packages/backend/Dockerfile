FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
COPY packages/backend/package.json packages/backend/package.json
RUN npm install

FROM deps AS build
COPY tsconfig.base.json ./
COPY packages/backend packages/backend
RUN npm run --workspace @workspace/backend build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/packages/backend/dist ./packages/backend/dist
COPY packages/backend/package.json ./packages/backend/package.json
EXPOSE 3000
CMD ["npm", "run", "--workspace", "@workspace/backend", "start"]
