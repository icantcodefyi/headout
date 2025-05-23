FROM node:20-slim AS builder

WORKDIR /app

# Install OpenSSL - required by Prisma
RUN apt-get update -y && apt-get install -y openssl

# Copy package.json and package-lock.json/yarn.lock
COPY package*.json ./

# Copy prisma schema first (before npm install)
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate Prisma client explicitly after schema is available
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim AS production

WORKDIR /app

# Install OpenSSL - required by Prisma
RUN apt-get update -y && apt-get install -y openssl

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy prisma schema first (before npm install)
COPY prisma ./prisma/

# Install only production dependencies
RUN npm install --omit=dev

# Copy Prisma client generated files
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy built application
COPY --from=builder /app/dist ./dist

# Expose the Socket.IO port
EXPOSE 4000

# Start the server
CMD ["node", "dist/socket-server.js"]