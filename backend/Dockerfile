FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including devDependencies for TypeScript compilation
RUN npm install

# Copy application code and configuration files
COPY tsconfig.json .
COPY src/ ./src/
COPY prisma/ ./prisma/

# Build TypeScript to JavaScript
RUN npm run build

# Clean up dev dependencies to reduce image size
RUN npm prune --production

# Set environment variables
ENV NODE_ENV=production

# Railway automatically sets PORT env variable, make sure we expose that port
# Default to 4000 for local development
ENV PORT=4000
EXPOSE $PORT

# Start the server
CMD ["node", "dist/socket-server.js"] 