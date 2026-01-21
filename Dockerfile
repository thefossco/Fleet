# Multi-stage Dockerfile for Next.js frontend and Express backend

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure public directory exists
RUN mkdir -p ./public

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/server ./server
COPY --from=builder /app/package.json ./package.json

USER root
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
EXPOSE 3001

ENV PORT=3001

# Create startup script that runs both Next.js and Express API
RUN echo '#!/bin/sh\nset -e\necho "Running Prisma migrations..."\nnpx prisma migrate deploy || npx prisma db push\necho "Starting Express API server..."\nnpx tsx server/index.ts &\necho "Starting Next.js server..."\nnode server.js' > /app/start.sh && chmod +x /app/start.sh

CMD ["/bin/sh", "/app/start.sh"]
