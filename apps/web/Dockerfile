# Base Node.js image
FROM node:18-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Development stage
FROM base AS development
ENV NODE_ENV=development
COPY ./apps/web/package*.json ./
RUN npm install
COPY ./apps/web ./
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Dependencies stage
FROM base AS deps
COPY ./apps/web/package*.json ./
RUN npm ci

# Build stage
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY ./apps/web ./
RUN npm run build

# Production stage
FROM base AS production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
