'use client';

import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import { Socket, io } from 'socket.io-client';

// Define SOCKET_URL in the client-side context
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

// Types
type Player = {
  id: string;
  socketId: string;
  username: string;
  isReady: boolean;
  isAdmin?: boolean;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  image?: string;
};

type GameRoom = {
  id: string;
  players: Player[];
  currentDestination: { id: string; clues: string[] } | null;
  options: { id: string; city: string; country: string }[] | null;
  status: 'waiting' | 'playing' | 'completed';
  startTime?: number;
};

type AnswerResult = {
  playerId: string;
  isCorrect: boolean;
  destination: {
    id: string;
    city: string;
    country: string;
    funFacts: string[];
    trivia: string[];
    cdnImageUrl?: string;
  };
  fact: string;
};

type MultiplayerState = {
  socket: Socket | null;
  isConnected: boolean;
  roomId: string | null;
  playerId: string | null;
  room: GameRoom | null;
  isLoading: boolean;
  error: string | null;
  result: AnswerResult | null;
};

type MultiplayerAction =
  | { type: 'CONNECT'; payload: { socket: Socket } }
  | { type: 'CONNECTED' }
  | { type: 'DISCONNECT' }
  | { type: 'SET_ROOM_ID'; payload: string }
  | { type: 'SET_PLAYER_ID'; payload: string }
  | { type: 'UPDATE_ROOM'; payload: GameRoom }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_RESULT'; payload: AnswerResult | null }
  | { type: 'PLAYER_LEFT'; payload: { playerId: string } }
  | { type: 'RESET' };

const initialState: MultiplayerState = {
  socket: null,
  isConnected: false,
  roomId: null,
  playerId: null,
  room: null,
  isLoading: false,
  error: null,
  result: null,
};

function multiplayerReducer(state: MultiplayerState, action: MultiplayerAction): MultiplayerState {
  switch (action.type) {
    case 'CONNECT':
      return {
        ...state,
        socket: action.payload.socket,
      };
    
    case 'CONNECTED':
      return {
        ...state,
        isConnected: true,
      };
    
    case 'DISCONNECT':
      state.socket?.disconnect();
      return {
        ...initialState,
      };
    
    case 'SET_ROOM_ID':
      return {
        ...state,
        roomId: action.payload,
      };
    
    case 'SET_PLAYER_ID':
      return {
        ...state,
        playerId: action.payload,
      };
    
    case 'UPDATE_ROOM':
      return {
        ...state,
        room: action.payload,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
      
    case 'SET_RESULT':
      return {
        ...state,
        result: action.payload,
      };
      
    case 'PLAYER_LEFT':
      if (!state.room) return state;
      return {
        ...state,
        room: {
          ...state.room,
          players: state.room.players.filter(
            (player) => player.id !== action.payload.playerId
          ),
        },
      };
      
    case 'RESET':
      // Preserve socket connection
      const { socket, isConnected } = state;
      return {
        ...initialState,
        socket,
        isConnected,
      };
    
    default:
      return state;
  }
}

// Context
type MultiplayerContextType = {
  state: MultiplayerState;
  dispatch: React.Dispatch<MultiplayerAction>;
  connectToServer: () => void;
  disconnectFromServer: () => void;
  joinRoom: (username: string, roomId?: string, userId?: string) => void;
  setReady: () => void;
  submitAnswer: (answerId: string) => void;
  leaveRoom: () => void;
  nextQuestion: () => void;
};

const MultiplayerContext = createContext<MultiplayerContextType | undefined>(undefined);

export function MultiplayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(multiplayerReducer, initialState);

  // Connect to the WebSocket server
  const connectToServer = () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Connect to the server using the environment variable
      console.log(`Connecting to Socket.IO server at ${SOCKET_URL}...`);
      const socket = io(SOCKET_URL, {
        timeout: 10000,
        transports: ['websocket', 'polling'],
      });
      
      dispatch({ type: 'CONNECT', payload: { socket } });
      
      // Socket event listeners
      socket.on('connect', () => {
        console.log('Connected to Socket.IO server');
        dispatch({ type: 'CONNECTED' });
        dispatch({ type: 'SET_LOADING', payload: false });
      });
      
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to game server' });
        dispatch({ type: 'SET_LOADING', payload: false });
      });
      
      socket.on('error', (error: { message: string }) => {
        console.error('Socket error:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
        dispatch({ type: 'SET_LOADING', payload: false });
      });
      
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
        dispatch({ type: 'DISCONNECT' });
      });
      
      socket.on('joined_room', (data: { roomId: string; playerId: string }) => {
        console.log('Joined room:', data.roomId, 'as player:', data.playerId);
        dispatch({ type: 'SET_ROOM_ID', payload: data.roomId });
        dispatch({ type: 'SET_PLAYER_ID', payload: data.playerId });
      });
      
      socket.on('room_update', (room: GameRoom) => {
        console.log('Room update received:', room);
        dispatch({ type: 'UPDATE_ROOM', payload: room });
      });
      
      socket.on('game_round', (data: { 
        destination: { id: string; clues: string[] },
        options: { id: string; city: string; country: string }[]
      }) => {
        console.log('Game round received:', data);
        
        if (!data.destination || !data.options) {
          console.error('Invalid game round data received:', data);
          return;
        }
        
        if (!state.room) {
          console.log('Creating new room state for game round');
          dispatch({
            type: 'UPDATE_ROOM',
            payload: {
              id: state.roomId || '',
              players: [],
              currentDestination: data.destination,
              options: data.options,
              status: 'playing',
              startTime: Date.now(),
            },
          });
        } else {
          console.log('Updating existing room with game round');
          dispatch({
            type: 'UPDATE_ROOM',
            payload: {
              ...state.room,
              currentDestination: data.destination,
              options: data.options,
              status: 'playing',
              startTime: Date.now(),
            },
          });
        }
        
        // Reset result when new round starts
        dispatch({ type: 'SET_RESULT', payload: null });
      });
      
      socket.on('answer_result', (result: AnswerResult) => {
        dispatch({ type: 'SET_RESULT', payload: result });
      });
      
      socket.on('player_left', ({ playerId }: { playerId: string }) => {
        dispatch({ type: 'PLAYER_LEFT', payload: { playerId } });
      });
      
      socket.on('player_disconnected', ({ playerId }: { playerId: string }) => {
        // Find player name
        const playerName = state.room?.players.find(
          (player) => player.id === playerId
        )?.username || 'Player';
      });
      
    } catch (error) {
      console.error('Failed to connect to socket server:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to game server' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Disconnect from the server
  const disconnectFromServer = () => {
    dispatch({ type: 'DISCONNECT' });
  };

  // Join a room or create one
  const joinRoom = (username: string, roomId?: string, userId?: string) => {
    if (!state.socket || !state.isConnected) {
      return;
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Generate a random player ID if none exists
    const playerId = state.playerId || `player_${Date.now()}`;
    
    console.log('Joining room', roomId || 'new room', 'as', username);
    
    // Get user session data from the window object if available
    let userImage;
    if (typeof window !== 'undefined') {
      // This session data will be directly passed through from the multiplayer-content component
      // which has access to the next-auth session
      if (window?.__NEXT_DATA__?.props?.pageProps?.session?.user?.image) {
        userImage = window.__NEXT_DATA__.props.pageProps.session.user.image;
      }
    }
    
    // Join or create room
    state.socket.emit('join_room', {
      roomId,
      playerId,
      username,
      userId, // Pass userId for authentication
      // Creating a new room means this player is the admin
      isAdmin: !roomId,
      image: userImage, // Add the user image
    });
    
    // Save player ID
    if (!state.playerId) {
      dispatch({ type: 'SET_PLAYER_ID', payload: playerId });
    }
  };

  // Set player as ready
  const setReady = () => {
    if (!state.socket || !state.roomId || !state.playerId) {
      return;
    }
    
    console.log('Setting player ready in room', state.roomId);
    
    state.socket.emit('player_ready', {
      roomId: state.roomId,
      playerId: state.playerId,
    });

    // Also immediately update local state to reflect ready status
    if (state.room) {
      const updatedRoom = { ...state.room };
      const playerIndex = updatedRoom.players.findIndex(p => p.id === state.playerId);
      
      if (playerIndex !== -1 && updatedRoom.players[playerIndex]) {
        updatedRoom.players[playerIndex].isReady = true;
        dispatch({ type: 'UPDATE_ROOM', payload: updatedRoom });
      }
    }
  };

  // Submit answer
  const submitAnswer = (answerId: string) => {
    if (!state.socket || !state.roomId || !state.playerId) return;
    
    state.socket.emit('submit_answer', {
      roomId: state.roomId,
      playerId: state.playerId,
      answerId,
    });
  };

  // Leave room
  const leaveRoom = () => {
    if (!state.socket || !state.roomId || !state.playerId) return;
    
    state.socket.emit('leave_room', {
      roomId: state.roomId,
      playerId: state.playerId,
    });
    
    dispatch({ type: 'RESET' });
  };

  // Request next question
  const nextQuestion = () => {
    if (!state.socket || !state.roomId) {
      return;
    }
    
    console.log('Requesting next question for room', state.roomId);
    
    state.socket.emit('next_question', {
      roomId: state.roomId,
    });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (state.socket) {
        state.socket.disconnect();
      }
    };
  }, [state.socket]);

  // Setup game_round event handler
  useEffect(() => {
    if (!state.socket) return;

    // Define the event handler function
    const handleGameRound = (data: { 
      destination: { id: string; clues: string[] },
      options: { id: string; city: string; country: string }[]
    }) => {
      console.log('Game round received in client:', data);
      
      if (!data.destination || !data.options) {
        console.error('Invalid game round data received:', data);
        return;
      }
      
      // Ensure we have room data to update
      if (!state.room) {
        console.log('Creating new room state for game round');
        const newRoom: GameRoom = {
          id: state.roomId || '',
          players: [],
          currentDestination: data.destination,
          options: data.options,
          status: 'playing',
          startTime: Date.now(),
        };
        dispatch({ type: 'UPDATE_ROOM', payload: newRoom });
      } else {
        console.log('Updating existing room with game round');
        const updatedRoom: GameRoom = {
          ...state.room,
          currentDestination: data.destination,
          options: data.options,
          status: 'playing',
          startTime: Date.now(),
        };
        dispatch({ type: 'UPDATE_ROOM', payload: updatedRoom });
      }
      
      // Reset any previous answer result
      dispatch({ type: 'SET_RESULT', payload: null });
    };

    // Add the event listener
    const socket = state.socket;
    socket.on('game_round', handleGameRound);

    // Clean up
    return () => {
      socket.off('game_round', handleGameRound);
    };
  }, [state.socket, state.roomId]);

  return (
    <MultiplayerContext.Provider
      value={{
        state,
        dispatch,
        connectToServer,
        disconnectFromServer,
        joinRoom,
        setReady,
        submitAnswer,
        leaveRoom,
        nextQuestion,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
}

export function useMultiplayer() {
  const context = useContext(MultiplayerContext);
  if (context === undefined) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
} 