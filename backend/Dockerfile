# ---- Stage 1: Build ----
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ---- Stage 2: Production ----
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 fastify

# Copy package files and install production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built output from builder
COPY --from=builder /app/dist ./dist

# Switch to non-root user
USER fastify

EXPOSE 3001

CMD ["node", "dist/server.js"]
