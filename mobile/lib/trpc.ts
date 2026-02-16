import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../worker/trpc'; // This will need to be accessible

export const trpc = createTRPCReact<AppRouter>();
