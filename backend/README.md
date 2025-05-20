# Globetrotter Socket.IO Server

This is the standalone Socket.IO server for the Globetrotter multiplayer game functionality, built with TypeScript and optimized for Bun.

## Setup

1. Install dependencies:
   ```bash
   cd backend
   bun install
   ```

2. Configure environment variables:
   ```bash
   # Copy the example file
   cp env.example .env
   
   # Edit with your settings
   nano .env
   ```

3. Start the server:
   ```bash
   # Development mode with hot reload
   bun dev
   
   # Build TypeScript to JavaScript
   bun build
   
   # Production mode
   bun start
   ```

## Environment Variables

- `SOCKET_PORT`: The port on which the Socket.IO server will run (default: 4000)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS (default: '*')
- `DATABASE_URL`: Connection string for the PostgreSQL database

## TypeScript Development

The codebase is written in TypeScript for improved developer experience and type safety. Some key features:

- Strong typing for Socket.IO events and data structures
- Type definitions for game data models
- Type-safe database access using Prisma client

## Deploying

### Docker

You can use Docker to deploy the Socket.IO server:

```bash
# Build the Docker image
docker build -t globetrotter-socket .

# Run the container
docker run -p 4000:4000 --env-file .env globetrotter-socket
```

### Cloud Platforms

The Socket.IO server can be deployed to various cloud platforms:

#### Railway

Deploy directly from GitHub:

1. Connect your GitHub repository
2. Set environment variables
3. Deploy

#### Fly.io

```bash
# Install Fly CLI if needed
curl -L https://fly.io/install.sh | sh

# Log in to Fly
fly auth login

# Launch the app
fly launch

# Set secrets
fly secrets set DATABASE_URL="your-database-url"
```

#### Render

1. Create a new Web Service
2. Connect your GitHub repository
3. Set the build command: `cd backend && bun install && bun build`
4. Set the start command: `cd backend && bun start`
5. Add environment variables

## Client Configuration

After deploying the Socket.IO server, update the frontend to point to the deployed URL:

```
# In your Next.js app .env file
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server-url
``` 