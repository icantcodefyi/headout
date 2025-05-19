import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

// Keep track of recently used destinations to avoid repetition
const recentDestinations = new Set<string>();
const MAX_RECENT_DESTINATIONS = 10;

export const gameRouter = createTRPCRouter({
  // Get a random destination with clues
  getRandomDestination: publicProcedure
    .input(z.object({
      previousIds: z.array(z.string()).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const destinationsCount = await ctx.db.destination.count();
      
      // Get a list of IDs to exclude (previously seen)
      const excludeIds = input?.previousIds || Array.from(recentDestinations);
      
      // Try to get a destination that hasn't been seen recently
      let destination;
      let attempts = 0;
      const maxAttempts = 3; // Limit attempts to prevent infinite loops
      
      while (!destination && attempts < maxAttempts) {
        attempts++;
        
        // Generate a truly random skip value
        const skip = Math.floor(Math.random() * (destinationsCount - 1));
        
        // Find a destination that's not in the excluded list
        destination = await ctx.db.destination.findFirst({
          where: {
            id: {
              notIn: excludeIds.length > 0 ? excludeIds : undefined,
            },
          },
          skip,
          select: {
            id: true,
            clues: true,
          },
          orderBy: {
            // Add some extra randomness with a secondary ordering
            city: Math.random() > 0.5 ? 'asc' : 'desc',
          },
        });
      }
      
      // If we couldn't find a new destination after attempts, get any random one
      if (!destination) {
        const randomSkip = Math.floor(Math.random() * destinationsCount);
        destination = await ctx.db.destination.findFirst({
          skip: randomSkip,
          select: {
            id: true,
            clues: true,
          },
        });
      }
      
      // Track this destination to avoid showing it again soon
      if (destination) {
        // Add to recent destinations
        recentDestinations.add(destination.id);
        
        // Keep the recents list from growing too large
        if (recentDestinations.size > MAX_RECENT_DESTINATIONS) {
          const oldestId = recentDestinations.values().next().value;
          if (oldestId) {
            recentDestinations.delete(oldestId);
          }
        }
      }
      
      return destination;
    }),

  // Get multiple destinations for multiple choice
  getDestinationOptions: publicProcedure
    .input(z.object({
      currentDestinationId: z.string(),
      count: z.number().min(2).max(4).default(3),
    }))
    .query(async ({ ctx, input }) => {
      // Get the current destination to include it in the options
      const currentDestination = await ctx.db.destination.findUnique({
        where: { id: input.currentDestinationId },
        select: { id: true, city: true, country: true },
      });

      if (!currentDestination) {
        throw new Error("Destination not found");
      }

      // Get random destinations excluding the current one and any that are too similar
      const randomDestinations = await ctx.db.destination.findMany({
        where: {
          id: { not: input.currentDestinationId },
          // Add some difficulty by including destinations from the same country occasionally
          // but make sure they're not too similar
          OR: [
            { country: { not: currentDestination.country } },
            { 
              AND: [
                { country: currentDestination.country },
                { city: { not: { contains: currentDestination.city.substring(0, 3) } } }
              ]
            }
          ]
        },
        select: {
          id: true,
          city: true,
          country: true,
        },
        take: input.count - 1,
        // Use randomized ordering
        orderBy: {
          id: Math.random() > 0.5 ? 'asc' : 'desc',
        },
      });

      // Combine and shuffle options
      const options = [...randomDestinations, currentDestination];
      return options.sort(() => Math.random() - 0.5);
    }),

  // Check answer and get fun facts
  checkAnswer: publicProcedure
    .input(z.object({
      destinationId: z.string(),
      answerId: z.string(),
      profileId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const destination = await ctx.db.destination.findUnique({
        where: { id: input.destinationId },
        select: {
          id: true,
          city: true,
          country: true,
          funFacts: true,
          trivia: true,
          cdnImageUrl: true,
        },
      });

      if (!destination) {
        throw new Error("Destination not found");
      }

      // Check if the answer is correct
      const isCorrect = destination.id === input.answerId;
      
      // Select a random fun fact or trivia fact
      const facts = [...destination.funFacts, ...destination.trivia];
      const randomFact = facts[Math.floor(Math.random() * facts.length)];

      // If we have a profile ID, update their stats
      if (input.profileId) {
        await ctx.db.userProfile.update({
          where: { id: input.profileId },
          data: {
            correctCount: { increment: isCorrect ? 1 : 0 },
            wrongCount: { increment: isCorrect ? 0 : 1 },
            totalScore: { increment: isCorrect ? 10 : 0 },
            games: {
              create: {
                destinationId: input.destinationId,
                isCorrect,
              },
            },
          },
        });
      }

      return {
        isCorrect,
        destination,
        fact: randomFact,
      };
    }),

  // Create or update user profile
  upsertProfile: protectedProcedure
    .input(z.object({
      username: z.string().min(3).max(20),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userProfile.upsert({
        where: { userId: ctx.session.user.id },
        update: { username: input.username },
        create: {
          userId: ctx.session.user.id,
          username: input.username,
        },
      });
    }),

  // Get profile by user ID
  getProfileByUserId: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.userProfile.findUnique({
      where: { userId: ctx.session.user.id },
    });
  }),

  // Get profile by username
  getProfileByUsername: publicProcedure
    .input(z.object({
      username: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.userProfile.findUnique({
        where: { username: input.username },
        select: {
          id: true,
          username: true,
          correctCount: true,
          wrongCount: true,
          totalScore: true,
        },
      });
    }),

  // Create a challenge
  createChallenge: protectedProcedure
    .input(z.object({
      currentScore: z.object({
        correct: z.number(),
        wrong: z.number(),
        total: z.number()
      })
    }).optional())
    .mutation(async ({ ctx, input }) => {
      const profile = await ctx.db.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!profile) {
        throw new Error("Profile not found");
      }

      // Use current game session score if provided, otherwise use profile totals
      const challengeData = {
        challengerId: profile.id,
        sessionScore: input?.currentScore ? input.currentScore.total : profile.totalScore,
        sessionCorrect: input?.currentScore ? input.currentScore.correct : profile.correctCount,
        sessionWrong: input?.currentScore ? input.currentScore.wrong : profile.wrongCount,
      };

      return ctx.db.challenge.create({
        data: challengeData,
        include: {
          challenger: {
            select: {
              username: true
            }
          }
        }
      });
    }),

  // Create a direct challenge to a specific user by username
  createDirectChallenge: protectedProcedure
    .input(z.object({
      username: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get the challenger's profile
      const challengerProfile = await ctx.db.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!challengerProfile) {
        throw new Error("Your profile not found. Please create a profile first.");
      }

      // Find the target user by username
      const targetProfile = await ctx.db.userProfile.findUnique({
        where: { username: input.username },
      });

      if (!targetProfile) {
        throw new Error(`User with username '${input.username}' not found`);
      }

      // Create the challenge with the target user directly linked
      return ctx.db.challenge.create({
        data: {
          challengerId: challengerProfile.id,
          challengedId: targetProfile.id,
          status: "PENDING",
        },
        include: {
          challenged: {
            select: {
              username: true,
            },
          },
        },
      });
    }),

  // Get a challenge by ID
  getChallenge: publicProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.challenge.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          status: true,
          sessionScore: true,
          sessionCorrect: true,
          sessionWrong: true,
          challenger: {
            select: {
              id: true,
              username: true,
              totalScore: true,
              correctCount: true,
              wrongCount: true,
            },
          },
        },
      });
    }),
}); 