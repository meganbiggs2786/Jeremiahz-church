import { router } from './trpc';
import { productsRouter } from './routers/products';
import { statsRouter } from './routers/stats';
import { ordersRouter } from './routers/orders';

export const appRouter = router({
  products: productsRouter,
  stats: statsRouter,
  orders: ordersRouter,
});

export type AppRouter = typeof appRouter;
