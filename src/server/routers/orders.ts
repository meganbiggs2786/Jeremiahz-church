import { publicProcedure, router } from '../trpc';

export const ordersRouter = router({
  recent: publicProcedure.query(() => {
    return [
      {
        id: "TC-9001",
        customer_name: "John Doe",
        customer_email: "john@example.com",
        total_amount: 120.00,
        profit_amount: 85.00,
        payment_status: "paid",
        fulfillment_status: "processing",
        created_at: new Date().toISOString(),
      },
      {
        id: "TC-9002",
        customer_name: "Jane Smith",
        customer_email: "jane@example.com",
        total_amount: 45.00,
        profit_amount: 30.00,
        payment_status: "pending",
        fulfillment_status: "unfulfilled",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "TC-9003",
        customer_name: "Marcus Wright",
        customer_email: "marcus@justice.com",
        total_amount: 250.00,
        profit_amount: 175.00,
        payment_status: "paid",
        fulfillment_status: "shipped",
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  }),
});
