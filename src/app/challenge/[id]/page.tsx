'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import { useGame } from '~/contexts/game-context';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import { toast } from 'sonner';

export default function ChallengePage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter();
  const { dispatch } = useGame();
  
  const challengeQuery = api.game.getChallengeById.useQuery({
    challengeId: params.id
  });

  useEffect(() => {
    if (challengeQuery.data) {
      // Set the challenge in the game context
      dispatch({
        type: 'SET_CHALLENGE',
        payload: {
          id: params.id,
          challenger: {
            username: challengeQuery.data.challenger.username,
            totalScore: challengeQuery.data.challenger.totalScore,
            correctCount: challengeQuery.data.challenger.correctCount,
            wrongCount: challengeQuery.data.challenger.wrongCount
          }
        }
      });
      
      // Show toast notification
      toast.success("Challenge accepted!", {
        description: `You're taking on ${challengeQuery.data.challenger.username}'s challenge. Good luck!`,
      });
      
      // Redirect to the home page after a short delay
      const redirectTimeout = setTimeout(() => {
        router.push('/');
      }, 2000);
      
      return () => clearTimeout(redirectTimeout);
    }
    
    if (challengeQuery.isError) {
      toast.error("Challenge not found", {
        description: "This challenge may have expired or doesn't exist.",
      });
    }
  }, [challengeQuery.data, challengeQuery.isError, dispatch, params.id, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4 text-black dark:from-gray-900 dark:to-gray-800 dark:text-white md:p-8">
      <Card className="w-full max-w-md overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="mb-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
            {challengeQuery.isLoading && 'Loading Challenge...'}
            {challengeQuery.isError && 'Challenge Not Found'}
            {challengeQuery.data && `${challengeQuery.data.challenger.username}'s Challenge`}
          </CardTitle>
          <CardDescription>
            {challengeQuery.data && 'Challenge accepted! Redirecting to the game...'}
            {challengeQuery.isError && 'Sorry, this challenge could not be found or has expired.'}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {challengeQuery.isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}
          
          {challengeQuery.data && (
            <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-gray-800">
              <h3 className="mb-4 text-lg font-semibold">Challenger Stats</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-md bg-white p-2 text-center shadow-sm dark:bg-gray-700">
                  <p className="text-xs text-muted-foreground">Correct</p>
                  <p className="text-xl font-bold text-green-500">{challengeQuery.data.challenger.correctCount}</p>
                </div>
                <div className="rounded-md bg-white p-2 text-center shadow-sm dark:bg-gray-700">
                  <p className="text-xs text-muted-foreground">Wrong</p>
                  <p className="text-xl font-bold text-red-500">{challengeQuery.data.challenger.wrongCount}</p>
                </div>
                <div className="rounded-md bg-white p-2 text-center shadow-sm dark:bg-gray-700">
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="text-xl font-bold text-blue-500">{challengeQuery.data.challenger.totalScore}</p>
                </div>
              </div>
            </div>
          )}
          
          {challengeQuery.isError && (
            <div className="flex flex-col items-center">
              <div className="mb-4 rounded-full bg-red-100 p-3 text-red-500 dark:bg-red-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          {challengeQuery.isLoading && (
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          )}
          
          {challengeQuery.isError && (
            <Button onClick={() => router.push('/')}>
              Return to Home
            </Button>
          )}
          
          {challengeQuery.data && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-ping rounded-full bg-green-500"></div>
              <p className="text-sm">Redirecting to the game...</p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 