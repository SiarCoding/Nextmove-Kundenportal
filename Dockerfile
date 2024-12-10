# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY app/package*.json ./app/
COPY app/client/package*.json ./app/client/

# Install dependencies
RUN npm ci
RUN cd app && npm ci
RUN cd app/client && npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN cd app && npm run build

# Expose the port
EXPOSE 10000

# Start the application
CMD ["npm", "--prefix", "app", "start"]
