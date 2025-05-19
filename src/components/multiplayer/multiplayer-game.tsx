'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { AuthController } from './auth-controller';
import { MultiplayerContent } from './multiplayer-content';

export function MultiplayerGame() {
  const { status } = useSession();
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check initial loading state
  useEffect(() => {
    if (status !== 'loading') {
      setIsLoading(false);
    }
  }, [status]);
  
  // Handle completed authentication
  const handleAuthComplete = (username: string) => {
    setUsername(username);
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="text-sm text-muted-foreground">Loading game...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center w-full">
      {/* Show auth controller if username is not set */}
      {!username && (
        <AuthController onAuthComplete={handleAuthComplete} />
      )}
      
      {/* Show multiplayer content when authenticated */}
      {username && (
        <MultiplayerContent username={username} />
      )}
    </div>
  );
} 