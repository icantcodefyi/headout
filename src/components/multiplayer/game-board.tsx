import { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { TimerIcon, CrownIcon } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';
import { useSession } from 'next-auth/react';

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
  image?: string;
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

interface GameBoardProps {
  room: GameRoom;
  playerId: string;
  elapsedTime: number;
  result: AnswerResult | null;
  onSubmitAnswer: (optionId: string) => void;
  onLeaveGame: () => void;
}

export function GameBoard({
  room,
  playerId,
  elapsedTime,
  result,
  onSubmitAnswer,
  onLeaveGame
}: GameBoardProps) {
  const { currentDestination, options, players } = room;
  const { data: session } = useSession();
  
  // If no destination or options data, show loading state
  if (!currentDestination || !Array.isArray(options) || options.length === 0) {
    return (
      <div className="flex min-h-[200px] flex-col items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-500"></div>
        <p className="mt-4 text-center text-sm text-muted-foreground">Loading next question...</p>
      </div>
    );
  }
  
  // Get current player and other players for the scoreboard
  const currentPlayer = players.find((p) => p.id === playerId);
  const otherPlayers = players.filter((p) => p.id !== playerId);
  
  return (
    <div className="w-full max-w-md p-4">
      {/* Scoreboard */}
      <div className="mb-6 rounded-lg bg-blue-50/70 p-3 dark:bg-blue-900/20">
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Scoreboard</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {/* Current player score */}
          <div className="flex items-center justify-between rounded-md bg-blue-100 p-2 dark:bg-blue-900/40">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Avatar className={currentPlayer?.isAdmin ? "ring-2 ring-yellow-400 dark:ring-yellow-500" : ""}>
                  <AvatarImage src={session?.user?.image ?? currentPlayer?.image} alt={currentPlayer?.username || "You"} />
                  <AvatarFallback className="bg-blue-200 text-blue-700 dark:bg-blue-800 dark:text-blue-200">
                    {currentPlayer?.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {currentPlayer?.isAdmin && (
                  <div className="absolute -top-1 -right-1">
                    <CrownIcon className="h-4 w-4 text-yellow-500" />
                  </div>
                )}
              </div>
              <span className="font-medium">{currentPlayer?.username} (You)</span>
            </div>
            <span className="text-xl font-bold">{currentPlayer?.score || 0}</span>
          </div>
          
          {/* Other players scores */}
          {otherPlayers.map((player) => (
            <div 
              key={player.id} 
              className="flex items-center justify-between rounded-md bg-gray-100 p-2 dark:bg-gray-800"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Avatar className={player.isAdmin ? "ring-2 ring-yellow-400 dark:ring-yellow-500" : ""}>
                    <AvatarImage src={player.image ?? undefined} alt={player.username} />
                    <AvatarFallback className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                      {player.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {player.isAdmin && (
                    <div className="absolute -top-1 -right-1">
                      <CrownIcon className="h-4 w-4 text-yellow-500" />
                    </div>
                  )}
                </div>
                <span className="font-medium">{player.username}</span>
              </div>
              <span className="text-xl font-bold">{player.score || 0}</span>
            </div>
          ))}
        </div>
        
        {/* Timer */}
        <div className="mt-3 flex items-center justify-end">
          <div className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 dark:bg-orange-900/40">
            <TimerIcon className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-semibold">{elapsedTime}s</span>
          </div>
        </div>
      </div>
      
      {/* Question content */}
      {result ? (
        // Show result
        <div className="space-y-4">
          <div className={cn(
            "rounded-lg overflow-hidden",
            result.isCorrect ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"
          )}>
            {/* Image display */}
            {result.destination?.cdnImageUrl && (
              <div className="relative w-full h-48">
                <img 
                  src={result.destination.cdnImageUrl} 
                  alt={`${result.destination.city}, ${result.destination.country}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                  <h3 className="text-lg font-bold text-white">
                    {result.destination.city}, {result.destination.country}
                  </h3>
                </div>
              </div>
            )}
            
            {/* Result message */}
            <div className="p-4 text-center">
              <div className="flex items-center justify-center mb-3">
                <div className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium",
                  result.isCorrect ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200" : 
                                     "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                )}>
                  {(() => {
                    const answeringPlayer = players.find((p) => p.id === result.playerId);
                    const playerName = answeringPlayer?.username || 'Someone';
                    const isCurrentPlayer = result.playerId === playerId;
                    
                    if (result.isCorrect) {
                      return isCurrentPlayer ? 
                        "You answered correctly!" : 
                        `${playerName} answered correctly!`;
                    } else {
                      return isCurrentPlayer ?
                        "You answered incorrectly" :
                        `${playerName} answered incorrectly`;
                    }
                  })()}
                </div>
              </div>
              
              {!result.destination?.cdnImageUrl && (
                <p className="font-medium mb-2">
                  The correct answer was <strong>{result.destination?.city}, {result.destination?.country}</strong>
                </p>
              )}
              
              <div className="mt-3 p-3 bg-white/50 rounded-md dark:bg-gray-800/50">
                <p className="text-sm italic">{result.fact}</p>
              </div>
            </div>
          </div>
          
          <div className="text-center animate-pulse">
            <p className="text-sm text-muted-foreground">Waiting for next question...</p>
          </div>
        </div>
      ) : (
        // Show destination clues and options
        <>
          <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-gray-800">
            <h3 className="mb-3 text-center text-lg font-semibold">Where is this place?</h3>
            <ul className="space-y-2 text-sm">
              {currentDestination.clues.map((clue: string, index: number) => (
                <li key={index} className="rounded-md bg-white p-2 dark:bg-gray-700">
                  {clue}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {options.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="h-auto justify-start py-4 text-left hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:border-blue-700 transition-all duration-200"
                onClick={() => onSubmitAnswer(option.id)}
              >
                <div className="flex flex-col items-start w-full">
                  <p className="font-medium text-base">{option.city}</p>
                  <p className="text-xs text-muted-foreground">{option.country}</p>
                </div>
              </Button>
            ))}
          </div>
        </>
      )}
      
      {/* Leave game button */}
      <div className="mt-6">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onLeaveGame}
        >
          Leave Game
        </Button>
      </div>
    </div>
  );
} 