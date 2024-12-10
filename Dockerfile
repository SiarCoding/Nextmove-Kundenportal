# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install necessary build tools
RUN apk add --no-cache python3 make g++

# Copy package files
COPY app/package*.json ./
COPY app/client/package*.json ./client/

# Install dependencies
RUN npm ci
RUN cd client && npm ci

# Copy application files
COPY app/. .

# Create necessary directories
RUN mkdir -p dist/public uploads node_modules/.vite && \
    chown -R node:node /app

# Set ownership
RUN chown -R node:node /app

# Switch to node user
USER node

# Build client first
RUN cd client && npm run build

# Then build server
RUN npm run build:server

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE 10000

# Start the application
CMD ["node", "dist/index.js"]
