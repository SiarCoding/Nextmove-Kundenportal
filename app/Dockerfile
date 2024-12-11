FROM node:18-alpine

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci
RUN cd client && npm install

# Copy all source files
COPY . .

# Build client and server
RUN cd client && npm run build
RUN npm run build:server

# Create directories and copy files
RUN mkdir -p dist/client && \
    cp -r client/dist/client/* dist/client/ && \
    cp -r client/public/* dist/client/ && \
    mkdir -p dist/client/uploads && \
    chown -R node:node /app

# Switch to non-root user
USER node

# Expose port
EXPOSE 10000

# Start the application
CMD ["node", "dist/index.js"]
