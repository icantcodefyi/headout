import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { type Prisma } from "@prisma/client";

// Schema for destination creation/update
const destinationSchema = z.object({
  id: z.string().optional(),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  clues: z.array(z.string()).min(1, "At least one clue is required"),
  funFacts: z.array(z.string()).default([]),
  trivia: z.array(z.string()).default([]),
  cdnImageUrl: z.string().url().optional().nullable(),
});

// Admin check middleware
const isAdminMiddleware = async ({ ctx, next }: { ctx: any; next: () => Promise<any> }) => {
  // For simplicity, check if the user's email is in our admin list
  // In a production app, you would check a proper role field
  const adminEmails = ['venti.sillly@gmail.com', 'adubge@gmail.com']; // Match the list in check-admin API
  
  // Convert emails to lowercase for case-insensitive comparison
  const userEmail = ctx.session?.user?.email?.toLowerCase() || '';
  const isAdmin = adminEmails.some(email => email.toLowerCase() === userEmail);
  
  console.log('TRPC Admin check:', { 
    userEmail, 
    isAdmin,
    session: ctx.session?.user?.email
  });
  
  if (!ctx.session?.user?.email || !isAdmin) {
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: 'You need administrator privileges to access this resource' 
    });
  }
  
  return next();
};

export const adminRouter = createTRPCRouter({
  // Get all destinations with pagination
  getAllDestinations: protectedProcedure
    .use(isAdminMiddleware)
    .input(z.object({
      skip: z.number().default(0),
      take: z.number().default(10),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { skip, take, search } = input;
      
      // Define where clause with proper Prisma types
      const where: Prisma.DestinationWhereInput = search 
        ? {
            OR: [
              { city: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
              { country: { contains: search, mode: 'insensitive' as Prisma.QueryMode } },
            ],
          } 
        : {};
      
      const [destinations, total] = await Promise.all([
        ctx.db.destination.findMany({
          where,
          skip,
          take,
          orderBy: { city: 'asc' },
        }),
        ctx.db.destination.count({ where }),
      ]);
      
      return {
        destinations,
        total,
        pageCount: Math.ceil(total / take),
      };
    }),
  
  // Get a single destination by ID
  getDestination: protectedProcedure
    .use(isAdminMiddleware)
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const destination = await ctx.db.destination.findUnique({
        where: { id: input.id },
      });
      
      if (!destination) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Destination not found',
        });
      }
      
      return destination;
    }),
  
  // Create a new destination
  createDestination: protectedProcedure
    .use(isAdminMiddleware)
    .input(destinationSchema.omit({ id: true }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.destination.create({
        data: input,
      });
    }),
  
  // Update an existing destination
  updateDestination: protectedProcedure
    .use(isAdminMiddleware)
    .input(destinationSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      
      if (!id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Destination ID is required for updates',
        });
      }
      
      const existing = await ctx.db.destination.findUnique({
        where: { id },
      });
      
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Destination not found',
        });
      }
      
      return ctx.db.destination.update({
        where: { id },
        data,
      });
    }),
  
  // Delete a destination
  deleteDestination: protectedProcedure
    .use(isAdminMiddleware)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.destination.findUnique({
        where: { id: input.id },
      });
      
      if (!existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Destination not found',
        });
      }
      
      // First, delete any related player games if they exist
      // Check if the model exists before trying to access it
      try {
        // @ts-ignore - We'll handle this dynamically at runtime
        if (ctx.db.playerGame) {
          // @ts-ignore
          await ctx.db.playerGame.deleteMany({
            where: { destinationId: input.id },
          });
        }
      } catch (error) {
        console.log('No playerGame model found or other error occurred:', error);
      }
      
      // Then delete the destination
      return ctx.db.destination.delete({
        where: { id: input.id },
      });
    }),
    
  // Get destination stats
  getDestinationStats: protectedProcedure
    .use(isAdminMiddleware)
    .query(async ({ ctx }) => {
      const [totalDestinations, topDestinations] = await Promise.all([
        ctx.db.destination.count(),
        ctx.db.destination.findMany({
          take: 5,
          orderBy: {
            games: {
              _count: 'desc',
            },
          },
          include: {
            _count: {
              select: {
                games: true,
              },
            },
          },
        }),
      ]);
      
      return {
        totalDestinations,
        topDestinations: topDestinations.map(dest => ({
          id: dest.id,
          city: dest.city,
          country: dest.country,
          gamesCount: dest._count.games,
        })),
      };
    }),
}); 