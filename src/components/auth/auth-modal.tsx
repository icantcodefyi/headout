'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { LogIn, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: window.location.href });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent">
            Sign In Required
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You need to sign in to play multiplayer games
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center py-8">
          <div className="mb-6 mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
            <LogIn className="h-8 w-8 text-blue-500 dark:text-blue-400" />
          </div>
          <p className="text-center mb-6">
            Sign in to create or join multiplayer games, track your scores, and challenge other players.
          </p>
          <Button 
            onClick={handleSignIn} 
            className="w-full max-w-xs gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign in with Google
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 