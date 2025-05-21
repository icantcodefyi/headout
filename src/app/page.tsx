'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
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
import { toast } from 'sonner';
import { signIn, useSession } from 'next-auth/react';
import { Confetti } from '~/components/confetti';
import { SadFace } from '~/components/sad-face';
import { Badge } from '~/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Loader2, Sword, Users, Share2, Copy, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
	const router = useRouter();
	const { data: session } = useSession();
	const { state, dispatch, username, setUsername, profileId, setProfileId } = useGame();
	const [usernameInput, setUsernameInput] = useState('');
	const [showUsernameModal, setShowUsernameModal] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);
	const [showSadFace, setShowSadFace] = useState(false);
	const [isLoadingAnswer, setIsLoadingAnswer] = useState(false);
	const previousDestinationsRef = useRef<string[]>([]);
	const [showChallengeModal, setShowChallengeModal] = useState(false);
	const [shareUrl, setShareUrl] = useState('');
	const [isSendingChallenge, setIsSendingChallenge] = useState(false);
	const [showShareModal, setShowShareModal] = useState(false);
	const [friendUsername, setFriendUsername] = useState('');

	// Track seen destinations to avoid repetition
	useEffect(() => {
		if (state.result?.destination?.id && !previousDestinationsRef.current.includes(state.result.destination.id)) {
			previousDestinationsRef.current = [
				...previousDestinationsRef.current, 
				state.result.destination.id
			].slice(-10); // Keep only the last 10 destinations
		}
	}, [state.result]);

	// Get random destination query with useCallback for optimization
	const getRandomDestination = api.game.getRandomDestination.useQuery(
		{ previousIds: previousDestinationsRef.current },
		{
			enabled: state.isPlaying && !state.currentDestination,
			staleTime: 0, // Disable caching to always get a fresh destination
			refetchOnWindowFocus: false
		}
	);

	// Get options for destination with optimized settings
	const getDestinationOptions = api.game.getDestinationOptions.useQuery(
		{ 
			currentDestinationId: state.currentDestination?.id || '',
			count: 4  // Explicitly request 4 options
		},
		{
			enabled: !!state.currentDestination && !state.options,
			staleTime: 0, // Disable caching for options too
			refetchOnWindowFocus: false
		}
	);

	// Reduce re-renders by using useEffect with optimization
	useEffect(() => {
		if (getRandomDestination.data && !state.currentDestination) {
			dispatch({ 
				type: 'SET_CURRENT_DESTINATION', 
				payload: { id: getRandomDestination.data.id, clues: getRandomDestination.data.clues } 
			});
		}
	}, [getRandomDestination.data, dispatch, state.currentDestination]);

	useEffect(() => {
		if (getDestinationOptions.data && !state.options) {
			dispatch({ type: 'SET_OPTIONS', payload: getDestinationOptions.data });
		}
	}, [getDestinationOptions.data, dispatch, state.options]);

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
				} else {
					setShowSadFace(true);
					setTimeout(() => setShowSadFace(false), 3000);
				}
			}
			setIsLoadingAnswer(false);
		}
	});

	// User profile upsert mutation
	const upsertProfileMutation = api.game.upsertProfile.useMutation({
		onSuccess: (data) => {
			if (data) {
				setProfileId(data.id);
				setUsername(data.username);
				setShowUsernameModal(false);
				toast.success("Profile updated!", {
					description: `Welcome, ${data.username}!`,
				});
			}
		}
	});

	// Get user profile if logged in
	const userProfileQuery = api.game.getProfileByUserId.useQuery(undefined, {
		enabled: !!session?.user,
		staleTime: 300000, // Cache for 5 minutes
		refetchOnWindowFocus: false
	});

	useEffect(() => {
		if (userProfileQuery.data) {
			setProfileId(userProfileQuery.data.id);
			setUsername(userProfileQuery.data.username);
		}
	}, [userProfileQuery.data, setProfileId, setUsername]);

	// Handle starting the game
	const handleStartGame = useCallback(() => {
		// Reset previously seen destinations when starting a new game
		previousDestinationsRef.current = [];
		dispatch({ type: 'START_GAME' });
	}, [dispatch]);

	// Handle selecting an answer
	const handleSelectAnswer = useCallback((answerId: string) => {
		if (state.selectedAnswer || isLoadingAnswer) return;
		
		setIsLoadingAnswer(true);
		dispatch({ type: 'SELECT_ANSWER', payload: answerId });
		
		checkAnswerMutation.mutate({
			destinationId: state.currentDestination?.id || '',
			answerId,
			profileId: profileId || undefined
		});
	}, [state.selectedAnswer, isLoadingAnswer, dispatch, checkAnswerMutation, state.currentDestination?.id, profileId]);

	// Handle next question
	const handleNextQuestion = useCallback(() => {
		// Invalidate queries to ensure we get fresh data
		getRandomDestination.refetch();
		dispatch({ type: 'NEXT_QUESTION' });
	}, [dispatch, getRandomDestination]);

	// Challenge a friend - now creates a shareable link
	const createChallengeMutation = api.game.createChallenge.useMutation({
		onSuccess: (data) => {
			setIsSendingChallenge(false);
			// Generate the share URL with the challenge ID
			const challengeUrl = `${window.location.origin}/challenge/${data.id}`;
			setShareUrl(challengeUrl);
			
			// Close challenge modal and open share modal
			setShowChallengeModal(false);
			setShowShareModal(true);
		},
		onError: (error) => {
			setIsSendingChallenge(false);
			toast.error("Failed to create challenge", {
				description: error.message,
			});
		}
	});

	// Copy link to clipboard
	const copyToClipboard = () => {
		navigator.clipboard.writeText(shareUrl).then(() => {
			toast.success("Link copied to clipboard!");
		}).catch(() => {
			toast.error("Failed to copy link");
		});
	};

	// Share to WhatsApp
	const shareToWhatsApp = () => {
		const message = `Hey! I challenge you to beat my score in Globetrotter! Click here to play: ${shareUrl}`;
		const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
		window.open(whatsappUrl, '_blank');
	};

	// Handle challenge a friend
	const handleChallengeAFriend = useCallback(() => {
		if (!username) {
			// If user doesn't have a username, show the username modal first
			toast.info("Create a profile first", {
				description: "You need to set a username before challenging friends",
			});
			setShowUsernameModal(true);
			return;
		}
		
		// Create a challenge immediately with current game session scores
		setIsSendingChallenge(true);
		createChallengeMutation.mutate({
			currentScore: {
				correct: state.score.correct,
				wrong: state.score.wrong,
				total: state.score.total
			}
		});
	}, [username, createChallengeMutation, state.score]);

	// Handle multiplayer navigation
	const handleMultiplayer = useCallback(() => {
		router.push('/multiplayer');
	}, [router]);

	// Handle username submission
	const handleUsernameSubmit = useCallback((e: React.FormEvent) => {
		e.preventDefault();
		if (usernameInput.length < 3) return;
		
		upsertProfileMutation.mutate({ username: usernameInput });
	}, [usernameInput, upsertProfileMutation]);

	// Handle sign in with Google
	const handleSignIn = useCallback(() => {
		signIn('google');
	}, []);

	// Handle 1v1 challenge submission
	const handleDirectChallengeSubmit = useCallback((e: React.FormEvent) => {
		e.preventDefault();
		if (friendUsername.length < 3) return;
		
		setIsSendingChallenge(true);
		createChallengeMutation.mutate({
			currentScore: {
				correct: state.score.correct,
				wrong: state.score.wrong,
				total: state.score.total
			}
		});
	}, [friendUsername, createChallengeMutation, state.score]);

	// Handle challenge a friend modal
	const handleShowChallengeModal = useCallback(() => {
		if (!username) {
			// If user doesn't have a username, show the username modal first
			toast.info("Create a profile first", {
				description: "You need to set a username before challenging friends",
			});
			setShowUsernameModal(true);
			return;
		}
		setShowChallengeModal(true);
	}, [username]);

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground md:p-8">
			<div className="w-full max-w-md space-y-6">
				{/* Game Header */}
				<div className="flex flex-col items-center justify-between gap-2 text-center md:flex-row md:text-left">
					<div>
						<h1 className="font-sans text-4xl font-bold tracking-normal text-primary md:text-5xl">
							Globetrotter
						</h1>
						<p className="mt-1 text-sm text-muted-foreground md:mt-2 md:text-base">
							The Ultimate Travel Guessing Game
						</p>
					</div>
					{session?.user && (
						<div className="flex items-center gap-2">
							<Avatar>
								<AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
								<AvatarFallback>{session.user.name?.substring(0, 2) || "U"}</AvatarFallback>
							</Avatar>
							{username && (
								<Badge variant="outline" className="text-xs">
									{username}
								</Badge>
							)}
						</div>
					)}
				</div>

				{/* Google Sign In Button (if not signed in) */}
				{!session && !state.isPlaying && (
					<Card className="shadow-sm">
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
					<Card className="shadow-sm">
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
									<p className="text-xl font-bold text-primary">{state.score.total}</p>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Start Game Button */}
				{!state.isPlaying && (
					<Card className="shadow-sm">
						<CardContent className="pt-6">
							<div className="flex flex-col space-y-4">
								<Button
									onClick={handleStartGame}
									size="lg"
									className="w-full bg-primary text-primary-foreground"
								>
									Start Game
								</Button>
								
								<Button
									onClick={() => router.push('/multiplayer')}
									variant="outline"
									size="lg"
									className="w-full"
								>
									<Sword className="mr-2 h-4 w-4" />
									Real-time Multiplayer
								</Button>
								
								{state.challenge && (
									<div className="mb-4 rounded-lg bg-accent p-3 text-center">
										<p className="mb-2 text-sm text-muted-foreground">
											You've been challenged by <span className="font-semibold">{state.challenge.challenger?.username}</span>!
										</p>
										<p className="text-sm font-semibold">
											Their Score: <span className="text-primary">{state.challenge.challenger?.totalScore}</span>
										</p>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				)}

				{/* Game Content */}
				{state.isPlaying && (
					<Card className="shadow-sm">
						{/* Loading State */}
						{(!state.currentDestination || !state.options) && (
							<CardContent className="flex h-40 items-center justify-center">
								<Loader2 className="h-8 w-8 animate-spin text-primary" />
							</CardContent>
						)}

						{/* Clues */}
						{state.currentDestination && state.options && !state.result && (
							<div>
								<CardHeader className="pb-2">
									<CardTitle className="text-center text-xl">Where is this place?</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="rounded-lg bg-muted p-4 text-sm shadow-inner">
										{state.currentDestination.clues.slice(0, state.visibleClues).map((clue, index) => (
											<p key={index} className={cn("mb-2", index > 0 && "mt-3")}>
												<span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
													{index + 1}
												</span>
												{clue}
											</p>
										))}
										{state.visibleClues < state.currentDestination.clues.length && (
											<Button 
												variant="ghost" 
												size="sm" 
												onClick={() => dispatch({ 
													type: 'REVEAL_NEXT_CLUE', 
													payload: state.visibleClues + 1 
												})}
												className="mt-2 w-full border border-dashed border-primary/20 text-xs text-muted-foreground hover:border-primary/50 hover:text-primary"
											>
												Reveal next hint
											</Button>
										)}
									</div>
									<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
										{state.options.map((option) => (
											<Button
												key={option.id}
												onClick={() => handleSelectAnswer(option.id)}
												disabled={!!state.selectedAnswer || isLoadingAnswer}
												variant="outline"
												className={cn(
													"h-auto justify-between py-3 text-left font-normal",
													state.selectedAnswer === option.id
														? "border-primary bg-primary/10"
														: "hover:border-primary/20 hover:bg-primary/5"
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
										<motion.div 
											className="mb-4 rounded-full bg-green-100 p-3 text-green-500 dark:bg-green-900/30"
											initial={{ scale: 0.5, opacity: 0 }}
											animate={{ 
												scale: [0.5, 1.2, 1],
												opacity: 1,
												rotate: [0, 10, -10, 0]
											}}
											transition={{ duration: 0.6 }}
										>
											<motion.svg 
												xmlns="http://www.w3.org/2000/svg" 
												className="h-10 w-10" 
												fill="none" 
												viewBox="0 0 24 24" 
												stroke="currentColor"
												initial={{ pathLength: 0 }}
												animate={{ pathLength: 1 }}
												transition={{ duration: 0.6, delay: 0.2 }}
											>
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</motion.svg>
										</motion.div>
									) : (
										<motion.div 
											className="mb-4 rounded-full bg-red-100 p-3 text-red-500 dark:bg-red-900/30"
											initial={{ scale: 0.5, opacity: 0 }}
											animate={{ 
												scale: [0.5, 1.2, 1],
												opacity: 1,
												rotate: [0, -10, 10, 0]
											}}
											transition={{ duration: 0.6 }}
										>
											<motion.svg 
												xmlns="http://www.w3.org/2000/svg" 
												className="h-10 w-10" 
												fill="none" 
												viewBox="0 0 24 24" 
												stroke="currentColor"
												initial={{ pathLength: 0 }}
												animate={{ pathLength: 1 }}
												transition={{ duration: 0.6, delay: 0.2 }}
											>
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</motion.svg>
										</motion.div>
									)}

									<motion.div
										initial={{ y: -20, opacity: 0 }}
										animate={{ y: 0, opacity: 1 }}
										transition={{ duration: 0.5 }}
									>
										<CardTitle className="mb-2 text-center text-xl">
											{state.result.isCorrect ? "Correct!" : "Oops! Wrong answer."}
										</CardTitle>
									</motion.div>
								
									<motion.p 
										className="mb-2 text-center text-lg"
										initial={{ scale: 0.8, opacity: 0 }}
										animate={{ scale: 1, opacity: 1 }}
										transition={{ duration: 0.5, delay: 0.2 }}
									>
										It's <motion.span 
											className="font-bold"
											initial={{ color: "#6366F1" }}
											animate={{ color: state.result.isCorrect ? "#10B981" : "#EF4444" }}
											transition={{ duration: 0.8 }}
										>
											{state.result.destination?.city}, {state.result.destination?.country}
										</motion.span>
									</motion.p>
								</CardHeader>
								
								<CardContent className="space-y-4">
									{state.result.destination?.cdnImageUrl && (
										<div className="relative mx-auto mb-4 h-48 w-full overflow-hidden rounded-lg shadow-sm sm:h-60">
											<Image
												src={state.result.destination.cdnImageUrl}
												alt={state.result.destination.city}
												fill
												className="object-cover"
												sizes="(max-width: 768px) 100vw, 500px"
												priority
											/>
										</div>
									)}

									<motion.div 
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: 0.3, duration: 0.5 }}
										className="rounded-lg bg-muted p-4 text-sm shadow-inner"
									>
										<div className="flex items-start gap-2">
											<motion.svg 
												xmlns="http://www.w3.org/2000/svg" 
												className="h-5 w-5 flex-shrink-0 text-primary" 
												fill="none" 
												viewBox="0 0 24 24" 
												stroke="currentColor"
												initial={{ rotate: -10, scale: 0.8 }}
												animate={{ rotate: [0, -10, 0, 10, 0], scale: [0.8, 1.2, 1] }}
												transition={{ duration: 0.8 }}
											>
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</motion.svg>
											<motion.p 
												className="italic"
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												transition={{ delay: 0.5, duration: 0.5 }}
											>
												{state.result.fact}
											</motion.p>
										</div>
									</motion.div>
								</CardContent>
								
								<CardFooter>
									<Button
										onClick={handleNextQuestion}
										className="w-full bg-primary text-primary-foreground"
									>
										Next Destination
									</Button>
								</CardFooter>
							</div>
						)}
					</Card>
				)}

				{/* Challenge and Multiplayer Buttons */}
				{state.isPlaying && (
					<div className="grid grid-cols-2 gap-2">
						<Button
							onClick={handleChallengeAFriend}
							variant="outline"
							className="group flex w-full items-center justify-center"
						>
							<Share2 className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
							Challenge Friend
						</Button>
						<Button
							onClick={handleMultiplayer}
							variant="outline"
							className="group flex w-full items-center justify-center"
						>
							<Sword className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
							Multiplayer
						</Button>
					</div>
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

				{/* Share Challenge Modal */}
				<Dialog open={showShareModal} onOpenChange={setShowShareModal}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Challenge Created!</DialogTitle>
							<DialogDescription>
								Share this challenge with your friends. They'll see your score and try to beat it!
							</DialogDescription>
						</DialogHeader>
						
						<div className="mb-4 rounded-lg bg-muted p-4">
							<div className="relative mb-3 h-32 w-full overflow-hidden rounded bg-gradient-to-r from-blue-500 to-purple-500">
								<div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-white">
									<h3 className="mb-1 text-lg font-bold">Globetrotter Challenge</h3>
									<p className="text-center text-sm">
										{username} challenges you!
									</p>
									<div className="mt-2 flex items-center gap-2">
										<div className="rounded bg-white/20 p-1 text-xs">
											Score: {state.score.total}
										</div>
										<div className="rounded bg-green-500/20 p-1 text-xs">
											Correct: {state.score.correct}
										</div>
										<div className="rounded bg-red-500/20 p-1 text-xs">
											Wrong: {state.score.wrong}
										</div>
									</div>
								</div>
							</div>
							
							<div className="relative">
								<Input 
									value={shareUrl}
									readOnly
									className="pr-24"
								/>
								<Button
									size="sm"
									className="absolute right-0 top-0 h-full rounded-l-none"
									onClick={copyToClipboard}
								>
									<Copy className="mr-2 h-4 w-4" />
									Copy
								</Button>
							</div>
						</div>
						
						<DialogFooter className="flex-col sm:flex-col">
							<Button 
								className="w-full bg-green-500 text-white hover:bg-green-600"
								onClick={shareToWhatsApp}
							>
								<MessageCircle className="mr-2 h-5 w-5" />
								Share via WhatsApp
							</Button>
							<Button 
								variant="outline" 
								className="mt-2 w-full"
								onClick={() => setShowShareModal(false)}
							>
								Close
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
			
			{/* Animations for answers */}
			{showConfetti && <Confetti />}
			{showSadFace && <SadFace />}
		</div>
	);
}
