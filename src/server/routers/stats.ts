import { publicProcedure, router } from '../trpc';

export const statsRouter = router({
  get: publicProcedure.query(() => {
    return {
      today_orders: 12,
      today_revenue: "1,240.00",
      today_profit: "840.00",
      week_orders: 84,
      week_revenue: "8,680.00",
      week_profit: "5,880.00",
      total_orders: 1240,
      total_revenue: "128,400.00",
      total_profit: "87,312.00",
      pending_orders: 3,
      integrations: {
        stripe: true,
        printful: true,
        eprolo: false,
        zendrop: true,
      }
    };
  }),
});
