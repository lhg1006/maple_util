import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분간 fresh
      gcTime: 1000 * 60 * 30, // 30분간 캐시 유지 (구 cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});