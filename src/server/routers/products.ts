import { publicProcedure, router } from '../trpc';

export const productsRouter = router({
  list: publicProcedure.query(() => {
    return [
      { id: 1, name: "Tuath Coir OG Hoodie", category: "hoodies", status: "active", description: "Heavyweight tactical streetwear hoodie." },
      { id: 2, name: "Street Justice Tee", category: "apparel", status: "active", description: "Breathable cotton tee with Celtic knot design." },
      { id: 3, name: "Combat Hygiene Kit", category: "hygiene_kits", status: "active", description: "Essential hygiene supplies for the street." },
      { id: 4, name: "Shadow Runner Joggers", category: "apparel", status: "out_of_stock", description: "Reinforced joggers for urban operations." },
    ];
  }),
});
