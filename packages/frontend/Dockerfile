FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json ./
COPY packages/frontend/package.json packages/frontend/package.json
RUN npm install

FROM deps AS build
COPY tsconfig.base.json ./
COPY packages/frontend packages/frontend
RUN npm run --workspace @workspace/frontend build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/packages/frontend/dist ./packages/frontend/dist
COPY packages/frontend/package.json ./packages/frontend/package.json
EXPOSE 4000
CMD ["npm", "run", "--workspace", "@workspace/frontend", "start"]
