import { Server, Socket } from 'socket.io';
import { type Server as HTTPServer } from 'http';
import { z } from 'zod';
import { db } from '~/server/db';

// Define game room types
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

// Initialize socket server
export function initSocketServer(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // In production, restrict to your domain
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Create or join a game room
    socket.on('join_room', async (data) => {
      try {
        const { roomId, playerId, username, userId, isAdmin, image } = joinRoomSchema.parse(data);
        
        // Require userId for authentication
        if (!userId) {
          socket.emit('error', { message: 'Authentication required - please sign in' });
          return;
        }
        
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
          if (room.players.some(p => p.id === playerId)) {
            // Reconnect existing player
            const playerIndex = room.players.findIndex(p => p.id === playerId);
            if (playerIndex !== -1 && room.players[playerIndex]) {
              room.players[playerIndex].socketId = socket.id;
            }
            socket.join(roomId);
            
            // Emit room state
            io.to(roomId).emit('room_update', room);
            return;
          }
          
          // Add new player to room
          const newPlayer: Player = {
            id: playerId,
            socketId: socket.id,
            username,
            isReady: false,
            isAdmin: isAdmin || false,
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
    socket.on('player_ready', ({ roomId, playerId }) => {
      const room = gameRooms.get(roomId);
      if (!room) return;
      
      const playerIndex = room.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) return;
      
      const player = room.players[playerIndex];
      if (!player) return;
      
      player.isReady = true;
      
      // Remove auto-start game logic
      // The game will only start when the admin explicitly calls next_question
      
      io.to(roomId).emit('room_update', room);
    });
    
    // Player submits an answer
    socket.on('submit_answer', async (data) => {
      try {
        const { roomId, playerId, answerId } = answerSchema.parse(data);
        
        const room = gameRooms.get(roomId);
        if (!room || !room.currentDestination) return;
        
        const playerIndex = room.players.findIndex(p => p.id === playerId);
        if (playerIndex === -1) return;
        
        const player = room.players[playerIndex];
        const destination = await db.destination.findUnique({
          where: { id: room.currentDestination.id },
          select: {
            id: true,
            city: true,
            country: true,
            funFacts: true,
            trivia: true,
            cdnImageUrl: true,
          },
        });
        
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
        const randomFact = facts[Math.floor(Math.random() * facts.length)];
        
        // Emit result to all players in the room
        io.to(roomId).emit('answer_result', {
          playerId,
          isCorrect,
          destination,
          fact: randomFact,
        });
        
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
    
    // Player requests next question
    socket.on('next_question', ({ roomId }) => {
      const room = gameRooms.get(roomId);
      if (!room) return;
      
      prepareGame(io, room);
    });
    
    // Player leaves the game
    socket.on('leave_room', ({ roomId, playerId }) => {
      const room = gameRooms.get(roomId);
      if (!room) return;
      
      const playerIndex = room.players.findIndex(p => p.id === playerId);
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
        const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
        
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
              const player = currentRoom.players.find(p => p.socketId === socket.id);
              
              if (player) {
                // Remove player if they haven't reconnected
                currentRoom.players = currentRoom.players.filter(p => p.socketId !== socket.id);
                
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

  return io;
}

// Prepare a new game round
async function prepareGame(io: Server, room: GameRoom) {
  try {
    // Get a random destination
    const destinationsCount = await db.destination.count();
    const skip = Math.floor(Math.random() * destinationsCount);
    const destination = await db.destination.findFirst({
      skip,
      select: {
        id: true,
        clues: true,
      },
    });
    
    if (!destination) throw new Error('Failed to fetch destination');
    
    // Get multiple choice options
    const currentDestination = await db.destination.findUnique({
      where: { id: destination.id },
      select: { id: true, city: true, country: true },
    });
    
    if (!currentDestination) throw new Error('Destination not found');
    
    // Get random destinations excluding the current one
    const randomDestinations = await db.destination.findMany({
      where: {
        id: { not: destination.id },
      },
      select: {
        id: true,
        city: true,
        country: true,
      },
      take: 3, // 3 wrong options + 1 correct = 4 total
      orderBy: {
        city: "asc",
      },
    });
    
    // Combine and shuffle options
    const options = [...randomDestinations, currentDestination]
      .sort(() => Math.random() - 0.5);
    
    // Update room state
    room.currentDestination = destination;
    room.options = options;
    room.status = 'playing';
    room.startTime = Date.now();
    
    // Send the new game state to all players
    io.to(room.id).emit('game_round', {
      destination: {
        id: destination.id,
        clues: destination.clues,
      },
      options,
    });
    
  } catch (error) {
    console.error('Prepare game error:', error);
    io.to(room.id).emit('error', { message: 'Failed to prepare game' });
  }
}