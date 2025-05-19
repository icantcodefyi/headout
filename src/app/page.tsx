'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '~/trpc/react';
import { useGame } from '~/contexts/game-context';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Separator } from '~/components/ui/separator';
import { useToast } from '~/components/ui/use-toast';
import { signIn, useSession } from 'next-auth/react';
import { Confetti } from '~/components/confetti';

export default function Home() {
	const router = useRouter();
	const { toast } = useToast();
	const { data: session } = useSession();
	const { state, dispatch, username, setUsername, profileId, setProfileId } = useGame();
	const [usernameInput, setUsernameInput] = useState('');
	const [showChallengeLink, setShowChallengeLink] = useState(false);
	const [challengeLink, setChallengeLink] = useState('');
	const [showUsernameModal, setShowUsernameModal] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);

	// Get random destination query
	const randomDestinationQuery = api.game.getRandomDestination.useQuery(undefined, {
		enabled: state.isPlaying && !state.currentDestination,
	});

	useEffect(() => {
		if (randomDestinationQuery.data) {
			dispatch({ 
				type: 'SET_CURRENT_DESTINATION', 
				payload: { id: randomDestinationQuery.data.id, clues: randomDestinationQuery.data.clues } 
			});
		}
	}, [randomDestinationQuery.data, dispatch]);

	// Get options for destination
	const optionsQuery = api.game.getDestinationOptions.useQuery(
		{ currentDestinationId: state.currentDestination?.id || '' },
		{
			enabled: !!state.currentDestination && !state.options,
		}
	);

	useEffect(() => {
		if (optionsQuery.data) {
			dispatch({ type: 'SET_OPTIONS', payload: optionsQuery.data });
		}
	}, [optionsQuery.data, dispatch]);

	// Check answer mutation
	const checkAnswerMutation = api.game.checkAnswer.useMutation({
		onSuccess: (data) => {
			if (data) {
				dispatch({
					type: 'SET_RESULT',
					payload: {
						isCorrect: data.isCorrect,
						destination: {
							id: data.destination.id,
							city: data.destination.city,
							country: data.destination.country,
							funFacts: data.destination.funFacts,
							trivia: data.destination.trivia,
							cdnImageUrl: data.destination.cdnImageUrl ?? undefined
						},
						fact: data.fact ?? ''
					}
				});

				if (data.isCorrect) {
					setShowConfetti(true);
					setTimeout(() => setShowConfetti(false), 3000);
				}
			}
		}
	});

	// Create challenge mutation
	const createChallengeMutation = api.game.createChallenge.useMutation({
		onSuccess: (data) => {
			if (data) {
				const link = `${window.location.origin}/challenge/${data.id}`;
				setChallengeLink(link);
				setShowChallengeLink(true);
				toast({
					title: "Challenge created!",
					description: "Share the link with your friends and see if they can beat your score!",
				});
			}
		}
	});

	// User profile upsert mutation
	const upsertProfileMutation = api.game.upsertProfile.useMutation({
		onSuccess: (data) => {
			if (data) {
				setProfileId(data.id);
				setUsername(data.username);
				setShowUsernameModal(false);
				toast({
					title: "Profile updated!",
					description: `Welcome, ${data.username}!`,
				});
			}
		}
	});

	// Get user profile if logged in
	const userProfileQuery = api.game.getProfileByUserId.useQuery(undefined, {
		enabled: !!session?.user,
	});

	useEffect(() => {
		if (userProfileQuery.data) {
			setProfileId(userProfileQuery.data.id);
			setUsername(userProfileQuery.data.username);
		}
	}, [userProfileQuery.data, setProfileId, setUsername]);

	// Handle starting the game
	const handleStartGame = () => {
		dispatch({ type: 'START_GAME' });
	};

	// Handle selecting an answer
	const handleSelectAnswer = (answerId: string) => {
		if (state.selectedAnswer) return;
		
		dispatch({ type: 'SELECT_ANSWER', payload: answerId });
		
		checkAnswerMutation.mutate({
			destinationId: state.currentDestination?.id || '',
			answerId,
			profileId: profileId || undefined
		});
	};

	// Handle next question
	const handleNextQuestion = () => {
		dispatch({ type: 'NEXT_QUESTION' });
	};

	// Handle challenge a friend
	const handleChallengeAFriend = () => {
		if (!session) {
			toast({
				title: "Please sign in",
				description: "You need to sign in to challenge a friend",
				variant: "destructive",
			});
			return;
		}
		
		if (!username) {
			setShowUsernameModal(true);
			return;
		}

		createChallengeMutation.mutate({});
	};

	// Handle username submission
	const handleUsernameSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (usernameInput.length < 3) return;
		
		upsertProfileMutation.mutate({ username: usernameInput });
	};

	// Handle share to WhatsApp
	const handleShareToWhatsApp = () => {
		const message = `Hey, I challenge you to beat my score of ${state.score.total} in Globetrotter! Try it here: ${challengeLink}`;
		window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
	};

	// Handle sign in with Google
	const handleSignIn = () => {
		signIn('google');
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 px-4 py-8 text-black dark:from-gray-900 dark:to-gray-800 dark:text-white">
			<div className="w-full max-w-md space-y-6">
				{/* Game Header */}
				<div className="text-center">
					<h1 className="font-architects-daughter text-4xl font-bold tracking-wide text-blue-600 dark:text-blue-400 md:text-5xl">
						Globetrotter
					</h1>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-400 md:text-base">
						The Ultimate Travel Guessing Game
					</p>
				</div>

				{/* Google Sign In Button (if not signed in) */}
				{!session && !state.isPlaying && (
					<Card>
						<CardContent className="pt-6">
							<p className="mb-4 text-center text-sm text-muted-foreground">
								Sign in to track your scores and challenge friends!
							</p>
							<Button
								variant="outline"
								onClick={handleSignIn}
								className="w-full"
							>
								<svg viewBox="0 0 24 24" className="mr-2 h-4 w-4">
									<path
										d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										fill="#4285F4"
									/>
									<path
										d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										fill="#34A853"
									/>
									<path
										d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										fill="#FBBC05"
									/>
									<path
										d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										fill="#EA4335"
									/>
								</svg>
								Sign in with Google
							</Button>
						</CardContent>
					</Card>
				)}

				{/* Score Display */}
				{state.isPlaying && (
					<Card>
						<CardContent className="py-4">
							<div className="flex justify-between">
								<div className="text-center">
									<p className="text-xs text-muted-foreground">Correct</p>
									<p className="text-xl font-bold text-green-500">{state.score.correct}</p>
								</div>
								<div className="text-center">
									<p className="text-xs text-muted-foreground">Wrong</p>
									<p className="text-xl font-bold text-red-500">{state.score.wrong}</p>
								</div>
								<div className="text-center">
									<p className="text-xs text-muted-foreground">Score</p>
									<p className="text-xl font-bold text-blue-500">{state.score.total}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Start Game Button */}
				{!state.isPlaying && (
					<Card>
						<CardContent className="pt-6">
							<div className="flex flex-col space-y-4">
								<Button
									onClick={handleStartGame}
									size="lg"
									className="w-full"
								>
									Start Game
								</Button>
								{state.challenge && (
									<div className="mb-4 text-center">
										<p className="mb-2 text-sm text-muted-foreground">
											You've been challenged by {state.challenge.challenger?.username}!
										</p>
										<p className="text-sm font-semibold">
											Their Score: {state.challenge.challenger?.totalScore}
										</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Game Content */}
				{state.isPlaying && (
					<Card className="overflow-hidden">
						{/* Loading State */}
						{(!state.currentDestination || !state.options) && (
							<CardContent className="flex h-40 items-center justify-center">
								<div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
							</CardContent>
						)}

						{/* Clues */}
						{state.currentDestination && state.options && !state.result && (
							<div>
								<CardHeader>
									<CardTitle>Where is this place?</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="rounded-lg bg-blue-50 p-4 text-sm dark:bg-gray-700">
										{state.currentDestination.clues.map((clue, index) => (
											<p key={index} className="mb-2">{clue}</p>
										))}
									</div>
									<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
										{state.options.map((option) => (
											<Button
												key={option.id}
												onClick={() => handleSelectAnswer(option.id)}
												disabled={!!state.selectedAnswer}
												variant="outline"
												className={cn(
													"h-auto justify-between py-3 text-left font-normal",
													state.selectedAnswer === option.id
														? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
														: ""
												)}
											>
												<span className="font-medium">{option.city}</span>
												<span className="text-sm text-muted-foreground">{option.country}</span>
											</Button>
										))}
									</div>
								</CardContent>
							</div>
						)}

						{/* Result */}
						{state.result && (
							<div>
								<CardHeader className="flex flex-col items-center pb-0">
									{state.result.isCorrect ? (
										<div className="mb-4 rounded-full bg-green-100 p-3 text-green-500 dark:bg-green-900/30">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
										</div>
									) : (
										<div className="mb-4 rounded-full bg-red-100 p-3 text-red-500 dark:bg-red-900/30">
											<svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</div>
									)}

									<CardTitle className="mb-2 text-center text-xl">
										{state.result.isCorrect ? "Correct!" : "Oops! Wrong answer."}
									</CardTitle>
								
									<p className="mb-2 text-center text-lg">
										It's <span className="font-bold">{state.result.destination?.city}, {state.result.destination?.country}</span>
									</p>
								</CardHeader>
								
								<CardContent className="space-y-4">
									{state.result.destination?.cdnImageUrl && (
										<div className="relative mb-4 h-40 w-full overflow-hidden rounded-lg">
											<Image
												src={state.result.destination.cdnImageUrl}
												alt={state.result.destination.city}
												fill
												className="object-cover"
												sizes="(max-width: 768px) 100vw, 500px"
											/>
										</div>
									)}

									<div className="rounded-lg bg-muted p-4 text-sm">
										<p className="italic">{state.result.fact}</p>
									</div>
								</CardContent>
								
								<CardFooter>
									<Button
										onClick={handleNextQuestion}
										className="w-full"
									>
										Next Destination
									</Button>
								</CardFooter>
							</div>
						)}
					</Card>
				)}

				{/* Challenge Button */}
				{state.isPlaying && !showChallengeLink && (
					<Button
						onClick={handleChallengeAFriend}
						variant="outline"
						className="w-full"
					>
						Challenge a Friend
					</Button>
				)}

				{/* Challenge Link */}
				{showChallengeLink && (
					<Card>
						<CardHeader>
							<CardTitle className="text-lg">Share your challenge</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="flex overflow-hidden rounded-md border">
								<Input 
									readOnly 
									value={challengeLink} 
									className="rounded-none border-0"
								/>
								<Button
									variant="secondary"
									className="rounded-none"
									onClick={() => {
										navigator.clipboard.writeText(challengeLink);
										toast({
											title: "Copied!",
											description: "Link copied to clipboard",
										});
									}}
								>
									Copy
								</Button>
							</div>
							<Button
								onClick={handleShareToWhatsApp}
								className="w-full bg-green-500 hover:bg-green-600"
							>
								Share on WhatsApp
							</Button>
						</CardContent>
					</Card>
				)}

				{/* Username Modal */}
				<Dialog open={showUsernameModal} onOpenChange={setShowUsernameModal}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Create your profile</DialogTitle>
							<DialogDescription>
								Enter a username to save your scores and challenge friends.
							</DialogDescription>
						</DialogHeader>
						<form onSubmit={handleUsernameSubmit}>
							<Input
								type="text"
								value={usernameInput}
								onChange={(e) => setUsernameInput(e.target.value)}
								placeholder="Username (3-20 characters)"
								className="mb-4"
								minLength={3}
								maxLength={20}
								required
							/>
							<DialogFooter>
								<Button type="button" variant="outline" onClick={() => setShowUsernameModal(false)}>
									Cancel
								</Button>
								<Button type="submit">Save</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</div>
			
			{/* Confetti animation for correct answers */}
			{showConfetti && <Confetti />}
		</div>
	);
}
