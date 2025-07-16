import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchItemStats } from '@/lib/item-stats-fetcher';

export function useItemStats(itemId: number, enabled: boolean = true) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['itemStats', itemId],
    queryFn: () => fetchItemStats(itemId),
    enabled,
    staleTime: 1000 * 60 * 10, // 10분간 fresh (아이템 스탯은 거의 변하지 않음)
    gcTime: 1000 * 60 * 60, // 1시간 캐시 유지
    retry: 2,
  });

  const retry = () => {
    queryClient.invalidateQueries({ queryKey: ['itemStats', itemId] });
  };

  return {
    ...query,
    retry
  };
}