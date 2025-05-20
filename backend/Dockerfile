FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including devDependencies for TypeScript compilation
RUN npm install

# Copy application code and configuration files
COPY tsconfig.json .
COPY src/ ./src/

# Build TypeScript to JavaScript
RUN npm run build

# Clean up dev dependencies to reduce image size
RUN npm prune --production

# Set environment variables
ENV NODE_ENV=production

# Expose the Socket.IO port
EXPOSE 4000

# Start the server
CMD ["node", "dist/socket-server.js"] 