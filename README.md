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

## 🔹 Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: tRPC for type-safe API calls, Prisma ORM
- **Authentication**: NextAuth.js with Google provider
- **Database**: PostgreSQL
- **Styling**: TailwindCSS with custom animations and transitions

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

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   # or
   bun install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:
   ```
   # Database URL
   DB_URL="postgresql://username:password@localhost:5432/globetrotter"
   
   # Next Auth
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. Set up the database:
   ```bash
   # Run the database setup script
   ./start-database.sh
   
   # Run Prisma migrations
   npx prisma migrate dev
   
   # Seed the database with destinations
   npx prisma db seed
   ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   bun dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🔹 Game Rules

1. You'll be presented with 1-2 cryptic clues about a famous destination.
2. Choose from multiple options to guess the correct destination.
3. Receive immediate feedback after answering:
   - Correct answer: See confetti animation and learn a fun fact
   - Incorrect answer: See a sad face and still learn something new
4. Track your score and challenge friends to beat it!

## 🔹 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔹 Acknowledgements

- Images sourced from Unsplash
- Travel facts verified from multiple trusted sources
- Built with ❤️ for travelers and geography enthusiasts everywhere
