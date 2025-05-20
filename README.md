# 🧩 Globetrotter - The Ultimate Travel Guessing Game

Globetrotter is a fun and engaging full-stack web application where users get cryptic clues about famous places around the world and must guess which destination they refer to. Upon guessing, users unlock fun facts, trivia, and surprises about each destination!

## 🔹 Features

- **Rich Dataset**: 100+ destinations with cryptic clues, fun facts, and trivia
- **Interactive Gameplay**: Users receive clues and select from multiple possible destinations
- **Real-time Feedback**: 
  - 🎉 Correct Answer: Animate confetti + reveal a fun fact
  - 😢 Incorrect Answer: Show a sad-face animation + reveal a fun fact
- **Score Tracking**: Track correct and incorrect answers with a total score
- **"Challenge a Friend" Feature**: Generate shareable challenge links to compete with friends
- **User Profiles**: Create a unique username to save scores and track your progress
- **Mobile Responsive**: Fully optimized for mobile and desktop devices
- **Multiplayer Mode**: Play with friends in real-time via Socket.IO

## 🔹 Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: tRPC for type-safe API calls, Prisma ORM
- **Authentication**: NextAuth.js with Google provider
- **Database**: PostgreSQL
- **Styling**: TailwindCSS with custom animations and transitions
- **Real-time Communication**: Socket.IO for multiplayer functionality

## 🔹 Project Structure

The project consists of two main components:

1. **Next.js Application**: The main web application handling the UI, game logic, and database operations
2. **Socket.IO Server**: A standalone TypeScript server handling real-time multiplayer functionality

## 🔹 Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/bun
- PostgreSQL database

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd globetrotter
   ```

2. Install dependencies for both the Next.js app and Socket.IO server:
   ```bash
   # Install Next.js app dependencies
   bun install
   
   # Install Socket.IO server dependencies
   bun socket:install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory for the Next.js app:
   ```
   # Database URL
   DB_URL="postgresql://username:password@localhost:5432/globetrotter"
   
   # Next Auth
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Socket.IO settings
   SOCKET_URL="http://localhost:4000"
   NEXT_PUBLIC_SOCKET_URL="http://localhost:4000"
   ```

   Create a `.env` file in the `backend` directory for the Socket.IO server:
   ```bash
   # Copy the example env file
   cp backend/env.example backend/.env
   
   # Edit as needed
   nano backend/.env
   ```

4. Set up the database:
   ```bash
   # Run the database setup script
   ./start-database.sh
   
   # Run Prisma migrations
   bun db:migrate
   
   # Seed the database with destinations
   bun db:seed
   ```

5. Start both servers:
   
   **In one terminal (for Next.js app)**:
   ```bash
   bun dev
   ```

   **In another terminal (for Socket.IO server)**:
   ```bash
   bun socket:dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🔹 Game Rules

1. You'll be presented with 1-2 cryptic clues about a famous destination.
2. Choose from multiple options to guess the correct destination.
3. Receive immediate feedback after answering:
   - Correct answer: See confetti animation and learn a fun fact
   - Incorrect answer: See a sad face and still learn something new
4. Track your score and challenge friends to beat it!

## 🔹 Multiplayer Mode

The multiplayer functionality is powered by a standalone Socket.IO server that can be hosted separately from the main application.

### Deploying the Socket.IO Server

See the [Socket.IO server README](backend/README.md) for detailed deployment instructions.

Quick deployment options:

1. **Manual Deployment**:
   ```bash
   cd backend
   bun build
   bun start
   ```

2. **Docker**:
   ```bash
   cd backend
   docker build -t globerotter-socket .
   docker run -p 4000:4000 --env-file .env globerotter-socket
   ```

3. **Update your frontend settings**:
   ```
   # In your frontend .env
   NEXT_PUBLIC_SOCKET_URL="http://your-socket-server-domain:4000"
   ```

## 🔹 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔹 Acknowledgements

- Images sourced from Unsplash
- Travel facts verified from multiple trusted sources
- Built with ❤️ for travelers and geography enthusiasts everywhere
