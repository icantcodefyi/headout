FROM node:18-bullseye

WORKDIR /app

# Install OpenSSL dependencies for Prisma
RUN apt-get update && apt-get install -y openssl libssl-dev

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:${PATH}"

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN npm run build

# Generate Prisma client
RUN npm run postinstall

# Set production environment
ENV NODE_ENV=production

# Start the application
CMD ["npm", "run", "start"] 