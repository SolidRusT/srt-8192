# Build stage
FROM node:22-alpine AS builder

# Add build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:22-alpine

# Install runtime dependencies
RUN apk add --no-cache curl

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Environment variables
ENV NODE_ENV=production \
    PORT=8080 \
    HEALTH_CHECK_INTERVAL=30s \
    HEALTH_CHECK_TIMEOUT=5s

# Health check
HEALTHCHECK --interval=${HEALTH_CHECK_INTERVAL} --timeout=${HEALTH_CHECK_TIMEOUT} \
    CMD curl -f http://localhost:${PORT}/health || exit 1

EXPOSE ${PORT}

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]