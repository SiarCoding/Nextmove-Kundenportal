# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY app/package*.json ./
COPY app/client/package*.json ./client/
COPY app/server/package*.json ./server/

# Install necessary build tools
RUN apk add --no-cache python3 make g++

# Install dependencies
RUN npm ci
RUN cd client && npm ci
RUN cd server && npm ci

# Copy the rest of the application
COPY app .

# Install tsx globally
RUN npm install -g tsx

# Create necessary directories and set ownership
RUN mkdir -p dist/public uploads node_modules/.vite && \
    chown -R node:node /app

# Copy environment files
COPY app/.env* ./
COPY app/client/.env* ./client/
COPY app/. .

# Set ownership
RUN chown -R node:node /app

# Switch to node user
USER node

# Build the client and server
RUN cd client && npm ci && npm run build && \
    mkdir -p ../dist/public && \
    cp -r dist/* ../dist/public/ && \
    cd .. && npm run build:server

# Expose the port
EXPOSE 10000

# Set production environment
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
