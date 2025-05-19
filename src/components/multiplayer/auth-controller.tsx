'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '~/trpc/react';
import { AuthModal } from '~/components/auth/auth-modal';
import { UsernameSetupModal } from '~/components/auth/username-setup-modal';

interface AuthControllerProps {
  onAuthComplete: (username: string) => void;
}

export function AuthController({ onAuthComplete }: AuthControllerProps) {
  const { data: session, status: sessionStatus } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  
  // Get user profile if logged in
  const userProfileQuery = api.game.getProfileByUserId.useQuery(undefined, {
    enabled: !!session?.user,
  });

  // User profile upsert mutation
  const upsertProfileMutation = api.game.upsertProfile.useMutation({
    onSuccess: (data) => {
      if (data) {
        setShowUsernameModal(false);
        onAuthComplete(data.username);
      }
    }
  });
  
  // Determine auth state
  useEffect(() => {
    if (sessionStatus === 'loading') return;
    
    if (sessionStatus === 'unauthenticated') {
      setShowAuthModal(true);
      return;
    }
    
    if (sessionStatus === 'authenticated') {
      // If they have a profile, we're done
      if (userProfileQuery.data?.username) {
        onAuthComplete(userProfileQuery.data.username);
        return;
      }
      
      // Show username modal once the query is done and no profile exists
      if (!userProfileQuery.isLoading && !userProfileQuery.data) {
        setShowUsernameModal(true);
      }
    }
  }, [sessionStatus, userProfileQuery.data, userProfileQuery.isLoading]);
  
  // Handle username submission
  const handleUsernameSubmit = (username: string) => {
    upsertProfileMutation.mutate({ username });
  };
  
  return (
    <>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
      
      <UsernameSetupModal 
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        onSubmit={handleUsernameSubmit}
        isLoading={upsertProfileMutation.isPending}
      />
    </>
  );
} 