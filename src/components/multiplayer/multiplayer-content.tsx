'use client';

import { useState, useEffect } from 'react';
import { useMultiplayer } from '~/contexts/multiplayer-context';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Loader2, ClipboardCopy } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

// Import component modules
import { WaitingRoom } from './waiting-room';
import { GameBoard } from './game-board';

interface MultiplayerContentProps {
  username: string;
}

export function MultiplayerContent({ username }: MultiplayerContentProps) {
  const { data: session } = useSession();
  const {
    state,
    connectToServer,
    disconnectFromServer,
    joinRoom,
    setReady,
    submitAnswer,
    leaveRoom,
    nextQuestion,
    dispatch
  } = useMultiplayer();
  
  const [joinRoomId, setJoinRoomId] = useState('');
  const [tabValue, setTabValue] = useState('create');
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Debug state to show connection status
  const [debugInfo, setDebugInfo] = useState('');
  
  // Initialize Socket.IO and connect to server on mount
  useEffect(() => {
    const initSocketIO = async () => {
      try {
        // Dynamic import to avoid server-side issues
        const { default: initSocketIOFunc } = await import('~/lib/socketio-init');
        await initSocketIOFunc();
        if (!state.socket) {
          connectToServer();
        }
      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    };
    
    initSocketIO();
    
    return () => {
      if (state.socket) {
        disconnectFromServer();
      }
    };
  }, []);
  
  // Reset loading state when room data is received
  useEffect(() => {
    if (state.room && state.isLoading) {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.room, state.isLoading]);
  
  // Debug useEffect to monitor state changes
  useEffect(() => {
    setDebugInfo(`Connection: ${state.isConnected ? 'Connected' : 'Disconnected'}, 
                 Room ID: ${state.roomId || 'None'}, 
                 Room Status: ${state.room?.status || 'N/A'},
                 Players: ${state.room?.players?.length || 0},
                 Question: ${state.room?.currentDestination ? 'Loaded' : 'None'}`);
                 
    // Debug destination data changes
    if (state.room?.currentDestination) {
      console.log('Current destination:', state.room.currentDestination);
      console.log('Options:', state.room.options);
      
      // When destination data is loaded, ensure isLoading is set to false
      if (state.isLoading) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  }, [state.isConnected, state.roomId, state.room?.status, 
      state.room?.players?.length, state.room?.currentDestination, state.isLoading]);
  
  // Timer for gameplay
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    
    if (state.room?.status === 'playing' && state.room.startTime) {
      interval = setInterval(() => {
        const startTime = state.room?.startTime || 0;
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.room?.status, state.room?.startTime]);
  
  // Handle creating a new room
  const handleCreateRoom = () => {
    if (!session?.user.id) {
      toast.error('Authentication error');
      return;
    }
    joinRoom(username, undefined, session.user.id);
  };
  
  // Handle joining an existing room
  const handleJoinRoom = () => {
    if (!session?.user.id) {
      toast.error('Authentication error');
      return;
    }
    
    if (!joinRoomId) {
      toast.error('Please enter a Room ID');
      return;
    }
    
    joinRoom(username, joinRoomId, session.user.id);
  };
  
  // Copy room ID to clipboard
  const copyRoomId = () => {
    if (!state.roomId) return;
    
    navigator.clipboard.writeText(state.roomId);
    toast.success('Room ID copied to clipboard');
  };
  
  // Simplified rendering of game components
  const renderContent = () => {
    // If not connected or in loading state
    if (!state.isConnected) {
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-8">
          <p className="text-center">Connecting to game server...</p>
          <Button onClick={connectToServer}>
            Connect
          </Button>
        </div>
      );
    }
    
    // If not in a room, show join/create UI
    if (!state.roomId) {
      return (
        <Tabs value={tabValue} onValueChange={setTabValue} className="w-full p-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Room</TabsTrigger>
            <TabsTrigger value="join">Join Room</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4 pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="flex items-center text-sm font-medium">
                  Playing as: <span className="ml-2 font-semibold bg-gradient-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent">{username}</span>
                </span>
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleCreateRoom}
              >
                Create New Room
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="join" className="space-y-4 pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="flex items-center text-sm font-medium">
                  Playing as: <span className="ml-2 font-semibold bg-gradient-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent">{username}</span>
                </span>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="roomId" className="text-sm font-medium">
                  Room ID
                </label>
                <Input
                  id="roomId"
                  placeholder="Enter Room ID"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                />
              </div>
              
              <Button 
                className="w-full" 
                onClick={handleJoinRoom}
                disabled={!joinRoomId}
              >
                Join Room
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      );
    }
    
    // If room exists
    if (state.room) {
      // If in waiting status, show waiting room component
      if (state.room.status === 'waiting') {
        return (
          <WaitingRoom
            room={state.room}
            roomId={state.roomId}
            playerId={state.playerId || ''}
            onReady={setReady}
            onStartGame={nextQuestion}
            onLeaveRoom={leaveRoom}
          />
        );
      }
      
      // If in playing status, show game board component
      if (state.room.status === 'playing') {
        return (
          <GameBoard
            room={state.room}
            playerId={state.playerId || ''}
            elapsedTime={elapsedTime}
            result={state.result}
            onSubmitAnswer={submitAnswer}
            onLeaveGame={leaveRoom}
          />
        );
      }
    }
    
    // Default loading state when room exists but status is invalid or loading
    return (
      <div className="flex min-h-[200px] items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  };

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Game Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent">
          Multiplayer
        </h2>
        {state.roomId && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 px-2 py-1 text-xs">
              <span className="font-normal">Room:</span> {state.roomId}
            </Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyRoomId}>
              <ClipboardCopy className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="rounded-lg border bg-card shadow">
        {renderContent()}
      </div>
      
      {/* Debug Info (hidden in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="rounded border border-dashed border-gray-200 p-2 text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500">
          <details>
            <summary className="cursor-pointer">Debug Info</summary>
            <pre className="mt-2 whitespace-pre-wrap">
              {debugInfo}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
} 