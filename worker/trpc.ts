import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';

export const createContext = ({ req, resHeaders, env }) => {
  const authHeader = req.headers.get('Authorization');
  const ownerKey = env.OWNER_KEY || 'tc_owner_secret_2024'; // Default for dev if not set

  const isAuthorized = authHeader === `Bearer ${ownerKey}`;

  return {
    env,
    isAuthorized,
  };
};

const t = initTRPC.context().create();

const isOwner = t.middleware(({ ctx, next }) => {
  if (!ctx.isAuthorized) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      ...ctx,
    },
  });
});

const ownerProcedure = t.procedure.use(isOwner);

export const appRouter = t.router({
  // Notes
  notes: t.router({
    listShared: ownerProcedure.query(async ({ ctx }) => {
      const { results } = await ctx.env.DB.prepare(
        'SELECT id, author_id as authorId, author_name as authorName, category, content, created_at as createdAt FROM notes ORDER BY created_at DESC LIMIT 50'
      ).all();
      return results;
    }),
    create: ownerProcedure
      .input(z.object({
        content: z.string().min(1),
        category: z.enum(['product_feedback', 'design', 'marketing', 'sales', 'general']),
        authorId: z.string().optional(),
        authorName: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const authorId = input.authorId || 'owner';
        const authorName = input.authorName || 'Owner';

        await ctx.env.DB.prepare(
          'INSERT INTO notes (author_id, author_name, content, category, created_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(authorId, authorName, input.content, input.category, new Date().toISOString()).run();

        // Log activity
        await ctx.env.DB.prepare(
          'INSERT INTO activity_logs (action, description, created_at) VALUES (?, ?, ?)'
        ).bind('note_created', `New ${input.category} note posted`, new Date().toISOString()).run();

        return { success: true };
      }),
  }),

  // Activity
  activity: t.router({
    list: ownerProcedure.query(async ({ ctx }) => {
      const { results } = await ctx.env.DB.prepare(
        'SELECT id, action, description, metadata, created_at as createdAt FROM activity_logs ORDER BY created_at DESC LIMIT 50'
      ).all();
      return results;
    }),
  }),

  // Orders Management
  orders: t.router({
    list: ownerProcedure.query(async ({ ctx }) => {
      const { results } = await ctx.env.DB.prepare(
        'SELECT id, order_number as orderNumber, customer_email as customerEmail, total_amount as totalAmount, payment_status as paymentStatus, status, created_at as createdAt FROM orders ORDER BY created_at DESC LIMIT 50'
      ).all();
      return results;
    }),
  }),

  // Sales Stats
  sales: t.router({
    stats: ownerProcedure.query(async ({ ctx }) => {
      const stats = await ctx.env.DB.prepare(`
        SELECT
          COUNT(*) as totalOrders,
          SUM(total_amount) as totalRevenue,
          SUM(profit_amount) as totalProfit
        FROM orders
        WHERE payment_status = 'paid'
      `).first();

      const recentSales = await ctx.env.DB.prepare(`
        SELECT total_amount as totalAmount, created_at as createdAt
        FROM orders
        WHERE payment_status = 'paid'
        ORDER BY created_at DESC LIMIT 10
      `).all();

      return {
        summary: stats,
        recent: recentSales.results
      };
    }),
  }),

  // Members
  members: t.router({
    list: ownerProcedure.query(async ({ ctx }) => {
      const { results } = await ctx.env.DB.prepare(
        'SELECT id, name, email, territory, created_at as createdAt FROM members ORDER BY created_at DESC LIMIT 50'
      ).all();
      return results;
    }),
  }),
});

export type AppRouter = typeof appRouter;
