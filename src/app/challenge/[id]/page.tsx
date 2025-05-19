'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import { useGame } from '~/contexts/game-context';

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
      
      // Redirect to the home page
      router.push('/');
    }
  }, [challengeQuery.data, dispatch, params.id, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 text-black dark:from-gray-900 dark:to-gray-800 dark:text-white">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
        <h1 className="mb-6 text-center text-2xl font-bold">Loading Challenge...</h1>
        {challengeQuery.isError && (
          <p className="text-center text-red-500">
            Challenge not found or has expired.
          </p>
        )}
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    </div>
  );
} 