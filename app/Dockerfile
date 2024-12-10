FROM node:18-alpine

WORKDIR /app

# Install necessary build tools
RUN apk add --no-cache python3 make g++

# Copy package files first for better caching
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci
RUN cd client && npm ci

# Copy all source files
COPY . .

# Build the client first
RUN cd client && npm run build

# Build the server
RUN npm run build:server

# Create necessary directories and set permissions
RUN mkdir -p uploads && \
    chown -R node:node /app

# Switch to node user
USER node

# Expose port
EXPOSE 10000

# Start the production server
CMD ["node", "dist/index.js"]
