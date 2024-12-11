# Build stage
FROM node:18-alpine as builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci
RUN cd client && npm ci

# Copy source files
COPY . .

# Build client and server
RUN cd client && npm run build
RUN npm run build:server

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
COPY client/package*.json ./client/

RUN npm ci --only=production
RUN cd client && npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist/client ./client/dist/client
COPY --from=builder /app/client/public ./client/public

# Ensure all directories exist with correct permissions
RUN mkdir -p uploads && \
    mkdir -p client/dist/client && \
    mkdir -p client/public && \
    chown -R node:node /app

# Create volume for uploads
VOLUME /app/uploads

# Switch to node user for security
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:10000/api/health || exit 1

# Set Node environment
ENV NODE_ENV=production \
    PORT=10000

# Expose port
EXPOSE 10000

# Start the application
CMD ["node", "dist/index.js"]