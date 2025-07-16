'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { mapleAPI } from '@/lib/api';

export const useMapleItem = (id: number) => {
  return useQuery({
    queryKey: ['item', id],
    queryFn: () => mapleAPI.getItem(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useMapleNPC = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['npc', id],
    queryFn: () => mapleAPI.getNPC(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useNPCList = (params: { startPosition?: number; count?: number }, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['npcs', params],
    queryFn: () => mapleAPI.getNPCsByCategory(params),
    enabled: enabled,
    staleTime: 1000 * 60 * 5,
  });
};

export const useAllNPCs = () => {
  return useQuery({
    queryKey: ['npcs', 'all'],
    queryFn: () => mapleAPI.getAllNPCs(),
    staleTime: 1000 * 60 * 10, // 10분 캐시
  });
};

export const useNPCsWithDetails = (params: { startPosition?: number; count?: number }) => {
  return useQuery({
    queryKey: ['npcs', 'details', params],
    queryFn: () => mapleAPI.getNPCsByCategory({ ...params, includeDetails: true }),
    staleTime: 1000 * 60 * 5,
  });
};

export const useMaps = (params: { startPosition?: number; count?: number } = {}) => {
  return useQuery({
    queryKey: ['maps', params],
    queryFn: () => mapleAPI.getMaps(params),
    staleTime: 1000 * 60 * 30, // 30분 캐시 (맵은 자주 변하지 않음)
  });
};

// API에서 전체 맵 데이터를 가져오는 훅
export const useAllMaps = () => {
  return useQuery({
    queryKey: ['maps', 'all'],
    queryFn: async () => {
      console.log('🌐 API에서 맵 데이터 로딩...');
      const maps = await mapleAPI.getMaps({ startPosition: 0, count: 5000 });
      console.log(`✅ API 맵 데이터 로딩 완료: ${maps.length}개 맵`);
      return maps;
    },
    staleTime: 1000 * 60 * 30, // 30분 캐시
    gcTime: 1000 * 60 * 60, // 1시간 가비지 컬렉션
  });
};

// 맵 요약 통계를 가져오는 훅 (제거됨 - useAllMaps 사용)
// export const useMapsSummary = () => {
//   return useQuery({
//     queryKey: ['maps', 'summary'],
//     queryFn: async () => {
//       const response = await fetch('/maps-summary.json');
//       if (!response.ok) {
//         throw new Error('맵 요약 데이터를 불러올 수 없습니다');
//       }
//       return response.json();
//     },
//     staleTime: 1000 * 60 * 60 * 24, // 24시간 캐시
//   });
// };

export const useNPCsByMap = (mapId: number | null) => {
  return useQuery({
    queryKey: ['npcs', 'map', mapId],
    queryFn: () => mapleAPI.getNPCsByMap(mapId!),
    enabled: !!mapId,
    staleTime: 1000 * 60 * 10, // 10분 캐시
    retry: (failureCount, error: any) => {
      // 404 에러는 재시도하지 않음
      if (error?.response?.status === 404) {
        return false;
      }
      // 다른 에러는 최대 2번 재시도
      return failureCount < 2;
    },
  });
};

export const useMapleMob = (id: number) => {
  return useQuery({
    queryKey: ['mob', id],
    queryFn: () => mapleAPI.getMob(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useMapleJob = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const response = await fetch('/jobs.json');
      if (!response.ok) {
        throw new Error('직업 데이터를 불러올 수 없습니다');
      }
      const jobs = await response.json();
      const job = jobs.find((j: any) => j.id === id);
      if (!job) {
        throw new Error(`직업 ID ${id}를 찾을 수 없습니다`);
      }
      return job;
    },
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 60 * 24, // 24시간 캐시 (정적 데이터)
  });
};

export const useMapleSkill = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['skill', id],
    queryFn: async () => {
      const response = await fetch('/skills.json');
      if (!response.ok) {
        throw new Error('스킬 데이터를 불러올 수 없습니다');
      }
      const skills = await response.json();
      const skill = skills.find((s: any) => s.id === id);
      if (!skill) {
        throw new Error(`스킬 ID ${id}를 찾을 수 없습니다`);
      }
      return skill;
    },
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 60 * 24, // 24시간 캐시 (정적 데이터)
  });
};

export const useSearchItems = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['search', 'items', query],
    queryFn: () => mapleAPI.searchItems(query),
    enabled: enabled && query.length > 2,
    staleTime: 1000 * 60 * 2,
  });
};

// 카테고리 내 검색용 훅
export const useSearchItemsInCategory = (
  overallCategory: string,
  category: string,
  subCategory: string,
  searchQuery: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['search', 'items', 'category', overallCategory, category, subCategory, searchQuery],
    queryFn: () => mapleAPI.getItemsByCategory({
      overallCategory: overallCategory,
      category: category,
      subCategory: subCategory,
      searchFor: searchQuery.trim(),
      count: 200 // 검색 결과는 200개까지
    }),
    enabled: enabled && 
             !!overallCategory && 
             !!category && 
             !!subCategory && 
             searchQuery.trim().length > 1,
    staleTime: 1000 * 60 * 5, // 5분 캐시
    gcTime: 1000 * 60 * 15, // 15분 가비지 컬렉션
  });
};

export const useItemsByCategory = (
  overallCategory: string, 
  category: string, 
  subCategory: string,
  startPosition: number = 0,
  count: number = 500,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['items', 'category', overallCategory, category, subCategory, startPosition, count],
    queryFn: () => mapleAPI.getItemsByCategory({
      overallCategory: overallCategory,
      category: category,
      subCategory: subCategory,
      startPosition,
      count
    }),
    enabled: enabled && !!overallCategory && !!category && !!subCategory,
    staleTime: 1000 * 60 * 10, // 10분 캐시
    gcTime: 1000 * 60 * 30, // 30분 가비지 컬렉션
  });
};

// 무한 스크롤을 위한 아이템 카테고리 훅
export const useInfiniteItemsByCategory = (
  overallCategory: string, 
  category: string, 
  subCategory: string,
  batchSize: number = 500,
  enabled: boolean = true
) => {
  return useInfiniteQuery({
    queryKey: ['items', 'infinite', overallCategory, category, subCategory, batchSize],
    queryFn: ({ pageParam = 0 }) => mapleAPI.getItemsByCategory({
      overallCategory: overallCategory,
      category: category,
      subCategory: subCategory,
      startPosition: pageParam,
      count: batchSize
    }),
    enabled: enabled && !!overallCategory && !!category && !!subCategory,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // 마지막 페이지가 배치 크기보다 작으면 더 이상 데이터가 없음
      if (lastPage.length < batchSize) {
        return undefined;
      }
      // 다음 페이지의 시작 위치 계산
      return allPages.reduce((total, page) => total + page.length, 0);
    },
    staleTime: 1000 * 60 * 10, // 10분 캐시
    gcTime: 1000 * 60 * 30, // 30분 가비지 컬렉션
  });
};

export const useSearchNPCs = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['search', 'npcs', query],
    queryFn: () => mapleAPI.searchNPCs(query),
    enabled: enabled && query.length >= 2,
    staleTime: 1000 * 60 * 10, // 10분 캐시
    gcTime: 1000 * 60 * 30, // 30분 가비지 컬렉션
  });
};

export const useSearchMobs = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['search', 'mobs', query],
    queryFn: () => mapleAPI.searchMobs(query),
    enabled: enabled && query.length > 2,
    staleTime: 1000 * 60 * 2,
  });
};

// Jobs hooks
export const useJobs = () => {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      console.log('🎯 정적 직업 데이터 로딩...');
      const response = await fetch('/jobs.json');
      if (!response.ok) {
        throw new Error('직업 데이터를 불러올 수 없습니다');
      }
      const jobs = await response.json();
      console.log(`✅ 정적 직업 데이터 로딩 완료: ${jobs.length}개 직업`);
      return jobs;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24시간 캐시 (정적 데이터)
  });
};

// Skills hooks
export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      console.log('🎯 정적 스킬 데이터 로딩...');
      const response = await fetch('/skills.json');
      if (!response.ok) {
        throw new Error('스킬 데이터를 불러올 수 없습니다');
      }
      const skills = await response.json();
      console.log(`✅ 정적 스킬 데이터 로딩 완료: ${skills.length}개 스킬`);
      return skills;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24시간 캐시 (정적 데이터)
  });
};