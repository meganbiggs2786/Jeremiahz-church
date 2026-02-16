import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { AuthProvider, useAuth } from '@/hooks/use-auth';

function TRPCProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'https://tuath-coir-worker.your-subdomain.workers.dev/trpc', // Update with actual URL
          headers() {
            return {
              Authorization: `Bearer tc_owner_secret_2024`,
            };
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <TRPCProvider>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: '#000',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerShown: false,
          }}
        />
      </TRPCProvider>
    </AuthProvider>
  );
}
