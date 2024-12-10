FROM node:18-alpine

WORKDIR /app

# Install development dependencies and tsx globally
COPY package*.json ./
RUN npm ci && npm install -g tsx

# Create necessary directories and set permissions
RUN mkdir -p dist/public uploads node_modules/.vite && \
    chown -R node:node /app

# Copy environment files first
COPY .env* ./
COPY client/.env* ./client/

# Copy application files
COPY . .
RUN chown -R node:node /app

# Switch to node user for security
USER node

# Expose the application port
EXPOSE 5000

# Start the development server
CMD ["npm", "run", "dev"]
