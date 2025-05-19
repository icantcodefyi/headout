'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { UserCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UsernameSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (username: string) => void;
  isLoading: boolean;
  userName?: string;
}

export function UsernameSetupModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  userName = ''
}: UsernameSetupModalProps) {
  const [username, setUsername] = useState(userName);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!username.trim()) {
      setError('Username cannot be empty');
      return;
    }
    
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    if (username.length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }
    
    setError('');
    onSubmit(username);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-500 bg-clip-text text-transparent">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Choose a username for multiplayer games
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-6">
          <div className="mb-6 mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-900/30">
            <UserCircle className="h-10 w-10 text-blue-500 dark:text-blue-400" />
          </div>
          
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter a username"
                className={error ? "border-red-300 focus-visible:ring-red-400" : ""}
                disabled={isLoading}
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
            
            <p className="text-sm text-muted-foreground">
              Your username will be visible to other players in multiplayer games.
            </p>
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <Button 
            type="submit" 
            onClick={handleSubmit} 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue to Game'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 