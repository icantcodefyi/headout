import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const gameRouter = createTRPCRouter({
  // Get a random destination with clues
  getRandomDestination: publicProcedure.query(async ({ ctx }) => {
    const destinationsCount = await ctx.db.destination.count();
    const skip = Math.floor(Math.random() * destinationsCount);
    const destination = await ctx.db.destination.findFirst({
      skip,
      select: {
        id: true,
        clues: true,
      },
    });
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

      // Get random destinations excluding the current one
      const randomDestinations = await ctx.db.destination.findMany({
        where: {
          id: { not: input.currentDestinationId },
        },
        select: {
          id: true,
          city: true,
          country: true,
        },
        take: input.count - 1,
        orderBy: {
          city: "asc", // Using a consistent order, we'll shuffle on the client
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
      challengedUsername: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const challenger = await ctx.db.userProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });

      if (!challenger) {
        throw new Error("Profile not found");
      }

      let challengedId = null;
      if (input.challengedUsername) {
        const challenged = await ctx.db.userProfile.findUnique({
          where: { username: input.challengedUsername },
          select: { id: true },
        });
        if (challenged) {
          challengedId = challenged.id;
        }
      }

      return ctx.db.challenge.create({
        data: {
          challengerId: challenger.id,
          challengedId,
        },
      });
    }),

  // Get challenge by ID
  getChallengeById: publicProcedure
    .input(z.object({
      challengeId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return ctx.db.challenge.findUnique({
        where: { id: input.challengeId },
        include: {
          challenger: {
            select: {
              username: true,
              correctCount: true,
              wrongCount: true,
              totalScore: true,
            },
          },
        },
      });
    }),
}); 