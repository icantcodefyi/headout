import { Socket } from 'socket.io-client';

export interface Player {
  id: string;
  socketId: string;
  username: string;
  isReady: boolean;
  isAdmin?: boolean;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
}

export interface Destination {
  id: string;
  city: string;
  country: string;
  clues: string[];
  funFacts: string[];
  trivia: string[];
  cdnImageUrl?: string;
}

export interface Option {
  id: string;
  city: string;
  country: string;
}

export interface GameResult {
  playerId: string;
  destinationId: string;
  optionId: string;
  isCorrect: boolean;
  destination: Destination;
  fact: string;
}

export interface Room {
  id: string;
  players: Player[];
  status: 'waiting' | 'playing' | 'ended' | 'completed';
  startTime?: number;
  currentDestination: Destination | null;
  options: Option[] | null;
  currentRound?: number;
  maxRounds?: number;
}

export interface MultiplayerState {
  socket: Socket | null;
  isConnected: boolean;
  isLoading: boolean;
  playerId: string | null;
  roomId: string | null;
  room: Room | null;
  error: string | null;
  result: GameResult | null;
}

export type MultiplayerAction = 
  | { type: 'CONNECT_SUCCESS'; payload: { socket: Socket; playerId: string } }
  | { type: 'CONNECT_ERROR'; payload: string }
  | { type: 'DISCONNECT' }
  | { type: 'JOIN_ROOM'; payload: { roomId: string } }
  | { type: 'UPDATE_ROOM'; payload: Room }
  | { type: 'LEAVE_ROOM' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_RESULT'; payload: GameResult | null }
  | { type: 'RESET' }; 