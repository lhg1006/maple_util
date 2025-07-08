'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { mapleAPI } from '@/lib/api';
import { MapleItem, MapleNPC, MapleMob, MapleJob, MapleSkill } from '@/types/maplestory';

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

export const useNPCList = (params: { startPosition?: number; count?: number }) => {
  return useQuery({
    queryKey: ['npcs', params],
    queryFn: () => mapleAPI.getNPCsByCategory(params),
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

// 전체 맵 데이터를 배치로 가져오는 훅
export const useAllMaps = () => {
  return useQuery({
    queryKey: ['maps', 'all'],
    queryFn: async () => {
      console.log('🗺️ 전체 맵 데이터 로딩 시작...');
      const allMaps = [];
      let startPosition = 0;
      const batchSize = 5000;
      let batchCount = 0;
      
      while (true) {
        batchCount++;
        console.log(`📦 배치 ${batchCount} 로딩 중... (위치: ${startPosition})`);
        
        const batch = await mapleAPI.getMaps({ startPosition, count: batchSize });
        allMaps.push(...batch);
        
        console.log(`✅ 배치 ${batchCount} 완료: ${batch.length}개 맵 (총 ${allMaps.length}개)`);
        
        // API에서 반환된 맵의 수가 요청한 수보다 적으면 마지막 배치
        if (batch.length < batchSize) {
          console.log(`🏁 전체 맵 로딩 완료: ${allMaps.length}개 맵`);
          break;
        }
        
        startPosition += batchSize;
        
        // 무한 루프 방지 (최대 50,000개 맵)
        if (startPosition >= 50000) {
          console.warn('⚠️ 맵 수 제한에 도달하여 로딩 중단');
          break;
        }
      }
      
      return allMaps;
    },
    staleTime: 1000 * 60 * 60, // 1시간 캐시 (전체 데이터는 더 오래 캐시)
    gcTime: 1000 * 60 * 120, // 2시간 가비지 컬렉션
  });
};

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
    queryFn: () => mapleAPI.getJob(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 10,
  });
};

export const useMapleSkill = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['skill', id],
    queryFn: () => mapleAPI.getSkill(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 10,
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
    queryFn: () => mapleAPI.getJobs(),
    staleTime: 1000 * 60 * 30, // 30분 캐시 (정적 데이터)
  });
};

// Skills hooks
export const useSkills = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: () => mapleAPI.getSkills(),
    staleTime: 1000 * 60 * 30, // 30분 캐시 (정적 데이터)
  });
};