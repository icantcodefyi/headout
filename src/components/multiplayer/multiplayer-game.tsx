'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { AuthController } from './auth-controller';
import { MultiplayerContent } from './multiplayer-content';
import { api } from '~/trpc/react';
import { Avatar, AvatarImage, AvatarFallback } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';

export function MultiplayerGame() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get user profile if logged in
  const userProfileQuery = api.game.getProfileByUserId.useQuery(undefined, {
    enabled: status === 'authenticated' && !!session?.user,
  });

  // Check initial loading state and set username from session when available
  useEffect(() => {
    if (status !== 'loading') {
      // Not loading anymore - show AuthController or the game itself
      setIsLoading(false);
      
      // If authenticated and we have profile data, use that username
      if (status === 'authenticated' && userProfileQuery.data?.username) {
        setUsername(userProfileQuery.data.username);
      }
      // Fallback to session name if profile doesn't exist yet
      else if (status === 'authenticated' && session?.user?.name) {
        setUsername(session.user.name);
      }
    }
  }, [status, session, userProfileQuery.data]);
  
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
  
  // Show user profile while loading auth controller
  if (!username && session?.user) {
    return (
      <div className="flex flex-col items-center w-full gap-6">
        <div className="flex flex-col items-center gap-3 p-6 border rounded-lg">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
              <AvatarFallback>{session.user.name?.substring(0, 2) || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{session.user.name}</p>
              <Badge variant="outline" className="mt-1">Setting up profile...</Badge>
            </div>
          </div>
        </div>
        <AuthController onAuthComplete={handleAuthComplete} />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center w-full">
      {/* Show auth controller if no username set and not signed in */}
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