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

# Build client
RUN cd client && npm run build

# Build server
RUN npm run build:server

# Set up directories and files
RUN mkdir -p dist/client/uploads && \
    # First, copy the public files
    cp -r client/public/* dist/client/ && \
    # Then, copy the built files (this might overwrite some public files if needed)
    cp -r client/dist/client/* dist/client/ && \
    # Ensure proper permissions
    chown -R node:node /app && \
    # Verify the contents
    echo "Verifying files in dist/client:" && \
    ls -la dist/client/

# Switch to non-root user
USER node

# Expose port
EXPOSE 10000

# Start the application
CMD ["node", "dist/index.js"]
