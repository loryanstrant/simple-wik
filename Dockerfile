# Multi-stage build for smaller image size
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first
COPY package.json ./
COPY client/package.json ./client/

# Install dependencies (will generate lock files if missing)
RUN npm install --production && \
    cd client && npm install --production

# Copy the rest of the source code
COPY . .

# Build client
RUN cd client && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install dumb-init and wget for health checks
RUN apk add --no-cache dumb-init wget

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/client/dist ./client/dist
COPY --from=builder --chown=nodejs:nodejs /app/server ./server
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Create data directory with proper permissions
RUN mkdir -p /app/data && \
    chown -R nodejs:nodejs /app/data

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start application with signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server/index.js"]
