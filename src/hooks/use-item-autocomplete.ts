import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useMemo } from 'react';
import { MapleStoryAPI } from '@/lib/api';

export interface AutocompleteItem {
  id: number;
  name: string;
  category: string;
  subCategory: string;
  icon: string;
}

// 디바운스 훅
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useItemAutocomplete(
  query: string,
  overallCategory: string,
  category: string,
  subCategory: string,
  enabled: boolean = true
) {
  // 검색어 디바운싱 (300ms)
  const debouncedQuery = useDebounce(query.trim(), 300);
  
  // 자동완성은 최소 2글자 이상부터 시작
  const shouldFetch = enabled && debouncedQuery.length >= 2;

  // 아이템 데이터 가져오기 (카테고리별로 500개씩)
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['autocompleteItems', overallCategory, category, subCategory],
    queryFn: async () => {
      const api = new MapleStoryAPI();
      const result = await api.getItemsByCategory({
        overallCategory,
        category,
        subCategory,
        count: 500 // 자동완성용으로 500개만 가져오기
      });
      return result.map((item: any): AutocompleteItem => ({
        id: item.id,
        name: item.name,
        category: item.category,
        subCategory: item.subCategory,
        icon: item.icon
      }));
    },
    enabled: shouldFetch && !!(overallCategory && category && subCategory),
    staleTime: 1000 * 60 * 5, // 5분간 fresh
    gcTime: 1000 * 60 * 10, // 10분 캐시 유지
  });

  // 검색어에 매칭되는 아이템 필터링
  const suggestions = useMemo(() => {
    if (!shouldFetch || !debouncedQuery || !items.length) {
      return [];
    }

    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(debouncedQuery.toLowerCase())
    );

    // 정확한 매치를 우선으로 정렬
    const sorted = filtered.sort((a, b) => {
      const aExact = a.name.toLowerCase().startsWith(debouncedQuery.toLowerCase());
      const bExact = b.name.toLowerCase().startsWith(debouncedQuery.toLowerCase());
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      return a.name.localeCompare(b.name, 'ko');
    });

    // 최대 10개까지만 반환
    return sorted.slice(0, 10);
  }, [items, debouncedQuery, shouldFetch]);

  return {
    suggestions,
    isLoading: isLoading && shouldFetch,
    query: debouncedQuery
  };
}