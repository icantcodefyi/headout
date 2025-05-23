import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();
const prisma = new PrismaClient();
const SOCKET_PORT = parseInt(process.env.PORT || process.env.SOCKET_PORT || '4000', 10);


const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

interface GameRoom {
  id: string;
  players: Player[];
  currentDestination: DestinationData | null;
  options: AnswerOption[] | null;
  status: 'waiting' | 'playing' | 'completed';
  startTime?: number;
}

interface Player {
  id: string;
  socketId: string;
  username: string;
  isReady: boolean;
  isAdmin?: boolean;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  image?: string;
}

interface DestinationData {
  id: string;
  clues: string[];
}

interface AnswerOption {
  id: string;
  city: string;
  country: string;
}

interface Destination {
  id: string;
  city: string;
  country: string;
  clues: string[];
  funFacts: string[];
  trivia: string[];
  cdnImageUrl?: string;
}

interface AnswerResult {
  playerId: string;
  isCorrect: boolean;
  destination: Destination;
  fact: string;
}

// Active game rooms
const gameRooms = new Map<string, GameRoom>();

// Socket events validation schemas
const joinRoomSchema = z.object({
  roomId: z.string().optional(),
  playerId: z.string(),
  username: z.string(),
  userId: z.string().optional(),
  isAdmin: z.boolean().optional(),
  image: z.string().optional(),
});

const answerSchema = z.object({
  roomId: z.string(),
  playerId: z.string(),
  answerId: z.string(),
});

// Type for the join room data
type JoinRoomData = z.infer<typeof joinRoomSchema>;
// Type for the answer data
type AnswerData = z.infer<typeof answerSchema>;

// Prepare game helper function
async function prepareGame(io: SocketIOServer, room: GameRoom): Promise<boolean> {
  try {
    console.log(`Preparing game for room: ${room.id}`);
    
    // Set room status to playing
    room.status = 'playing';
    room.startTime = Date.now();
    
    // Fetch random destinations from the database
    console.log('Fetching destinations from database...');
    const destinations = await prisma.destination.findMany({
      select: {
        id: true,
        city: true,
        country: true,
        clues: true,
        funFacts: true,
        trivia: true,
        cdnImageUrl: true,
      },
      take: 4, // Get 4 random destinations
      orderBy: {
        // Use random ordering for better variety
        id: 'asc',
      },
    }) as Destination[];
    
    console.log(`Found ${destinations.length} destinations`);
    
    if (destinations.length < 4) {
      console.error('Not enough destinations in database');
      throw new Error('Not enough destinations in database');
    }
    
    // Select one random destination as the answer
    const randomIndex = Math.floor(Math.random() * destinations.length);
    const correctDestination = destinations[randomIndex];
    
    if (!correctDestination) {
      console.error('Failed to select destination');
      throw new Error('Failed to select destination');
    }
    
    console.log(`Selected destination: ${correctDestination.city}, ${correctDestination.country}`);
    
    // Create destination data with clues
    const destinationData: DestinationData = {
      id: correctDestination.id,
      clues: correctDestination.clues,
    };
    
    // Create options from all destinations
    const options: AnswerOption[] = destinations.map((dest: Destination) => ({
      id: dest.id,
      city: dest.city,
      country: dest.country,
    }));
    
    console.log('Options prepared:', options.map(o => `${o.city}, ${o.country}`).join(' | '));
    
    // Update room with new game data
    room.currentDestination = destinationData;
    room.options = options;
    
    console.log('Emitting game round to clients...');
    
    // Emit game round to all players in the room - send the full game data
    io.to(room.id).emit('game_round', {
      destination: destinationData,
      options,
    });
    
    // Also emit the updated room state
    io.to(room.id).emit('room_update', room);
    
    console.log('Game round prepared and sent to players in room', room.id);
    
    return true;
  } catch (error) {
    console.error('Error preparing game:', error);
    return false;
  }
}

// Initialize Socket.IO server
function startSocketServer(): SocketIOServer {
  // Create HTTP server for Socket.IO
  const server = createServer();
  
  // Initialize Socket.IO server
  const io = new SocketIOServer(server, {
    cors: {
      origin: ALLOWED_ORIGINS,
      methods: ['GET', 'POST'],
    },
  });
  
  // Socket.IO event handlers
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);
    
    // Create or join a game room
    socket.on('join_room', async (data: JoinRoomData) => {
      try {
        const { roomId, playerId, username, userId, isAdmin, image } = joinRoomSchema.parse(data);
        
        // Create new room or join existing
        let room: GameRoom;
        
        if (roomId && gameRooms.has(roomId)) {
          // Join existing room
          room = gameRooms.get(roomId)!;
          
          // Check if room is full (2 players max)
          if (room.players.length >= 2) {
            socket.emit('error', { message: 'Room is full' });
            return;
          }
          
          // Check if player already in room
          if (room.players.some((p: Player) => p.id === playerId)) {
            // Reconnect existing player
            const playerIndex = room.players.findIndex((p: Player) => p.id === playerId);
            if (playerIndex !== -1 && room.players[playerIndex]) {
              room.players[playerIndex].socketId = socket.id;
            }
            socket.join(roomId);
            
            // Emit room state
            io.to(roomId).emit('room_update', room);
            
            // Also emit the joined_room event so client knows it joined successfully
            socket.emit('joined_room', { roomId: room.id, playerId });
            return;
          }
          
          // Add new player to room
          const newPlayer: Player = {
            id: playerId,
            socketId: socket.id,
            username,
            isReady: false,
            score: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            image,
          };
          
          room.players.push(newPlayer);
          socket.join(roomId);
          
          // Remove the automatic game start when 2 players join
          // The game will only start when the admin explicitly calls next_question
          
        } else {
          // Create new room
          const newRoomId = roomId || `room_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
          
          room = {
            id: newRoomId,
            players: [
              {
                id: playerId,
                socketId: socket.id,
                username,
                isReady: false,
                isAdmin: isAdmin || true,
                score: 0,
                correctAnswers: 0,
                wrongAnswers: 0,
                image,
              },
            ],
            currentDestination: null,
            options: null,
            status: 'waiting',
          };
          
          gameRooms.set(newRoomId, room);
          socket.join(newRoomId);
        }
        
        // Emit room info back to clients
        io.to(room.id).emit('room_update', room);
        
        // Emit room ID to the client who joined
        socket.emit('joined_room', { roomId: room.id, playerId });
        
      } catch (error) {
        console.error('Join room error:', error);
        socket.emit('error', { message: 'Invalid request data' });
      }
    });
    
    // Player ready event
    socket.on('player_ready', ({ roomId, playerId }: { roomId: string; playerId: string }) => {
      const room = gameRooms.get(roomId);
      if (!room) return;
      
      const playerIndex = room.players.findIndex((p: Player) => p.id === playerId);
      if (playerIndex === -1) return;
      
      const player = room.players[playerIndex];
      if (!player) return;
      
      player.isReady = true;
      
      // Remove auto-start game logic
      // The game will only start when the admin explicitly calls next_question
      
      io.to(roomId).emit('room_update', room);
    });
    
    // Player submits an answer
    socket.on('submit_answer', async (data: AnswerData) => {
      try {
        const { roomId, playerId, answerId } = answerSchema.parse(data);
        
        const room = gameRooms.get(roomId);
        if (!room || !room.currentDestination) return;
        
        const playerIndex = room.players.findIndex((p: Player) => p.id === playerId);
        if (playerIndex === -1) return;
        
        const player = room.players[playerIndex];
        const destination = await prisma.destination.findUnique({
          where: { id: room.currentDestination.id },
          select: {
            id: true,
            city: true,
            country: true,
            funFacts: true,
            trivia: true,
            cdnImageUrl: true,
          },
        }) as Destination | null;
        
        if (!destination) return;
        
        // Check if the answer is correct
        const isCorrect = destination.id === answerId;
        
        // Update player score
        if (player) {
          player.score += isCorrect ? 10 : 0;
          player.correctAnswers += isCorrect ? 1 : 0;
          player.wrongAnswers += isCorrect ? 0 : 1;
        }
        
        // Select a random fun fact or trivia fact
        const facts = [...destination.funFacts, ...destination.trivia];
        const randomFact = facts.length > 0 
          ? facts[Math.floor(Math.random() * facts.length)]
          : "Interesting place to visit!";
        
        // Emit result to all players in the room
        const result: AnswerResult = {
          playerId,
          isCorrect,
          destination,
          fact: randomFact,
        };
        
        io.to(roomId).emit('answer_result', result);
        
        // If this is a multiplayer game, move to the next round
        if (room.players.length > 1) {
          setTimeout(() => {
            prepareGame(io, room);
          }, 3000);
        }
        
      } catch (error) {
        console.error('Submit answer error:', error);
        socket.emit('error', { message: 'Invalid answer data' });
      }
    });
    
    // Next question request
    socket.on('next_question', async ({ roomId }: { roomId: string }) => {
      console.log(`Next question requested for room: ${roomId}`);
      
      if (!roomId || !gameRooms.has(roomId)) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      const room = gameRooms.get(roomId)!;
      
      // Set room status to playing if it's not already
      if (room.status !== 'playing') {
        room.status = 'playing';
      }
      
      // Notify all clients of status change
      io.to(roomId).emit('room_update', room);
      
      // Prepare the game round
      await prepareGame(io, room);
    });
    
    // Player leaves the game
    socket.on('leave_room', ({ roomId, playerId }: { roomId: string; playerId: string }) => {
      const room = gameRooms.get(roomId);
      if (!room) return;
      
      const playerIndex = room.players.findIndex((p: Player) => p.id === playerId);
      if (playerIndex !== -1) {
        room.players.splice(playerIndex, 1);
        
        if (room.players.length === 0) {
          // Delete empty room
          gameRooms.delete(roomId);
        } else {
          // Notify remaining players
          io.to(roomId).emit('player_left', { playerId });
          io.to(roomId).emit('room_update', room);
        }
      }
      
      socket.leave(roomId);
    });
    
    // Handle disconnections
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      // Find rooms where this socket is a player
      gameRooms.forEach((room, roomId) => {
        const playerIndex = room.players.findIndex((p: Player) => p.socketId === socket.id);
        
        if (playerIndex !== -1) {
          // Mark player as disconnected but keep in room for reconnection
          const player = room.players[playerIndex];
          if (player) {
            io.to(roomId).emit('player_disconnected', { playerId: player.id });
          }
          
          // Set a timeout to remove the player if they don't reconnect
          setTimeout(() => {
            const currentRoom = gameRooms.get(roomId);
            if (currentRoom) {
              const player = currentRoom.players.find((p: Player) => p.socketId === socket.id);
              
              if (player) {
                // Remove player if they haven't reconnected
                currentRoom.players = currentRoom.players.filter((p: Player) => p.socketId !== socket.id);
                
                if (currentRoom.players.length === 0) {
                  // Delete empty room
                  gameRooms.delete(roomId);
                } else {
                  // Notify remaining players
                  io.to(roomId).emit('player_left', { playerId: player.id });
                  io.to(roomId).emit('room_update', currentRoom);
                }
              }
            }
          }, 30000); // 30 seconds timeout
        }
      });
    });
  });
  
  // Start the Socket.IO server
  server.listen(SOCKET_PORT, '0.0.0.0', () => {
    console.log(`\x1b[36m%s\x1b[0m`, `⚡ Socket.IO server running on port ${SOCKET_PORT}`);
    console.log(`\x1b[33m%s\x1b[0m`, `👉 Connect to WebSocket at ws://0.0.0.0:${SOCKET_PORT}`);
    console.log(`\x1b[32m%s\x1b[0m`, `🔑 ALLOWED_ORIGINS: ${ALLOWED_ORIGINS}`);
  });
  
  return io;
}

// Start the server
startSocketServer(); 