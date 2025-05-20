# Globerotter Socket.IO Server

This is the standalone Socket.IO server for the Globerotter multiplayer game functionality, built with TypeScript.

## Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   # or
   yarn install
   # or
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
   npm run dev
   # or
   yarn dev
   # or
   bun dev
   
   # Build TypeScript to JavaScript
   npm run build
   # or
   yarn build
   # or
   bun build
   
   # Production mode
   npm start
   # or
   yarn start
   # or
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
docker build -t globerotter-socket .
docker run -p 4000:4000 --env-file .env globerotter-socket
```

### Cloud Platforms

The Socket.IO server can be deployed to various cloud platforms:

#### Heroku

```bash
heroku create
heroku config:set DATABASE_URL=your-database-url
git push heroku main
```

#### Railway

Deploy directly from GitHub:

1. Connect your GitHub repository
2. Set environment variables
3. Deploy

## Client Configuration

After deploying the Socket.IO server, update the frontend to point to the deployed URL:

```
# In your Next.js app .env file
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server-url
``` 