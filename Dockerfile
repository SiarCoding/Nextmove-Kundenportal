# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install necessary build tools
RUN apk add --no-cache python3 make g++

# Copy package files
COPY app/package*.json ./
COPY app/client/package*.json ./client/
COPY app/server/package*.json ./server/

# Install dependencies
RUN npm ci
RUN cd client && npm ci
RUN cd server && npm ci

# Copy the rest of the application
COPY app .

# Build the client
RUN cd client && npm run build

# Build the server
RUN npm run build:server

# Expose the port
EXPOSE 10000

# Set production environment
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
