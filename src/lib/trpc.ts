import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@/server/root';

export const trpc = createTRPCReact<AppRouter>();

export const getBaseUrl = () => {
  // Update this to your deployed Cloudflare Worker URL
  return 'https://tuath-coir-command-center.your-subdomain.workers.dev';
};

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/trpc`,
      // Add Authorization header here if needed
      headers() {
        return {
          Authorization: 'Bearer tc_owner_secret_2024',
        };
      },
    }),
  ],
});
