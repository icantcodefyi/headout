import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Card } from '~/components/ui/card';
import { ClipboardCopy, UserIcon, PlayIcon, CrownIcon } from 'lucide-react';
import { toast } from 'sonner';

// Define types to match multiplayer-context.tsx
type GameRoom = {
  id: string;
  players: Player[];
  currentDestination: { id: string; clues: string[] } | null;
  options: { id: string; city: string; country: string }[] | null;
  status: 'waiting' | 'playing' | 'completed';
  startTime?: number;
};

type Player = {
  id: string;
  socketId: string;
  username: string;
  isReady: boolean;
  isAdmin?: boolean;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
};

interface WaitingRoomProps {
  room: GameRoom;
  roomId: string;
  playerId: string;
  onReady: () => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export function WaitingRoom({
  room,
  roomId,
  playerId,
  onReady,
  onStartGame,
  onLeaveRoom
}: WaitingRoomProps) {
  const [copied, setCopied] = useState(false);
  
  const players = room.players || [];
  const currentPlayer = players.find((p) => p.id === playerId);
  // First player to join is considered the admin
  const isAdmin = currentPlayer?.isAdmin || (players.length > 0 && players[0]?.id === playerId) || false;
  const allReady = players.length > 0 && players.every((p) => p.isReady);
  // Admin can start game if all players are ready and there are at least 2 players
  const canStartGame = isAdmin && allReady && players.length >= 2;
  
  // Copy room ID to clipboard
  const copyRoomId = () => {
    if (!roomId) return;
    
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="w-full max-w-md space-y-4 p-4">
      {/* Room ID section - hidden since it's shown in the header */}
      <div className="flex flex-col items-center gap-4 rounded-lg p-4 text-center">
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent">
            Waiting for Players
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            {isAdmin 
              ? "Share the Room ID with friends to invite them to join your game" 
              : "Waiting for the admin to start the game"}
          </p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Players</h3>
          <Badge variant="outline" className="bg-blue-50/50 dark:bg-blue-900/20">
            {players.length} {players.length === 1 ? 'Player' : 'Players'}
          </Badge>
        </div>
        
        {/* Player cards */}
        <div className="space-y-3">
          {players.map((player) => {
            const isCurrentPlayer = player.id === playerId;
            // First player is considered the admin (index 0)
            const isPlayerAdmin = player.id === players[0]?.id;
            
            return (
              <Card key={player.id} className={`rounded-lg border p-4 transition-all ${
                isCurrentPlayer 
                  ? 'border-blue-200 bg-blue-50/50 dark:border-blue-900/70 dark:bg-blue-900/20' 
                  : 'hover:border-blue-100 dark:hover:border-blue-900/50'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      isPlayerAdmin 
                        ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-300' 
                        : 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300'
                    }`}>
                      {isPlayerAdmin ? (
                        <CrownIcon className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-semibold">
                          {player.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">
                        {player.username} {isCurrentPlayer ? '(You)' : ''}
                      </span>
                      {isPlayerAdmin && (
                        <p className="text-xs text-muted-foreground">Game Admin</p>
                      )}
                    </div>
                  </div>
                  <Badge variant={player.isReady ? "success" : "outline"}>
                    {player.isReady ? 'Ready' : 'Not Ready'}
                  </Badge>
                </div>
              </Card>
            );
          })}
          
          {players.length < 8 && (
            <div className="flex h-20 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground dark:border-gray-700">
              <UserIcon className="h-4 w-4 mb-1" />
              <span className="text-sm">Waiting for more players to join...</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col gap-3">
        {/* Ready button for all players */}
        {!currentPlayer?.isReady && (
          <Button 
            className="w-full" 
            onClick={onReady}
          >
            Ready Up
          </Button>
        )}
        
        {/* Status indicators and action buttons */}
        {isAdmin ? (
          <>
            {/* Admin UI */}
            {canStartGame ? (
              <Button 
                variant="default"
                className="w-full flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-500 hover:from-blue-700 hover:to-violet-600" 
                onClick={onStartGame}
              >
                <PlayIcon className="h-4 w-4" />
                Start Game ({players.length} Players)
              </Button>
            ) : (
              <div className="rounded-md bg-amber-50 p-3 text-center text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                {players.length < 2 ? 
                  "Waiting for more players to join..." : 
                  "Waiting for all players to ready up"}
              </div>
            )}
            
            {/* Disabled button with tooltip if conditions not met */}
            {!canStartGame && players.length >= 2 && (
              <Button 
                variant="outline"
                className="w-full flex items-center gap-2 mt-2 opacity-70"
                disabled
              >
                <PlayIcon className="h-4 w-4" />
                Cannot Start Game (Not Everyone Ready)
              </Button>
            )}
          </>
        ) : (
          <>
            {/* Non-admin player UI */}
            <div className="rounded-md bg-blue-50 p-3 text-center text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
              Waiting for admin to start the game
            </div>
          </>
        )}
        
        {/* Leave button for all players */}
        <Button 
          variant="outline" 
          className="w-full mt-2" 
          onClick={onLeaveRoom}
        >
          Leave Room
        </Button>
      </div>
    </div>
  );
} 