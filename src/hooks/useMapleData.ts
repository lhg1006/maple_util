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

export const useMapleNPC = (id: number) => {
  return useQuery({
    queryKey: ['npc', id],
    queryFn: () => mapleAPI.getNPC(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
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

export const useMapleJob = (id: number) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => mapleAPI.getJob(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
};

export const useMapleSkill = (id: number) => {
  return useQuery({
    queryKey: ['skill', id],
    queryFn: () => mapleAPI.getSkill(id),
    enabled: !!id,
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
    enabled: enabled && query.length > 2,
    staleTime: 1000 * 60 * 2,
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