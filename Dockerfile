# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY app/package*.json ./
COPY app/client/package*.json ./client/

# Install necessary build tools
RUN apk add --no-cache python3 make g++

# Install root dependencies
RUN npm ci

# Install client dependencies
RUN cd client && npm ci

# Create necessary directories
RUN mkdir -p dist/public uploads node_modules/.vite && \
    chown -R node:node /app

# Copy application files
COPY app/. .

# Set ownership
RUN chown -R node:node /app

# Switch to node user
USER node

# Build client and server
RUN cd client && npm run build && \
    cd .. && npm run build:server

# Set production environment
ENV NODE_ENV=production

# Expose port
EXPOSE 10000

# Start the application
CMD ["npm", "start"]
